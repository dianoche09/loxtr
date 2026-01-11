"""
Views for GLOBAL view (English, non-TR visitors).
"""

from django.shortcuts import render
from django.core.cache import cache
from apps.case_studies.models import CaseStudy
from utils.cache_utils import cache_page_geo_aware, make_cache_key
import logging

logger = logging.getLogger(__name__)

@cache_page_geo_aware(timeout=1800)  # 30 minutes
def homepage(request):
    """
    Homepage for GLOBAL visitors.
    
    Shows:
    - Market entry messaging
    - Featured Case Studies (Market Entry)
    - Why Turkey statistics
    - CTA for partnership application
    """
    # Get featured market entry case studies
    cache_key = make_cache_key('market_entry_cases_featured', language='en')
    featured_cases = cache.get(cache_key)
    
    if not featured_cases:
        featured_cases = CaseStudy.objects.filter(
            status=CaseStudy.STATUS_PUBLISHED,
            case_type=CaseStudy.TYPE_MARKET_ENTRY,
            is_featured=True
        ).order_by('-created_at')[:6]
        cache.set(cache_key, list(featured_cases), timeout=3600)
    
    context = {
        'featured_cases': featured_cases,
        'page_title': 'LOXTR - Unlock the Turkish Market',
        'page_description': 'Your authorized distribution partner in Turkey',
    }
    
    return render(request, 'global_view/homepage.html', context)

@cache_page_geo_aware(timeout=3600)  # 1 hour
def market_entry(request):
    """
    Market entry services page.
    """
    context = {
        'page_title': 'Market Entry Services - LOXTR',
    }
    
    return render(request, 'global_view/market_entry.html', context)
