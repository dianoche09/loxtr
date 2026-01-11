"""
Context processor to inject SEO metadata into all templates.
"""

from django.conf import settings
from apps.seo.models import SEOMetadata

def seo_metadata(request):
    """
    Add SEO metadata to template context.
    """
    # Get current path
    path = request.path
    language = getattr(request, 'LANGUAGE_CODE', 'en')
    
    # Try to get page-specific SEO data
    try:
        seo_data = SEOMetadata.objects.get(page_path=path)
    except SEOMetadata.DoesNotExist:
        seo_data = None
    
    # Build context
    context = {
        'seo': {
            # Page-specific or defaults
            'title': getattr(seo_data, f'title_{language}', '') or get_default_title(path, language),
            'description': getattr(seo_data, f'description_{language}', '') or get_default_description(path, language),
            'keywords': getattr(seo_data, f'keywords_{language}', ''),
            
            # Open Graph
            'og_title': getattr(seo_data, f'og_title_{language}', '') or getattr(seo_data, f'title_{language}', ''),
            'og_description': getattr(seo_data, f'og_description_{language}', ''),
            'og_image': getattr(seo_data, 'og_image_url', '') or getattr(settings, 'DEFAULT_OG_IMAGE', ''),
            'og_type': getattr(seo_data, 'og_type', 'website'),
            
            # Twitter Card
            'twitter_card': getattr(seo_data, 'twitter_card_type', 'summary_large_image'),
            'twitter_title': getattr(seo_data, f'twitter_title_{language}', ''),
            'twitter_description': getattr(seo_data, f'twitter_description_{language}', ''),
            'twitter_image': getattr(seo_data, 'twitter_image_url', ''),
            
            # Structured Data
            'schema_json': getattr(seo_data, 'schema_json', {}),
            
            # Canonical & Hreflang
            'canonical_url': build_canonical_url(request, path),
            'hreflang_tags': build_hreflang_tags(path),
            
            # Robots
            'robots': getattr(seo_data, 'robots_directive', 'index, follow'),
        },
        
        # Site-wide
        'site_name': getattr(settings, 'SITE_NAME', 'LOXTR'),
        'site_url': getattr(settings, 'SITE_URL', 'https://www.loxtr.com'),
        'GOOGLE_ANALYTICS_ID': getattr(settings, 'GOOGLE_ANALYTICS_ID', ''),
        'GOOGLE_TAG_MANAGER_ID': getattr(settings, 'GOOGLE_TAG_MANAGER_ID', ''),
        'ENABLE_WHATSAPP_BUTTON': getattr(settings, 'ENABLE_WHATSAPP_BUTTON', True),
    }
    
    return context

def get_default_title(path, language):
    """Generate default page title."""
    if language == 'tr':
        return "LOXTR - Global Markalar. Türkiye Pazarı."
    else:
        return "LOXTR - Global Brands. Turkish Market."

def get_default_description(path, language):
    """Generate default page description."""
    if language == 'tr':
        return "Türkiye'de global markaların resmi distribütörü. Yeniliği yerel pazarlara getiriyoruz."
    else:
        return "Official distributor of global brands in Turkey. Bringing innovation to local markets."

def build_canonical_url(request, path):
    """Build canonical URL for current page."""
    site_url = getattr(settings, 'SITE_URL', 'https://www.loxtr.com').rstrip('/')
    return f"{site_url}{path}"

def build_hreflang_tags(path):
    """
    Build hreflang tags for current page.
    """
    site_url = getattr(settings, 'SITE_URL', 'https://www.loxtr.com').rstrip('/')
    
    # Determine language-neutral path
    if path.startswith('/en/'):
        base_path = path[3:]  # Remove /en/
    elif path.startswith('/tr/'):
        base_path = path[3:]  # Remove /tr/
    elif path == '/en':
        base_path = '/'
    elif path == '/tr':
        base_path = '/'
    else:
        base_path = path
    
    if not base_path.startswith('/'):
        base_path = '/' + base_path

    return [
        {
            'lang': 'en',
            'url': f"{site_url}/en{base_path}"
        },
        {
            'lang': 'tr',
            'url': f"{site_url}/tr{base_path}"
        },
        {
            'lang': 'x-default',
            'url': f"{site_url}/en{base_path}"
        },
    ]
