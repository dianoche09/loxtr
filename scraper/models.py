from pydantic import BaseModel, HttpUrl


class EnrichRequest(BaseModel):
    company_name: str
    website: str | None = None
    country: str | None = None


class EnrichResult(BaseModel):
    company_name: str
    website: str | None = None
    website_alive: bool = False
    title: str | None = None
    description: str | None = None
    emails: list[str] = []
    phones: list[str] = []
    social_links: dict[str, str] = {}
    address: str | None = None
    industry_keywords: list[str] = []
    employee_count: str | None = None
    founded_year: str | None = None
    enrichment_score: int = 0


class BatchEnrichRequest(BaseModel):
    leads: list[EnrichRequest]


class DiscoverRequest(BaseModel):
    product: str
    target_markets: list[str]
    industry: str
    count: int = 15


class DiscoveredLead(BaseModel):
    company_name: str
    website: str | None = None
    website_alive: bool = False
    country: str
    city: str | None = None
    email: str | None = None
    phone: str | None = None
    description: str | None = None
    products: list[str] = []
    source_url: str | None = None
    confidence: int = 0
