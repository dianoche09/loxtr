import geoip2.database
import geoip2.errors
import logging
from django.conf import settings
from django.core.cache import cache
from typing import Optional

logger = logging.getLogger(__name__)

class GeoLocationMiddleware:
    
    def __init__(self, get_response):
        """
        Initialize middleware.
        
        Args:
            get_response: Django get_response callable
        """
        self.get_response = get_response
        self.use_cloudflare = getattr(settings, 'USE_CLOUDFLARE_GEO', False)
        
        # Initialize GeoIP2 reader if not using Cloudflare
        if not self.use_cloudflare:
            try:
                db_path = getattr(settings, 'GEOIP_DATABASE_PATH', '/Users/gurkankuzu/GK MAC D/dev/loxtr/backend/data/geoip/GeoLite2-Country.mmdb')
                self.geoip_reader = geoip2.database.Reader(db_path)
                logger.info(f"✅ GeoIP2 database loaded: {db_path}")
            except Exception as e:
                logger.error(f"❌ Failed to load GeoIP database: {e}")
                self.geoip_reader = None
        else:
            self.geoip_reader = None
            logger.info("✅ Using Cloudflare geo headers (no database needed)")
    
    def __call__(self, request):
        """
        Process each incoming request.
        """
        # Extract client IP
        ip_address = self._get_client_ip(request)
        
        # Check cache first
        cache_key = f"geoip:{ip_address}"
        cached_geo = cache.get(cache_key)
        
        if cached_geo:
            country_code = cached_geo['country']
        else:
            # Perform geo lookup
            country_code = self._detect_country(request, ip_address)
            # Cache for 1 hour
            cache.set(cache_key, {'country': country_code}, timeout=3600)
        
        # Set request attributes (CRITICAL)
        request.geo_ip = ip_address
        request.geo_country = country_code
        request.is_turkish_visitor = (country_code == 'TR')
        
        # Determine visitor type and default language
        if request.is_turkish_visitor:
            request.visitor_type = 'LOCAL'
            request.default_language = 'tr'
        else:
            request.visitor_type = 'GLOBAL'
            request.default_language = 'en'
        
        # Check for manual override (cookie)
        force_view = request.COOKIES.get('force_view')
        if force_view in ['GLOBAL', 'LOCAL']:
            request.visitor_type = force_view
            request.default_language = 'en' if force_view == 'GLOBAL' else 'tr'
        
        # Process request
        response = self.get_response(request)
        
        # Set Vary header
        self._set_vary_header(response)
        
        # Log analytics (non-blocking) - Placeholder for now
        # self._log_analytics(request, country_code)
        
        return response
    
    def _get_client_ip(self, request) -> str:
        cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
        if cf_ip:
            return cf_ip.strip()
        
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        
        return request.META.get('REMOTE_ADDR', '127.0.0.1')
    
    def _detect_country(self, request, ip_address: str) -> str:
        if self.use_cloudflare:
            cf_country = request.META.get('HTTP_CF_IPCOUNTRY', '').upper()
            if cf_country and cf_country != 'XX':
                return cf_country
        
        if self.geoip_reader:
            try:
                response = self.geoip_reader.country(ip_address)
                return response.country.iso_code
            except Exception:
                pass
        
        return 'UNKNOWN'
    
    def _set_vary_header(self, response):
        vary_values = ['Cookie', 'Accept-Language']
        if self.use_cloudflare:
            vary_values.append('CF-IPCountry')
        
        if hasattr(response, 'headers'):
            response.headers['Vary'] = ', '.join(vary_values)
        else:
            # Fallback for older Django or simple HttpResponses
            response['Vary'] = ', '.join(vary_values)

    def __del__(self):
        if hasattr(self, 'geoip_reader') and self.geoip_reader:
            try:
                self.geoip_reader.close()
            except:
                pass
