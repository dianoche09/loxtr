"""
Sitemap generation for LOXTR.

Generates separate sitemaps for:
- Global view pages (EN)
- Local view pages (TR)
"""

from django.contrib.sitemaps import Sitemap
from django.urls import reverse

# ============================================
# GLOBAL VIEW SITEMAP (English)
# ============================================

class GlobalViewSitemap(Sitemap):
    """
    Sitemap for GLOBAL view pages (non-TR visitors).
    """
    
    changefreq = 'weekly'
    priority = 0.8
    protocol = 'https'
    
    def items(self):
        """Return list of page identifiers."""
        return [
            'global:homepage',
            # 'global:market_entry', # TODO: Verify URL names
            # 'global:services',
            # 'global:why_turkey',
            'global:about',
            # 'global:contact',
        ]
    
    def location(self, item):
        """Return URL for each item."""
        try:
            return reverse(item)
        except:
            return '/'
    
    def lastmod(self, item):
        return None

# ============================================
# LOCAL VIEW SITEMAP (Turkish)
# ============================================

class LocalViewSitemap(Sitemap):
    """
    Sitemap for LOCAL view pages (TR visitors).
    """
    
    changefreq = 'weekly'
    priority = 0.8
    protocol = 'https'
    
    def items(self):
        return [
            'local:homepage',
            # 'local:export_management',
            'local:about',
            # 'local:contact',
        ]
    
    def location(self, item):
        try:
            return reverse(item)
        except:
            return '/'
