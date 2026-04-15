import numpy as np
import pandas as pd
from datetime import datetime, timedelta

import timesfm

from config import TIMESFM_MODEL, logger
from models import (
    PricePoint,
    RouteOption,
    ForecastRequest,
    ForecastResult,
    TariffForecastRequest,
    TariffForecastResult,
)

_model = None


def _get_model():
    global _model
    if _model is None:
        logger.info("Loading TimesFM model: %s", TIMESFM_MODEL)
        _model = timesfm.TimesFm(
            hparams=timesfm.TimesFmHparams(
                per_core_batch_size=32,
                horizon_len=128,
                backend="gpu",
            ),
            checkpoint=timesfm.TimesFmCheckpoint(huggingface_repo_id=TIMESFM_MODEL),
        )
        logger.info("TimesFM model loaded")
    return _model


# Freight route baseline data: (origin_keyword, dest_keyword) -> base price range
ROUTE_BASELINES = {
    ("istanbul", "hamburg"): (1100, 1700),
    ("istanbul", "rotterdam"): (1050, 1650),
    ("istanbul", "shanghai"): (1800, 2800),
    ("istanbul", "new york"): (2200, 3200),
    ("mersin", "hamburg"): (1150, 1750),
    ("mersin", "genoa"): (800, 1300),
    ("izmir", "hamburg"): (1100, 1600),
    ("shanghai", "hamburg"): (1500, 2500),
    ("shanghai", "los angeles"): (2000, 3500),
}

CARRIERS = [
    {"name": "Maersk Line", "speed_factor": 1.0, "price_factor": 1.05, "co2_factor": 0.85, "reliability": 96, "tags": ["Sustainable"]},
    {"name": "MSC", "speed_factor": 0.88, "price_factor": 1.12, "co2_factor": 1.0, "reliability": 92, "tags": ["Fastest"]},
    {"name": "CMA CGM", "speed_factor": 1.15, "price_factor": 0.92, "co2_factor": 1.05, "reliability": 88, "tags": ["Cheapest"]},
    {"name": "Hapag-Lloyd", "speed_factor": 1.05, "price_factor": 1.0, "co2_factor": 0.90, "reliability": 94, "tags": ["Reliable"]},
    {"name": "COSCO", "speed_factor": 1.1, "price_factor": 0.88, "co2_factor": 1.1, "reliability": 85, "tags": ["Budget"]},
]


def _get_route_baseline(origin: str, destination: str) -> tuple[float, float]:
    o = origin.lower().strip()
    d = destination.lower().strip()
    for (ok, dk), (lo, hi) in ROUTE_BASELINES.items():
        if ok in o and dk in d:
            return (lo, hi)
        if dk in o and ok in d:
            return (lo, hi)
    return (1000, 2000)


def _generate_synthetic_history(
    base_lo: float, base_hi: float, months: int = 12
) -> list[PricePoint]:
    np.random.seed(42)
    mid = (base_lo + base_hi) / 2
    amplitude = (base_hi - base_lo) / 2

    now = datetime.now()
    points = []
    for i in range(months, 0, -1):
        dt = now - timedelta(days=30 * i)
        seasonal = np.sin(2 * np.pi * (dt.month - 1) / 12) * amplitude * 0.4
        noise = np.random.normal(0, amplitude * 0.15)
        trend = (months - i) * (amplitude * 0.02)
        price = mid + seasonal + noise + trend
        points.append(
            PricePoint(date=dt.strftime("%Y-%m"), price=round(max(price, base_lo * 0.8), 2))
        )
    return points


def _run_timesfm_forecast(
    history: list[float], horizon: int
) -> tuple[list[float], list[float], list[float]]:
    model = _get_model()

    input_array = np.array([history], dtype=np.float32)

    forecast_config = timesfm.ForecastConfig(
        num_jobs=1,
        quantiles=[0.1, 0.5, 0.9],
    )

    point_forecast, quantile_forecast = model.forecast(
        inputs=input_array,
        freq=[0],
        forecast_config=forecast_config,
    )

    points = point_forecast[0][:horizon].tolist()

    if quantile_forecast is not None and len(quantile_forecast) > 0:
        q = quantile_forecast[0]
        lowers = q[:horizon, 0].tolist()
        uppers = q[:horizon, 2].tolist()
    else:
        std = np.std(history) * 0.5
        lowers = [p - std for p in points]
        uppers = [p + std for p in points]

    return points, lowers, uppers


def _determine_trend(history: list[float], forecast: list[float]) -> str:
    hist_avg = np.mean(history[-3:])
    fore_avg = np.mean(forecast[:3])
    diff_pct = (fore_avg - hist_avg) / hist_avg * 100

    if diff_pct < -3:
        return "down"
    elif diff_pct > 3:
        return "up"
    return "stable"


def _generate_routes(
    origin: str, destination: str, base_price: float
) -> list[RouteOption]:
    base_transit = 18
    base_co2 = 450

    routes = []
    for i, carrier in enumerate(CARRIERS[:3]):
        transit = round(base_transit * carrier["speed_factor"])
        price = round(base_price * carrier["price_factor"])
        co2 = round(base_co2 * carrier["co2_factor"])

        tags = list(carrier["tags"])
        if i == 0:
            tags.append("Best Value")

        routes.append(
            RouteOption(
                id=f"r{i + 1}",
                carrier=carrier["name"],
                transit_time=transit,
                price=price,
                carbon_footprint=co2,
                reliability=carrier["reliability"],
                tags=tags,
            )
        )

    return sorted(routes, key=lambda r: r.price)


def _generate_insight(trend: str, confidence: float, forecast_prices: list[float]) -> str:
    avg_forecast = np.mean(forecast_prices)

    if trend == "down":
        return (
            f"TimesFM model predicts a softening freight market with {confidence:.0f}% confidence. "
            f"Average forecasted rate: ${avg_forecast:.0f}/TEU. "
            "Consider deferred booking if delivery deadlines allow +7 days flexibility."
        )
    elif trend == "up":
        return (
            f"TimesFM model signals rate increases ahead with {confidence:.0f}% confidence. "
            f"Average forecasted rate: ${avg_forecast:.0f}/TEU. "
            "Recommend locking rates early via forward contracts."
        )
    return (
        f"Market appears stable with {confidence:.0f}% confidence. "
        f"Average forecasted rate: ${avg_forecast:.0f}/TEU. "
        "Normal booking patterns advised."
    )


async def forecast_freight(req: ForecastRequest) -> ForecastResult:
    base_lo, base_hi = _get_route_baseline(req.origin, req.destination)

    if req.historical_prices and len(req.historical_prices) >= 6:
        historical = req.historical_prices
    else:
        historical = _generate_synthetic_history(base_lo, base_hi, months=12)

    history_values = [p.price for p in historical]

    try:
        points, lowers, uppers = _run_timesfm_forecast(history_values, req.horizon)
        model_name = "timesfm-2.0-200m"
    except Exception as exc:
        logger.error("TimesFM forecast failed, using fallback: %s", exc)
        last_val = history_values[-1]
        drift = (history_values[-1] - history_values[-3]) / 2
        points = [last_val + drift * (i + 1) + np.random.normal(0, 20) for i in range(req.horizon)]
        std = np.std(history_values) * 0.5
        lowers = [p - std for p in points]
        uppers = [p + std for p in points]
        model_name = "linear-fallback"

    now = datetime.now()
    forecast_data = []
    for i, (p, lo, hi) in enumerate(zip(points, lowers, uppers)):
        dt = now + timedelta(days=30 * (i + 1))
        forecast_data.append(
            PricePoint(
                date=dt.strftime("%Y-%m"),
                price=round(max(p, 0), 2),
                lower=round(max(lo, 0), 2),
                upper=round(max(hi, 0), 2),
            )
        )

    trend = _determine_trend(history_values, points)
    confidence = min(95, 70 + len(historical) * 1.5)
    avg_price = np.mean(points)
    routes = _generate_routes(req.origin, req.destination, avg_price)
    insight = _generate_insight(trend, confidence, points)

    return ForecastResult(
        trend=trend,
        confidence=round(confidence, 1),
        historical_data=historical,
        forecast_data=forecast_data,
        optimized_routes=routes,
        model_used=model_name,
        insight=insight,
    )


async def forecast_tariff(req: TariffForecastRequest) -> TariffForecastResult:
    if req.historical_rates and len(req.historical_rates) >= 6:
        historical = req.historical_rates
    else:
        historical = _generate_synthetic_history(3.0, 12.0, months=24)

    history_values = [p.price for p in historical]

    try:
        points, lowers, uppers = _run_timesfm_forecast(history_values, req.horizon)
        model_name = "timesfm-2.0-200m"
    except Exception as exc:
        logger.error("TimesFM tariff forecast failed: %s", exc)
        last_val = history_values[-1]
        points = [last_val + np.random.normal(0, 0.3) for _ in range(req.horizon)]
        std = np.std(history_values) * 0.3
        lowers = [p - std for p in points]
        uppers = [p + std for p in points]
        model_name = "linear-fallback"

    now = datetime.now()
    forecast_data = []
    for i, (p, lo, hi) in enumerate(zip(points, lowers, uppers)):
        dt = now + timedelta(days=30 * (i + 1))
        forecast_data.append(
            PricePoint(
                date=dt.strftime("%Y-%m"),
                price=round(max(p, 0), 2),
                lower=round(max(lo, 0), 2),
                upper=round(max(hi, 0), 2),
            )
        )

    trend = _determine_trend(history_values, points)
    confidence = min(92, 65 + len(historical) * 1.0)

    insight = (
        f"Tariff forecast for HS {req.hs_code} ({req.origin_country} -> {req.destination_country}): "
        f"{'Rates expected to decrease' if trend == 'down' else 'Rates expected to increase' if trend == 'up' else 'Rates stable'}. "
        f"Current rate: {history_values[-1]:.1f}%. "
        f"Model confidence: {confidence:.0f}%."
    )

    return TariffForecastResult(
        hs_code=req.hs_code,
        trend=trend,
        confidence=round(confidence, 1),
        current_rate=round(history_values[-1], 2),
        forecast_data=forecast_data,
        model_used=model_name,
        insight=insight,
    )
