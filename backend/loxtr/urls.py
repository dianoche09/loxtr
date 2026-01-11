"""
Root URL Configuration for LOXTR

Key routing logic:
1. Root "/" → Smart router (redirects based on geo-detection)
2. /en/ → Global View (for non-TR visitors)
3. /tr/ → Local View (for TR visitors)
4. /api/v1/ → REST API (language-agnostic)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.contrib.sitemaps.views import sitemap

from .views import homepage_router, set_view_preference
from apps.seo.sitemaps import (
    GlobalViewSitemap,
    LocalViewSitemap,
)
from apps.core.views import robots_txt, error_404, error_500

# Sitemap configuration
sitemaps = {
    'global': GlobalViewSitemap,
    'local': LocalViewSitemap,
}

urlpatterns = [
    # ============================================
    # ROOT ROUTING (Smart Geo-Based Router)
    # ============================================
    path('', homepage_router, name='root'),
    
    # Manual view switcher (sets cookie override)
    path('set-view/<str:view_type>/', set_view_preference, name='set_view'),
    
    # ============================================
    # GLOBAL VIEW (English - Non-TR Visitors)
    # ============================================
    path('en/', include('apps.global_view.urls', namespace='global')),
    
    # ============================================
    # LOCAL VIEW (Turkish - TR Visitors)
    # ============================================
    path('tr/', include('apps.local_view.urls', namespace='local')),
    
    # ============================================
    # REST API (Language-Agnostic)
    # ============================================
    path('api/v1/', include('apps.api.urls', namespace='api')),
    
    # ============================================
    # ADMIN PANEL
    # ============================================
    path('admin/', admin.site.urls),
    
    # ============================================
    # SEO & UTILITIES
    # ============================================
    
    # Sitemap
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
    
    # Robots.txt (dynamic)
    path('robots.txt', robots_txt, name='robots_txt'),
    
    # Health check (for load balancer)
    path('health/', lambda r: HttpResponse('OK'), name='health'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Custom error handlers
handler404 = 'apps.core.views.error_404'
handler500 = 'apps.core.views.error_500'

# Admin customization
admin.site.site_header = "LOXTR Administration"
admin.site.site_title = "LOXTR Admin"
admin.site.index_title = "Welcome to LOXTR Admin Portal"
