"""
Management command to warm cache with frequently accessed data.

Usage:
    python manage.py warm_cache
"""

from django.core.management.base import BaseCommand
from django.core.cache import cache
from apps.brands.models import Brand, Product
from apps.categories.models import Category

class Command(BaseCommand):
    help = 'Warm cache with frequently accessed data'
    
    def handle(self, *args, **options):
        self.stdout.write('🔥 Warming cache...')
        
        # Cache featured brands
        featured_brands = list(
            Brand.active.filter(featured=True).select_related()[:10]
        )
        cache.set('featured_brands', featured_brands, timeout=86400)
        self.stdout.write(f'✅ Cached {len(featured_brands)} featured brands')
        
        # Cache top products
        top_products = list(
            Product.active.filter(featured=True).select_related('brand', 'category')[:20]
        )
        cache.set('top_products', top_products, timeout=86400)
        self.stdout.write(f'✅ Cached {len(top_products)} top products')
        
        # Cache active categories
        categories = list(Category.active.all())
        cache.set('active_categories', categories, timeout=86400)
        self.stdout.write(f'✅ Cached {len(categories)} categories')
        
        # Cache import brands (for LOCAL view)
        import_brands = list(
            Brand.import_brands.all().select_related()[:50]
        )
        cache.set('brands_list:import:tr', import_brands, timeout=3600)
        self.stdout.write(f'✅ Cached {len(import_brands)} import brands')
        
        # Cache export brands (for GLOBAL view)
        export_brands = list(
            Brand.export_brands.all().select_related()[:50]
        )
        cache.set('brands_list:export:en', export_brands, timeout=3600)
        self.stdout.write(f'✅ Cached {len(export_brands)} export brands')
        
        self.stdout.write(self.style.SUCCESS('🎉 Cache warming complete!'))
