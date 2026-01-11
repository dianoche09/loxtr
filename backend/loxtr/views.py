"""
Root-level views for LOXTR

These views handle:
1. Smart homepage routing (geo-based redirect)
2. Manual view preference switching
"""

from django.shortcuts import redirect
from django.http import HttpResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_http_methods
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@never_cache
def homepage_router(request):
    """
    Smart homepage router - redirects based on geo-detection.
    """
    if not getattr(settings, 'ENABLE_GEO_DETECTION', True):
        return redirect('/en/', permanent=False)
    
    visitor_type = getattr(request, 'visitor_type', 'GLOBAL')
    
    if settings.DEBUG:
        country = getattr(request, 'geo_country', 'UNKNOWN')
        logger.debug(f"Homepage router: {country} → {visitor_type}")
    
    if visitor_type == 'LOCAL':
        target_url = '/tr/'
    else:
        target_url = '/en/'
    
    return redirect(target_url, permanent=False)

@require_http_methods(["GET"])
def set_view_preference(request, view_type):
    """
    Allow user to manually switch between GLOBAL/LOCAL views.
    """
    if view_type not in ['GLOBAL', 'LOCAL']:
        return HttpResponse(
            'Invalid view type. Use "GLOBAL" or "LOCAL".',
            status=400
        )
    
    redirect_url = '/en/' if view_type == 'GLOBAL' else '/tr/'
    response = redirect(redirect_url)
    
    response.set_cookie(
        key='force_view',
        value=view_type,
        max_age=31536000,  # 365 days
        httponly=True,
        samesite='Lax',
        secure=not settings.DEBUG
    )
    
    logger.info(f"View preference changed to: {view_type}")
    
    return response
