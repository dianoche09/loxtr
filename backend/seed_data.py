import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'loxtr.settings')
django.setup()

from apps.brands.models import Brand, Category, Product
from django.utils.text import slugify

def seed():
    print("🌱 Seeding data...")
    
    # Create Categories
    cat_construction, _ = Category.objects.get_or_create(
        name_en="Construction",
        name_tr="İnşaat",
        slug="construction",
        display_order=1
    )
    
    cat_energy, _ = Category.objects.get_or_create(
        name_en="Energy",
        name_tr="Enerji",
        slug="energy",
        display_order=2
    )
    
    # Create Brands
    brand_loxtr, _ = Brand.objects.get_or_create(
        name="LOXTR Global",
        slug="loxtr-global",
        is_export_brand=True,
        is_import_brand=False,
        description_en="Leading export brand from Turkey.",
        description_tr="Türkiye'nin öncü ihracat markası.",
    )
    
    brand_import, _ = Brand.objects.get_or_create(
        name="Import Partner",
        slug="import-partner",
        is_export_brand=False,
        is_import_brand=True,
        description_en="Global partner for Turkish market.",
        description_tr="Türkiye pazarı için küresel ortak.",
    )
    
    # Create Products
    Product.objects.get_or_create(
        brand=brand_loxtr,
        category=cat_construction,
        sku="LX-CON-01",
        name_en="Steel Beam X1",
        name_tr="Çelik Kiriş X1",
        product_type="export",
        price_usd=100.00,
        stock_quantity=50
    )
    
    Product.objects.get_or_create(
        brand=brand_import,
        category=cat_energy,
        sku="IMP-EN-01",
        name_en="Solar Panel Pro",
        name_tr="Güneş Paneli Pro",
        product_type="import",
        price_eur=250.00,
        stock_quantity=20
    )
    
    print("✅ Seeding complete!")

if __name__ == "__main__":
    seed()
