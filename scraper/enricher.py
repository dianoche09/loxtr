import re
import asyncio
from urllib.parse import urljoin, urlparse

from scrapling import Fetcher
from config import logger
from models import EnrichRequest, EnrichResult


EMAIL_PATTERN = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
)
PHONE_PATTERN = re.compile(
    r"(?:\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}"
)
SOCIAL_DOMAINS = {
    "linkedin.com": "linkedin",
    "twitter.com": "twitter",
    "x.com": "twitter",
    "facebook.com": "facebook",
    "instagram.com": "instagram",
    "youtube.com": "youtube",
}


def _guess_website(company_name: str, country: str | None) -> str:
    slug = company_name.lower()
    slug = re.sub(r"[^a-z0-9]+", "", slug)
    return f"https://www.{slug}.com"


def _extract_emails(page) -> list[str]:
    raw_text = page.get_all_text() or ""
    found = EMAIL_PATTERN.findall(raw_text)

    mailto_links = page.css("a[href^='mailto:']")
    for link in mailto_links:
        href = link.attrib.get("href", "")
        email = href.replace("mailto:", "").split("?")[0].strip()
        if email and EMAIL_PATTERN.match(email):
            found.append(email)

    cleaned = set()
    ignore_extensions = (".png", ".jpg", ".gif", ".svg", ".webp", ".css", ".js")
    for e in found:
        lower = e.lower()
        if not any(lower.endswith(ext) for ext in ignore_extensions):
            cleaned.add(lower)
    return list(cleaned)[:10]


def _extract_phones(page) -> list[str]:
    tel_links = page.css("a[href^='tel:']")
    phones = []
    for link in tel_links:
        href = link.attrib.get("href", "")
        phone = href.replace("tel:", "").strip()
        if phone:
            phones.append(phone)

    if not phones:
        raw_text = page.get_all_text() or ""
        found = PHONE_PATTERN.findall(raw_text)
        phones = [p.strip() for p in found if len(p.strip()) >= 7]

    return list(set(phones))[:5]


def _extract_social_links(page) -> dict[str, str]:
    social = {}
    all_links = page.css("a[href]")
    for link in all_links:
        href = link.attrib.get("href", "")
        for domain, platform in SOCIAL_DOMAINS.items():
            if domain in href and platform not in social:
                social[platform] = href
                break
    return social


def _extract_meta(page) -> tuple[str | None, str | None]:
    title = None
    description = None

    title_tag = page.css_first("title")
    if title_tag:
        title = title_tag.text().strip()[:200]

    meta_desc = page.css_first('meta[name="description"]')
    if meta_desc:
        description = meta_desc.attrib.get("content", "").strip()[:500]

    if not description:
        og_desc = page.css_first('meta[property="og:description"]')
        if og_desc:
            description = og_desc.attrib.get("content", "").strip()[:500]

    return title, description


def _extract_industry_keywords(page) -> list[str]:
    keywords_meta = page.css_first('meta[name="keywords"]')
    if keywords_meta:
        content = keywords_meta.attrib.get("content", "")
        return [k.strip() for k in content.split(",") if k.strip()][:10]
    return []


def _calculate_enrichment_score(result: EnrichResult) -> int:
    score = 0
    if result.website_alive:
        score += 20
    if result.title:
        score += 10
    if result.description:
        score += 10
    if result.emails:
        score += 25
    if result.phones:
        score += 15
    if result.social_links:
        score += 10
    if result.industry_keywords:
        score += 5
    if result.address:
        score += 5
    return min(score, 100)


def _try_fetch_page(url: str):
    try:
        fetcher = Fetcher(auto_match=False)
        page = fetcher.get(url, timeout=15)
        if page.status == 200:
            return page
    except Exception as exc:
        logger.warning("Fetch failed for %s: %s", url, exc)
    return None


def _try_contact_page(base_url: str, page):
    contact_patterns = [
        "contact", "about", "kontakt", "iletisim", "contacto",
        "impressum", "about-us", "contact-us",
    ]

    all_links = page.css("a[href]")
    for link in all_links:
        href = link.attrib.get("href", "")
        href_lower = href.lower()
        for pattern in contact_patterns:
            if pattern in href_lower:
                full_url = urljoin(base_url, href)
                if urlparse(full_url).netloc == urlparse(base_url).netloc:
                    return full_url
    return None


async def enrich_lead(req: EnrichRequest) -> EnrichResult:
    result = EnrichResult(company_name=req.company_name, website=req.website)

    urls_to_try = []
    if req.website:
        url = req.website if req.website.startswith("http") else f"https://{req.website}"
        urls_to_try.append(url)

    guessed = _guess_website(req.company_name, req.country)
    if guessed not in urls_to_try:
        urls_to_try.append(guessed)

    main_page = None
    working_url = None

    for url in urls_to_try:
        page = await asyncio.to_thread(_try_fetch_page, url)
        if page:
            main_page = page
            working_url = url
            result.website = url
            result.website_alive = True
            break

    if not main_page:
        return result

    result.title, result.description = _extract_meta(main_page)
    result.emails = _extract_emails(main_page)
    result.phones = _extract_phones(main_page)
    result.social_links = _extract_social_links(main_page)
    result.industry_keywords = _extract_industry_keywords(main_page)

    if not result.emails or not result.phones:
        contact_url = _try_contact_page(working_url, main_page)
        if contact_url:
            contact_page = await asyncio.to_thread(_try_fetch_page, contact_url)
            if contact_page:
                if not result.emails:
                    result.emails = _extract_emails(contact_page)
                if not result.phones:
                    result.phones = _extract_phones(contact_page)
                if not result.social_links:
                    result.social_links = _extract_social_links(contact_page)

    result.enrichment_score = _calculate_enrichment_score(result)
    return result


async def enrich_batch(leads: list[EnrichRequest]) -> list[EnrichResult]:
    semaphore = asyncio.Semaphore(5)

    async def _limited(req: EnrichRequest) -> EnrichResult:
        async with semaphore:
            return await enrich_lead(req)

    tasks = [_limited(lead) for lead in leads]
    return await asyncio.gather(*tasks)
