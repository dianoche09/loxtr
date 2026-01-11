from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from apps.brands.models import Brand, Product, Category

class StaticViewSitemap(Sitemap):
    priority = 0.5
    changefreq = 'weekly'

    def items(self):
        return [
            ('global:homepage', 'en'),
            ('global:market_entry', 'en'),
            ('local:homepage', 'tr'),
            ('local:distribution', 'tr'),
        ]

    def location(self, item):
        return reverse(item[0])

class BrandSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        # We handle both global and local brands here or separate them
        return Brand.objects.all()

    def lastmod(self, obj):
        return obj.updated_at

class ProductSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.6

    def items(self):
        return Product.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

class CategorySitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5

    def items(self):
        return Category.objects.all()
