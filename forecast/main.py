from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

from config import FORECAST_API_KEY, PORT, ALLOWED_ORIGINS, logger
from models import (
    ForecastRequest,
    ForecastResult,
    TariffForecastRequest,
    TariffForecastResult,
)
from engine import forecast_freight, forecast_tariff

app = FastAPI(
    title="LOXTR Forecast Service",
    version="1.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(key: str | None = Security(api_key_header)):
    if not FORECAST_API_KEY:
        return True
    if key != FORECAST_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


@app.get("/health")
async def health():
    return {"status": "ok", "service": "loxtr-forecast"}


@app.post("/forecast/freight", response_model=ForecastResult)
async def freight_forecast_endpoint(
    req: ForecastRequest, _=Depends(verify_api_key)
):
    logger.info("Freight forecast: %s -> %s, horizon=%d", req.origin, req.destination, req.horizon)
    result = await forecast_freight(req)
    logger.info("Forecast done: trend=%s, confidence=%.1f, model=%s", result.trend, result.confidence, result.model_used)
    return result


@app.post("/forecast/tariff", response_model=TariffForecastResult)
async def tariff_forecast_endpoint(
    req: TariffForecastRequest, _=Depends(verify_api_key)
):
    logger.info("Tariff forecast: HS %s, %s -> %s", req.hs_code, req.origin_country, req.destination_country)
    result = await forecast_tariff(req)
    logger.info("Tariff forecast done: trend=%s", result.trend)
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
