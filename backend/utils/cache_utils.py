"""
Cache utility functions and decorators for LOXTR.

Provides geo-aware caching to prevent serving wrong content.
"""

from functools import wraps
from django.core.cache import cache
from django.http import HttpResponse
import hashlib
import logging

logger = logging.getLogger(__name__)

def make_cache_key(base_key, visitor_type=None, language=None, **kwargs):
    """
    Generate cache key with geo-awareness.
    
    Args:
        base_key: Base cache key (e.g., 'homepage')
        visitor_type: 'GLOBAL' or 'LOCAL' (optional)
        language: 'en' or 'tr' (optional)
        **kwargs: Additional parameters to include in key
    
    Returns:
        Cache key string
    """
    key_parts = [base_key]
    
    if visitor_type:
        key_parts.append(visitor_type)
    
    if language:
        key_parts.append(language)
    
    # Add additional params
    for k, v in sorted(kwargs.items()):
        key_parts.append(f"{k}:{v}")
    
    return ':'.join(key_parts)

def cache_page_geo_aware(timeout=1800, key_prefix='page'):
    """
    Decorator to cache entire page with geo-awareness.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Build cache key
            cache_key = make_cache_key(
                f'{key_prefix}:{view_func.__name__}',
                visitor_type=getattr(request, 'visitor_type', 'UNKNOWN'),
                language=getattr(request, 'LANGUAGE_CODE', 'en')
            )
            
            # Try to get from cache
            cached_response = cache.get(cache_key)
            
            if cached_response:
                logger.debug(f"💾 Cache HIT: {cache_key}")
                return cached_response
            
            # Cache miss - execute view
            logger.debug(f"🔍 Cache MISS: {cache_key}")
            response = view_func(request, *args, **kwargs)
            
            # Only cache successful responses
            if response.status_code == 200:
                # Set Vary header (CRITICAL for CDN)
                if hasattr(response, 'headers'):
                    response.headers['Vary'] = 'Cookie, Accept-Language'
                
                # Render if necessary before caching
                if hasattr(response, 'render') and callable(response.render):
                    response.render()

                # Cache response
                cache.set(cache_key, response, timeout)
                logger.debug(f"✅ Cached: {cache_key} (TTL: {timeout}s)")
            
            return response
        
        return wrapper
    return decorator

def cache_api_response(timeout=900, key_prefix='api'):
    """
    Decorator to cache API responses with parameter-based keys.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Build cache key from query parameters
            params_hash = hashlib.md5(
                str(sorted(request.GET.items())).encode()
            ).hexdigest()[:8]
            
            cache_key = make_cache_key(
                f'{key_prefix}:{view_func.__name__}',
                visitor_type=getattr(request, 'visitor_type', 'UNKNOWN'),
                language=getattr(request, 'LANGUAGE_CODE', 'en'),
                params=params_hash
            )
            
            # Try cache
            cached_response = cache.get(cache_key)
            
            if cached_response:
                logger.debug(f"💾 API Cache HIT: {cache_key}")
                return cached_response
            
            # Execute view
            logger.debug(f"🔍 API Cache MISS: {cache_key}")
            response = view_func(request, *args, **kwargs)
            
            # Cache successful responses
            if response.status_code == 200:
                # Render if necessary before caching
                if hasattr(response, 'render') and callable(response.render):
                    response.render()

                cache.set(cache_key, response, timeout)
                logger.debug(f"✅ API Cached: {cache_key}")
            
            return response
        
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern):
    """
    Invalidate all cache keys matching a pattern.
    """
    try:
        # Get all keys matching pattern
        # Note: This requires django-redis backend
        from django_redis import get_redis_connection
        
        redis_conn = get_redis_connection("default")
        # Standard django-redis key format is often ":1:loxtr:pattern"
        # We try to search for the pattern
        keys = redis_conn.keys(f"*loxtr:{pattern}*")
        
        if keys:
            # Redis delete expects keys without the prefix sometimes depending on implementation
            # but with django_redis it usually handles it.
            # However, for manual redis delete we might need to be careful.
            # A safer way with django_redis is:
            # redis_conn.delete(*keys)
            # But keys are bytes and might have prefix. 
            # django-redis uses a prefix. 
            
            # Using common redis connection directly:
            redis_conn.delete(*keys)
            logger.info(f"✅ Invalidated {len(keys)} cache keys matching: {pattern}")
        else:
            logger.debug(f"ℹ️ No cache keys found matching: {pattern}")
            
    except Exception as e:
        logger.error(f"❌ Failed to invalidate cache pattern '{pattern}': {e}")

def clear_geo_cache(visitor_type=None):
    """
    Clear all geo-specific cache.
    """
    if visitor_type:
        invalidate_cache_pattern(f'page:*:{visitor_type}:*')
    else:
        invalidate_cache_pattern('page:*:GLOBAL:*')
        invalidate_cache_pattern('page:*:LOCAL:*')
    
    logger.info(f"✅ Cleared geo cache for: {visitor_type or 'ALL'}")

class CacheManager:
    """
    Cache manager for common operations.
    """
    
    def __init__(self, timeout=3600):
        self.timeout = timeout
    
    def _make_key(self, model_name, obj_id, **kwargs):
        """Generate cache key for model instance."""
        return make_cache_key(f'model:{model_name}', id=obj_id, **kwargs)
    
    def get_brand(self, brand_id):
        """Get brand from cache or database."""
        cache_key = self._make_key('brand', brand_id)
        cached = cache.get(cache_key)
        
        if cached:
            return cached
        
        # Fetch from DB (deferred import)
        from apps.brands.models import Brand
        try:
            brand = Brand.objects.get(id=brand_id)
            cache.set(cache_key, brand, self.timeout)
            return brand
        except Brand.DoesNotExist:
            return None
    
    def set_brand(self, brand):
        """Cache brand instance."""
        cache_key = self._make_key('brand', brand.id)
        cache.set(cache_key, brand, self.timeout)
    
    def invalidate_brand(self, brand_id):
        """Invalidate brand cache."""
        cache_key = self._make_key('brand', brand_id)
        cache.delete(cache_key)
        
        # Also invalidate related caches
        invalidate_cache_pattern('page:*')  # Clear all page caches
    
    def get_product(self, product_id):
        """Get product from cache or database."""
        cache_key = self._make_key('product', product_id)
        cached = cache.get(cache_key)
        
        if cached:
            return cached
        
        from apps.brands.models import Product
        try:
            product = Product.objects.select_related('brand', 'category').get(id=product_id)
            cache.set(cache_key, product, self.timeout)
            return product
        except Product.DoesNotExist:
            return None

# Global cache manager instance
cache_manager = CacheManager()
