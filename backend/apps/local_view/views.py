"""
Views for LOCAL view (Turkish, TR visitors).
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
    Homepage for LOCAL visitors.
    
    Shows:
    - Export management messaging
    - Featured Case Studies (Export)
    - Local network statistics
    - CTA for cooperation
    """
    # Get featured export case studies
    cache_key = make_cache_key('export_cases_featured', language='tr')
    featured_cases = cache.get(cache_key)
    
    if not featured_cases:
        featured_cases = CaseStudy.objects.filter(
            status=CaseStudy.STATUS_PUBLISHED,
            case_type=CaseStudy.TYPE_EXPORT,
            is_featured=True
        ).order_by('-created_at')[:6]
        cache.set(cache_key, list(featured_cases), timeout=3600)
    
    context = {
        'featured_cases': featured_cases,
        'page_title': 'LOXTR - Sizin Dış Ticaret Departmanınız',
        'page_description': 'İhracat operasyonlarınızı A\'dan Z\'ye yönetiyoruz',
    }
    
    return render(request, 'local_view/homepage.html', context)

@cache_page_geo_aware(timeout=3600)  # 1 hour
def distribution(request):
    """
    Distribution services page.
    """
    context = {
        'page_title': 'Distribütörlük Hizmetleri - LOXTR',
    }
    
    return render(request, 'local_view/distribution.html', context)
