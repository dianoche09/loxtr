from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

from config import SCRAPER_API_KEY, PORT, ALLOWED_ORIGINS, logger
from models import (
    EnrichRequest,
    EnrichResult,
    BatchEnrichRequest,
    DiscoverRequest,
    DiscoveredLead,
)
from enricher import enrich_lead, enrich_batch
from discoverer import discover_leads

app = FastAPI(
    title="LOXTR Scraper Service",
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
    if not SCRAPER_API_KEY:
        return True
    if key != SCRAPER_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


@app.get("/health")
async def health():
    return {"status": "ok", "service": "loxtr-scraper"}


@app.post("/enrich-lead", response_model=EnrichResult)
async def enrich_lead_endpoint(
    req: EnrichRequest, _=Depends(verify_api_key)
):
    logger.info("Enriching lead: %s", req.company_name)
    result = await enrich_lead(req)
    logger.info(
        "Enrichment done: %s (score=%d)", req.company_name, result.enrichment_score
    )
    return result


@app.post("/enrich-batch", response_model=list[EnrichResult])
async def enrich_batch_endpoint(
    req: BatchEnrichRequest, _=Depends(verify_api_key)
):
    logger.info("Batch enriching %d leads", len(req.leads))
    results = await enrich_batch(req.leads)
    avg_score = (
        sum(r.enrichment_score for r in results) / len(results) if results else 0
    )
    logger.info("Batch done: %d leads, avg score=%.0f", len(results), avg_score)
    return results


@app.post("/discover", response_model=list[DiscoveredLead])
async def discover_endpoint(
    req: DiscoverRequest, _=Depends(verify_api_key)
):
    logger.info(
        "Discovering leads: product=%s, markets=%s, industry=%s",
        req.product,
        req.target_markets,
        req.industry,
    )
    results = await discover_leads(req)
    logger.info("Discovery done: %d leads found", len(results))
    return results


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
