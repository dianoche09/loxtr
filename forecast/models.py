from pydantic import BaseModel


class PricePoint(BaseModel):
    date: str
    price: float
    lower: float | None = None
    upper: float | None = None


class RouteOption(BaseModel):
    id: str
    carrier: str
    transit_time: int
    price: float
    carbon_footprint: float
    reliability: float
    tags: list[str] = []


class ForecastRequest(BaseModel):
    origin: str
    destination: str
    horizon: int = 6
    historical_prices: list[PricePoint] | None = None


class ForecastResult(BaseModel):
    trend: str
    confidence: float
    historical_data: list[PricePoint]
    forecast_data: list[PricePoint]
    optimized_routes: list[RouteOption]
    model_used: str = "timesfm-2.0-200m"
    insight: str = ""


class TariffForecastRequest(BaseModel):
    hs_code: str
    origin_country: str
    destination_country: str
    horizon: int = 12
    historical_rates: list[PricePoint] | None = None


class TariffForecastResult(BaseModel):
    hs_code: str
    trend: str
    confidence: float
    current_rate: float
    forecast_data: list[PricePoint]
    model_used: str = "timesfm-2.0-200m"
    insight: str = ""
