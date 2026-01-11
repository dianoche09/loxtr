"""
Management command to clear cache.

Usage:
    python manage.py clear_cache --all
    python manage.py clear_cache --pattern "homepage:*"
    python manage.py clear_cache --geo LOCAL
"""

from django.core.management.base import BaseCommand
from django.core.cache import cache
from utils.cache_utils import invalidate_cache_pattern, clear_geo_cache

class Command(BaseCommand):
    help = 'Clear application cache'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Clear all cache',
        )
        parser.add_argument(
            '--pattern',
            type=str,
            help='Clear cache matching pattern (e.g., "homepage:*")',
        )
        parser.add_argument(
            '--geo',
            type=str,
            choices=['GLOBAL', 'LOCAL'],
            help='Clear geo-specific cache',
        )
    
    def handle(self, *args, **options):
        if options['all']:
            cache.clear()
            self.stdout.write(self.style.SUCCESS('✅ Cleared all cache'))
        
        elif options['pattern']:
            pattern = options['pattern']
            invalidate_cache_pattern(pattern)
            self.stdout.write(self.style.SUCCESS(f'✅ Cleared cache matching: {pattern}'))
        
        elif options['geo']:
            visitor_type = options['geo']
            clear_geo_cache(visitor_type)
            self.stdout.write(self.style.SUCCESS(f'✅ Cleared {visitor_type} cache'))
        
        else:
            self.stdout.write(
                self.style.ERROR('❌ Please specify --all, --pattern, or --geo')
            )
