"""
Dynamic robots.txt generation.
"""

from django.http import HttpResponse
from django.views.decorators.cache import cache_page
from django.conf import settings

@cache_page(86400)  # Cache for 24 hours
def robots_txt(request):
    """
    Generate robots.txt dynamically.
    """
    site_url = getattr(settings, 'SITE_URL', 'https://www.loxtr.com')
    
    lines = [
        "User-agent: *",
        "",
        "# Allow language-specific pages",
        "Allow: /en/",
        "Allow: /tr/",
        "",
        "# Allow static and media",
        "Allow: /static/",
        "Allow: /media/",
        "",
        "# Disallow admin and sensitive areas",
        "Disallow: /admin/",
        "Disallow: /api/v1/auth/",
        "",
        "# Sitemap",
        f"Sitemap: {site_url}/sitemap.xml",
        "",
        "# Crawl delay (optional)",
        "Crawl-delay: 1",
    ]
    
    return HttpResponse("\n".join(lines), content_type="text/plain")
