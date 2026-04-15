import re
import asyncio
from urllib.parse import urljoin, urlparse, quote_plus

from scrapling import Fetcher
from config import logger
from models import DiscoverRequest, DiscoveredLead
from enricher import _extract_emails, _extract_phones, _extract_meta, _try_fetch_page


TRADE_DIRECTORIES = [
    {
        "name": "Kompass",
        "url_template": "https://www.kompass.com/en/searchCompanies?text={product}&localizationCode={country_code}",
        "result_selector": ".product-list-item, .company-list-item, .search-results-item",
        "name_selector": "h2 a, .company-name a, .company-title a",
        "country_selector": ".company-country, .location",
    },
    {
        "name": "EuroPages",
        "url_template": "https://www.europages.co.uk/companies/{product}.html",
        "result_selector": ".company-item, .result-item, .company-card",
        "name_selector": "h3 a, .company-name a, .title a",
        "country_selector": ".country, .location-country",
    },
]

GOOGLE_SEARCH_TEMPLATE = (
    "https://www.google.com/search?q={query}&num=20"
)


def _build_search_queries(req: DiscoverRequest) -> list[str]:
    queries = []
    for market in req.target_markets[:3]:
        queries.append(
            f'"{req.product}" {req.industry} {market} company supplier manufacturer'
        )
        queries.append(
            f'"{req.product}" exporter importer {market} contact email'
        )
    return queries


def _parse_google_results(page) -> list[dict]:
    results = []
    search_items = page.css("div.g, div[data-hveid]")

    for item in search_items[:30]:
        link_el = item.css_first("a[href]")
        title_el = item.css_first("h3")

        if not link_el or not title_el:
            continue

        href = link_el.attrib.get("href", "")
        if not href.startswith("http"):
            continue

        domain = urlparse(href).netloc
        skip_domains = [
            "google.com", "youtube.com", "wikipedia.org", "facebook.com",
            "twitter.com", "linkedin.com", "amazon.com", "alibaba.com",
            "reddit.com", "instagram.com",
        ]
        if any(sd in domain for sd in skip_domains):
            continue

        snippet_el = item.css_first("div[data-sncf], span.st, div.VwiC3b")
        snippet = snippet_el.text().strip()[:300] if snippet_el else ""

        results.append({
            "url": href,
            "title": title_el.text().strip(),
            "snippet": snippet,
            "domain": domain,
        })

    return results


async def _scrape_company_page(url: str, company_hint: str, country: str) -> DiscoveredLead | None:
    try:
        page = await asyncio.to_thread(_try_fetch_page, url)
        if not page:
            return None

        title, description = _extract_meta(page)
        emails = _extract_emails(page)
        phones = _extract_phones(page)

        name = company_hint
        if title:
            clean_title = re.split(r"[\|\-–—]", title)[0].strip()
            if clean_title and len(clean_title) > 3:
                name = clean_title

        products = []
        keywords_meta = page.css_first('meta[name="keywords"]')
        if keywords_meta:
            content = keywords_meta.attrib.get("content", "")
            products = [k.strip() for k in content.split(",") if k.strip()][:5]

        confidence = 30
        if emails:
            confidence += 30
        if phones:
            confidence += 15
        if description:
            confidence += 15
        if products:
            confidence += 10

        return DiscoveredLead(
            company_name=name,
            website=url,
            website_alive=True,
            country=country,
            email=emails[0] if emails else None,
            phone=phones[0] if phones else None,
            description=description,
            products=products,
            source_url=url,
            confidence=min(confidence, 100),
        )
    except Exception as exc:
        logger.warning("Failed to scrape %s: %s", url, exc)
        return None


async def discover_leads(req: DiscoverRequest) -> list[DiscoveredLead]:
    queries = _build_search_queries(req)
    all_search_results = []

    fetcher = Fetcher(auto_match=False)

    for query in queries[:4]:
        try:
            encoded = quote_plus(query)
            url = GOOGLE_SEARCH_TEMPLATE.format(query=encoded)
            page = await asyncio.to_thread(
                lambda u=url: fetcher.get(u, timeout=15)
            )
            if page and page.status == 200:
                results = _parse_google_results(page)
                all_search_results.extend(results)
        except Exception as exc:
            logger.warning("Search failed for query '%s': %s", query, exc)

    seen_domains = set()
    unique_results = []
    for r in all_search_results:
        if r["domain"] not in seen_domains:
            seen_domains.add(r["domain"])
            unique_results.append(r)

    unique_results = unique_results[: req.count * 2]

    semaphore = asyncio.Semaphore(5)

    async def _limited_scrape(result: dict) -> DiscoveredLead | None:
        async with semaphore:
            country = req.target_markets[0] if req.target_markets else "Unknown"
            return await _scrape_company_page(
                result["url"], result["title"], country
            )

    tasks = [_limited_scrape(r) for r in unique_results]
    scraped = await asyncio.gather(*tasks)

    leads = [l for l in scraped if l is not None]
    leads.sort(key=lambda x: x.confidence, reverse=True)

    return leads[: req.count]
