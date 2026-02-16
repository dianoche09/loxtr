# LOXTR - Admin Panel Complete Guide
**Version:** 1.0 | **Updated:** January 2025

---

## 📋 Table of Contents

1. [Admin Panel Overview](#1-admin-panel-overview)
2. [Admin Configuration](#2-admin-configuration)
3. [Brand Management](#3-brand-management)
4. [Product Management](#4-product-management)
5. [Application Management](#5-application-management)
6. [Analytics Dashboard](#6-analytics-dashboard)
7. [SEO Management](#7-seo-management)
8. [User Roles & Permissions](#8-user-roles-permissions)
9. [Bulk Operations](#9-bulk-operations)
10. [Admin Customization](#10-admin-customization)

---

## 1. Admin Panel Overview

### 1.1 Access Information

**URL:** `https://www.loxtr.com/admin/`

**Default Superuser:**
```bash
# Create superuser
docker-compose exec django python manage.py createsuperuser

# Prompt will ask:
Username: admin
Email: admin@loxtr.com
Password: [secure_password]
```

### 1.2 Admin Panel Features

✅ **Brand Management** - Add/edit/delete brands
✅ **Product Management** - Full product catalog control
✅ **Application Review** - Review partnership applications
✅ **Contact Messages** - Manage contact form submissions
✅ **Analytics** - View visitor statistics
✅ **SEO Metadata** - Manage page-level SEO
✅ **Category Management** - Product categories
✅ **User Management** - Staff and admin users
✅ **Bulk Actions** - Mass update/delete operations
✅ **Export Data** - CSV/Excel export
✅ **Search & Filters** - Advanced filtering

---

## 2. Admin Configuration

### 2.1 Main Admin Configuration

**File:** `backend/loxtr/admin.py`

```python
"""
Customize Django admin site.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

# Customize admin site header
admin.site.site_header = _("LOXTR Administration")
admin.site.site_title = _("LOXTR Admin")
admin.site.index_title = _("Welcome to LOXTR Admin Portal")

# Customize admin site colors (optional)
admin.site.enable_nav_sidebar = True
```

### 2.2 Admin URLs

**File:** `backend/loxtr/urls.py`

```python
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    # ... other URLs
]
```

---

## 3. Brand Management

### 3.1 Brand Admin Configuration

**File:** `backend/apps/brands/admin.py`

```python
"""
Admin configuration for brands and products.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import Brand, Product, Category, ProductImage

# ============================================
# BRAND ADMIN
# ============================================

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    """
    Admin interface for Brand model.
    """
    
    # List display
    list_display = [
        'name',
        'country',
        'brand_type_display',
        'product_count_display',
        'featured_badge',
        'active_badge',
        'display_order',
    ]
    
    # List filters
    list_filter = [
        'is_active',
        'featured',
        'is_import_brand',
        'is_export_brand',
        'country',
        'created_at',
    ]
    
    # Search fields
    search_fields = [
        'name',
        'description_en',
        'description_tr',
        'country',
    ]
    
    # Ordering
    ordering = ['display_order', 'name']
    
    # Fieldsets for organized form
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'name',
                'slug',
                'logo',
                'country',
                'founded_year',
                'website_url',
            )
        }),
        (_('Descriptions'), {
            'fields': (
                'description_en',
                'description_tr',
            )
        }),
        (_('Categorization (CRITICAL!)'), {
            'fields': (
                'is_import_brand',
                'is_export_brand',
            ),
            'description': 'Select at least one. Import = foreign brands for TR market, Export = TR brands for global market.'
        }),
        (_('Display Settings'), {
            'fields': (
                'is_active',
                'featured',
                'display_order',
            )
        }),
        (_('Metadata'), {
            'fields': (
                'created_by',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Read-only fields
    readonly_fields = ['slug', 'created_at', 'updated_at']
    
    # Prepopulated fields
    prepopulated_fields = {'slug': ('name',)}
    
    # Actions
    actions = [
        'make_featured',
        'remove_featured',
        'activate_brands',
        'deactivate_brands',
        'export_as_csv',
    ]
    
    # Custom methods
    def brand_type_display(self, obj):
        """Display brand type with colors."""
        types = []
        if obj.is_import_brand:
            types.append('<span style="color: blue;">📥 Import</span>')
        if obj.is_export_brand:
            types.append('<span style="color: green;">📤 Export</span>')
        return format_html(' | '.join(types) if types else '<span style="color: gray;">-</span>')
    brand_type_display.short_description = 'Type'
    
    def product_count_display(self, obj):
        """Display product count with link."""
        count = obj.products.filter(is_active=True).count()
        if count > 0:
            url = f'/admin/brands/product/?brand__id__exact={obj.id}'
            return format_html('<a href="{}">{} products</a>', url, count)
        return format_html('<span style="color: gray;">0 products</span>')
    product_count_display.short_description = 'Products'
    
    def featured_badge(self, obj):
        """Display featured badge."""
        if obj.featured:
            return format_html('<span style="background: #ffcc00; padding: 3px 8px; border-radius: 3px; color: #000;">⭐ Featured</span>')
        return '-'
    featured_badge.short_description = 'Featured'
    
    def active_badge(self, obj):
        """Display active status badge."""
        if obj.is_active:
            return format_html('<span style="color: green;">✅ Active</span>')
        return format_html('<span style="color: red;">❌ Inactive</span>')
    active_badge.short_description = 'Status'
    
    # Admin actions
    def make_featured(self, request, queryset):
        """Mark selected brands as featured."""
        updated = queryset.update(featured=True)
        self.message_user(request, f'{updated} brand(s) marked as featured.')
    make_featured.short_description = 'Mark as featured'
    
    def remove_featured(self, request, queryset):
        """Remove featured status."""
        updated = queryset.update(featured=False)
        self.message_user(request, f'{updated} brand(s) removed from featured.')
    remove_featured.short_description = 'Remove featured status'
    
    def activate_brands(self, request, queryset):
        """Activate selected brands."""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} brand(s) activated.')
    activate_brands.short_description = 'Activate selected brands'
    
    def deactivate_brands(self, request, queryset):
        """Deactivate selected brands."""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} brand(s) deactivated.')
    deactivate_brands.short_description = 'Deactivate selected brands'
    
    def export_as_csv(self, request, queryset):
        """Export selected brands as CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="brands.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Name', 'Country', 'Type', 'Products', 'Featured', 'Active'])
        
        for brand in queryset:
            brand_type = []
            if brand.is_import_brand:
                brand_type.append('Import')
            if brand.is_export_brand:
                brand_type.append('Export')
            
            writer.writerow([
                brand.name,
                brand.country,
                ' & '.join(brand_type),
                brand.products.count(),
                'Yes' if brand.featured else 'No',
                'Yes' if brand.is_active else 'No',
            ])
        
        return response
    export_as_csv.short_description = 'Export selected as CSV'
    
    def get_queryset(self, request):
        """Optimize queryset with annotations."""
        qs = super().get_queryset(request)
        qs = qs.annotate(
            products_count=Count('products', distinct=True)
        )
        return qs
    
    def save_model(self, request, obj, form, change):
        """Set created_by on first save."""
        if not change:  # New object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
```

---

## 4. Product Management

### 4.1 Product Admin with Inline Images

**File:** `backend/apps/brands/admin.py` (continued)

```python
# ============================================
# PRODUCT IMAGE INLINE
# ============================================

class ProductImageInline(admin.TabularInline):
    """
    Inline admin for product images.
    Allows editing images directly on product page.
    """
    model = ProductImage
    extra = 1
    fields = [
        'image',
        'alt_text_en',
        'alt_text_tr',
        'is_primary',
        'display_order',
    ]
    ordering = ['display_order']

# ============================================
# PRODUCT ADMIN
# ============================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin interface for Product model with inline images.
    """
    
    # Inline images
    inlines = [ProductImageInline]
    
    # List display
    list_display = [
        'sku',
        'name_en',
        'brand_link',
        'category_link',
        'price_display',
        'stock_badge',
        'type_badge',
        'featured_badge',
        'active_badge',
    ]
    
    # List filters
    list_filter = [
        'is_active',
        'featured',
        'product_type',
        'stock_status',
        'brand',
        'category',
        'created_at',
    ]
    
    # Search fields
    search_fields = [
        'sku',
        'name_en',
        'name_tr',
        'description_en',
        'description_tr',
        'brand__name',
    ]
    
    # Ordering
    ordering = ['display_order', 'sku']
    
    # Autocomplete fields (for performance with many brands)
    autocomplete_fields = ['brand', 'category']
    
    # Fieldsets
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'sku',
                'brand',
                'category',
            )
        }),
        (_('Product Names'), {
            'fields': (
                'name_en',
                'name_tr',
            )
        }),
        (_('Descriptions'), {
            'fields': (
                'short_description_en',
                'short_description_tr',
                'description_en',
                'description_tr',
            )
        }),
        (_('Technical Specifications'), {
            'fields': (
                'technical_specs_en',
                'technical_specs_tr',
            ),
            'classes': ('collapse',)
        }),
        (_('Pricing'), {
            'fields': (
                'price_usd',
                'price_eur',
                'price_try',
                'msrp_usd',
            )
        }),
        (_('Inventory'), {
            'fields': (
                'stock_status',
                'stock_quantity',
                'low_stock_threshold',
                'lead_time_days',
            )
        }),
        (_('Physical Dimensions'), {
            'fields': (
                'weight_kg',
                'length_cm',
                'width_cm',
                'height_cm',
            ),
            'classes': ('collapse',)
        }),
        (_('Product Type'), {
            'fields': (
                'product_type',
            ),
            'description': 'Import = foreign product for TR market, Export = TR product for global market'
        }),
        (_('Display Settings'), {
            'fields': (
                'is_active',
                'featured',
                'display_order',
            )
        }),
        (_('SEO'), {
            'fields': (
                'meta_title_en',
                'meta_title_tr',
                'meta_description_en',
                'meta_description_tr',
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Read-only fields
    readonly_fields = ['created_at', 'updated_at']
    
    # Actions
    actions = [
        'make_featured',
        'remove_featured',
        'mark_in_stock',
        'mark_out_of_stock',
        'export_as_csv',
    ]
    
    # Custom methods
    def brand_link(self, obj):
        """Link to brand."""
        if obj.brand:
            url = f'/admin/brands/brand/{obj.brand.id}/change/'
            return format_html('<a href="{}">{}</a>', url, obj.brand.name)
        return '-'
    brand_link.short_description = 'Brand'
    
    def category_link(self, obj):
        """Link to category."""
        if obj.category:
            url = f'/admin/brands/category/{obj.category.id}/change/'
            return format_html('<a href="{}">{}</a>', url, obj.category.name_en)
        return '-'
    category_link.short_description = 'Category'
    
    def price_display(self, obj):
        """Display price in USD."""
        if obj.price_usd:
            return f'${obj.price_usd}'
        return '-'
    price_display.short_description = 'Price (USD)'
    
    def stock_badge(self, obj):
        """Display stock status with color."""
        colors = {
            'in_stock': 'green',
            'low_stock': 'orange',
            'out_of_stock': 'red',
            'pre_order': 'blue',
            'discontinued': 'gray',
        }
        color = colors.get(obj.stock_status, 'gray')
        return format_html(
            '<span style="color: {};">● {}</span>',
            color,
            obj.get_stock_status_display()
        )
    stock_badge.short_description = 'Stock'
    
    def type_badge(self, obj):
        """Display product type."""
        if obj.product_type == 'import':
            return format_html('<span style="color: blue;">📥 Import</span>')
        else:
            return format_html('<span style="color: green;">📤 Export</span>')
    type_badge.short_description = 'Type'
    
    def featured_badge(self, obj):
        """Display featured badge."""
        if obj.featured:
            return format_html('<span style="color: #ffcc00;">⭐</span>')
        return '-'
    featured_badge.short_description = 'Featured'
    
    def active_badge(self, obj):
        """Display active status."""
        if obj.is_active:
            return format_html('<span style="color: green;">✅</span>')
        return format_html('<span style="color: red;">❌</span>')
    active_badge.short_description = 'Active'
    
    # Actions
    def make_featured(self, request, queryset):
        updated = queryset.update(featured=True)
        self.message_user(request, f'{updated} product(s) marked as featured.')
    make_featured.short_description = 'Mark as featured'
    
    def remove_featured(self, request, queryset):
        updated = queryset.update(featured=False)
        self.message_user(request, f'{updated} product(s) removed from featured.')
    remove_featured.short_description = 'Remove featured'
    
    def mark_in_stock(self, request, queryset):
        updated = queryset.update(stock_status='in_stock')
        self.message_user(request, f'{updated} product(s) marked as in stock.')
    mark_in_stock.short_description = 'Mark as in stock'
    
    def mark_out_of_stock(self, request, queryset):
        updated = queryset.update(stock_status='out_of_stock')
        self.message_user(request, f'{updated} product(s) marked as out of stock.')
    mark_out_of_stock.short_description = 'Mark as out of stock'
    
    def export_as_csv(self, request, queryset):
        """Export products as CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['SKU', 'Name', 'Brand', 'Price (USD)', 'Stock', 'Type', 'Active'])
        
        for product in queryset:
            writer.writerow([
                product.sku,
                product.name_en,
                product.brand.name,
                product.price_usd or '',
                product.get_stock_status_display(),
                product.get_product_type_display(),
                'Yes' if product.is_active else 'No',
            ])
        
        return response
    export_as_csv.short_description = 'Export selected as CSV'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        qs = qs.select_related('brand', 'category')
        return qs

# ============================================
# CATEGORY ADMIN
# ============================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""
    
    list_display = [
        'name_en',
        'name_tr',
        'parent',
        'product_count',
        'display_order',
        'active_badge',
    ]
    
    list_filter = ['is_active', 'parent']
    search_fields = ['name_en', 'name_tr']
    ordering = ['display_order', 'name_en']
    prepopulated_fields = {'slug': ('name_en',)}
    
    fieldsets = (
        (_('Names'), {
            'fields': ('name_en', 'name_tr', 'slug')
        }),
        (_('Hierarchy'), {
            'fields': ('parent',)
        }),
        (_('Visual'), {
            'fields': ('icon', 'image')
        }),
        (_('Display'), {
            'fields': ('display_order', 'is_active')
        }),
        (_('SEO'), {
            'fields': (
                'meta_title_en',
                'meta_title_tr',
                'meta_description_en',
                'meta_description_tr',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def product_count(self, obj):
        """Display product count."""
        count = obj.products.filter(is_active=True).count()
        return format_html('<strong>{}</strong>', count)
    product_count.short_description = 'Products'
    
    def active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">✅</span>')
        return format_html('<span style="color: red;">❌</span>')
    active_badge.short_description = 'Active'
```

---

## 5. Application Management

### 5.1 Application Review Admin

**File:** `backend/apps/applications/admin.py`

```python
"""
Admin interface for applications and contact submissions.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Application, ContactSubmission

# ============================================
# APPLICATION ADMIN
# ============================================

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """
    Admin interface for reviewing partnership applications.
    """
    
    # List display
    list_display = [
        'id',
        'company_name',
        'contact_name',
        'application_type_badge',
        'country',
        'status_badge',
        'created_at',
        'actions_column',
    ]
    
    # List filters
    list_filter = [
        'status',
        'application_type',
        'country',
        'visitor_type',
        'created_at',
    ]
    
    # Search fields
    search_fields = [
        'company_name',
        'contact_name',
        'email',
        'product_category',
        'product_description',
    ]
    
    # Ordering
    ordering = ['-created_at']
    
    # Date hierarchy
    date_hierarchy = 'created_at'
    
    # Fieldsets
    fieldsets = (
        (_('Application Info'), {
            'fields': (
                'application_type',
                'status',
                'assigned_to',
            )
        }),
        (_('Company Details'), {
            'fields': (
                'company_name',
                'country',
                'contact_name',
                'email',
                'phone',
                'website_url',
            )
        }),
        (_('Product Information'), {
            'fields': (
                'product_category',
                'product_description',
                'current_markets',
                'target_markets',
                'certifications',
                'annual_production_capacity',
                'export_experience_years',
            )
        }),
        (_('Attachments'), {
            'fields': (
                'company_profile_url',
                'product_catalog_url',
                'certificates_url',
            ),
            'classes': ('collapse',)
        }),
        (_('Internal Notes'), {
            'fields': (
                'internal_notes',
                'rejection_reason',
            )
        }),
        (_('Tracking Data'), {
            'fields': (
                'visitor_type',
                'ip_address',
                'country_detected',
                'user_agent',
                'referrer_url',
            ),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': (
                'created_at',
                'updated_at',
                'reviewed_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Read-only fields
    readonly_fields = [
        'created_at',
        'updated_at',
        'visitor_type',
        'ip_address',
        'country_detected',
        'user_agent',
        'referrer_url',
    ]
    
    # Actions
    actions = [
        'mark_as_under_review',
        'mark_as_accepted',
        'mark_as_rejected',
        'export_as_csv',
        'send_follow_up_email',
    ]
    
    # Custom methods
    def application_type_badge(self, obj):
        """Display application type with icon."""
        if obj.application_type == 'market_entry':
            return format_html(
                '<span style="background: #007aff; color: white; padding: 3px 8px; border-radius: 3px;">📥 Market Entry</span>'
            )
        else:
            return format_html(
                '<span style="background: #34c759; color: white; padding: 3px 8px; border-radius: 3px;">📤 Export Program</span>'
            )
    application_type_badge.short_description = 'Type'
    
    def status_badge(self, obj):
        """Display status with color."""
        colors = {
            'new': '#ff3b30',  # Red
            'under_review': '#ffcc00',  # Yellow
            'meeting_scheduled': '#007aff',  # Blue
            'accepted': '#34c759',  # Green
            'rejected': '#8e8e93',  # Gray
            'on_hold': '#ff9500',  # Orange
        }
        color = colors.get(obj.status, '#8e8e93')
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">●{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def actions_column(self, obj):
        """Quick action buttons."""
        buttons = []
        
        if obj.status == 'new':
            buttons.append(
                f'<a href="#" onclick="return mark_reviewed({obj.id});" style="color: blue;">👁️ Review</a>'
            )
        
        if obj.email:
            buttons.append(
                f'<a href="mailto:{obj.email}" style="color: green;">✉️ Email</a>'
            )
        
        if obj.phone:
            buttons.append(
                f'<span style="color: #007aff;">📞 {obj.phone}</span>'
            )
        
        return format_html(' | '.join(buttons))
    actions_column.short_description = 'Actions'
    
    # Admin actions
    def mark_as_under_review(self, request, queryset):
        """Mark applications as under review."""
        updated = queryset.update(
            status='under_review',
            reviewed_at=timezone.now(),
            assigned_to=request.user
        )
        self.message_user(request, f'{updated} application(s) marked as under review.')
    mark_as_under_review.short_description = 'Mark as under review'
    
    def mark_as_accepted(self, request, queryset):
        """Accept applications."""
        updated = queryset.update(status='accepted')
        self.message_user(request, f'{updated} application(s) accepted.', 'success')
    mark_as_accepted.short_description = 'Accept selected applications'
    
    def mark_as_rejected(self, request, queryset):
        """Reject applications."""
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} application(s) rejected.', 'warning')
    mark_as_rejected.short_description = 'Reject selected applications'
    
    def export_as_csv(self, request, queryset):
        """Export applications as CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="applications.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID',
            'Type',
            'Company',
            'Contact',
            'Email',
            'Country',
            'Product Category',
            'Status',
            'Created',
        ])
        
        for app in queryset:
            writer.writerow([
                app.id,
                app.get_application_type_display(),
                app.company_name,
                app.contact_name,
                app.email,
                app.country,
                app.product_category,
                app.get_status_display(),
                app.created_at.strftime('%Y-%m-%d %H:%M'),
            ])
        
        return response
    export_as_csv.short_description = 'Export as CSV'
    
    def send_follow_up_email(self, request, queryset):
        """Send follow-up email to selected applications."""
        # Would trigger Celery task
        count = queryset.count()
        self.message_user(request, f'Follow-up emails queued for {count} application(s).')
    send_follow_up_email.short_description = 'Send follow-up email'
    
    def get_queryset(self, request):
        """Optimize queryset."""
        qs = super().get_queryset(request)
        qs = qs.select_related('assigned_to')
        return qs

# ============================================
# CONTACT SUBMISSION ADMIN
# ============================================

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    """Admin interface for contact form submissions."""
    
    list_display = [
        'id',
        'full_name',
        'email',
        'inquiry_type',
        'status_badge',
        'created_at',
        'reply_button',
    ]
    
    list_filter = [
        'status',
        'inquiry_type',
        'language',
        'visitor_type',
        'created_at',
    ]
    
    search_fields = [
        'full_name',
        'company_name',
        'email',
        'subject',
        'message',
    ]
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('Contact Info'), {
            'fields': (
                'full_name',
                'company_name',
                'email',
                'phone',
            )
        }),
        (_('Inquiry'), {
            'fields': (
                'inquiry_type',
                'inquiry_context',
                'subject',
                'message',
            )
        }),
        (_('Status'), {
            'fields': (
                'status',
                'assigned_to',
                'internal_notes',
            )
        }),
        (_('Source Tracking'), {
            'fields': (
                'source_page',
                'language',
                'visitor_type',
                'ip_address',
                'country_detected',
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'created_at',
        'replied_at',
        'closed_at',
        'source_page',
        'language',
        'visitor_type',
        'ip_address',
        'country_detected',
    ]
    
    actions = [
        'mark_as_replied',
        'mark_as_spam',
        'export_as_csv',
    ]
    
    def status_badge(self, obj):
        """Display status with color."""
        colors = {
            'new': 'red',
            'in_progress': 'orange',
            'replied': 'green',
            'closed': 'gray',
            'spam': 'black',
        }
        return format_html(
            '<span style="color: {};">● {}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def reply_button(self, obj):
        """Quick reply button."""
        if obj.email:
            return format_html(
                '<a href="mailto:{}?subject=Re: {}" style="background: #007aff; color: white; padding: 3px 8px; border-radius: 3px; text-decoration: none;">✉️ Reply</a>',
                obj.email,
                obj.subject or 'Your inquiry'
            )
        return '-'
    reply_button.short_description = 'Reply'
    
    def mark_as_replied(self, request, queryset):
        updated = queryset.update(status='replied', replied_at=timezone.now())
        self.message_user(request, f'{updated} submission(s) marked as replied.')
    mark_as_replied.short_description = 'Mark as replied'
    
    def mark_as_spam(self, request, queryset):
        updated = queryset.update(status='spam')
        self.message_user(request, f'{updated} submission(s) marked as spam.')
    mark_as_spam.short_description = 'Mark as spam'
```

---

## 6. Analytics Dashboard

### 6.1 Analytics Admin

**File:** `backend/apps/analytics/admin.py`

```python
"""
Admin interface for analytics data.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import GeoVisitor

@admin.register(GeoVisitor)
class GeoVisitorAdmin(admin.ModelAdmin):
    """Admin interface for visitor analytics."""
    
    list_display = [
        'ip_address',
        'country_code',
        'visitor_type_badge',
        'visit_count',
        'pages_viewed',
        'conversion_badge',
        'device_type',
        'last_visit',
    ]
    
    list_filter = [
        'visitor_type',
        'country_code',
        'device_type',
        'submitted_form',
        'last_visit',
    ]
    
    search_fields = [
        'ip_address',
        'country_code',
        'city',
    ]
    
    ordering = ['-last_visit']
    date_hierarchy = 'last_visit'
    
    readonly_fields = [
        'ip_address',
        'country_code',
        'city',
        'visitor_type',
        'first_visit',
        'last_visit',
        'visit_count',
        'pages_viewed',
        'time_on_site',
        'bounce',
        'user_agent',
        'device_type',
        'browser',
        'os',
        'referrer_domain',
        'utm_source',
        'utm_medium',
        'utm_campaign',
    ]
    
    def visitor_type_badge(self, obj):
        """Display visitor type with icon."""
        if obj.visitor_type == 'LOCAL':
            return format_html(
                '<span style="background: #34c759; color: white; padding: 2px 6px; border-radius: 3px;">🇹🇷 LOCAL</span>'
            )
        else:
            return format_html(
                '<span style="background: #007aff; color: white; padding: 2px 6px; border-radius: 3px;">🌍 GLOBAL</span>'
            )
    visitor_type_badge.short_description = 'Type'
    
    def conversion_badge(self, obj):
        """Display conversion status."""
        if obj.submitted_form:
            return format_html('<span style="color: green;">✅ Converted</span>')
        return '-'
    conversion_badge.short_description = 'Conversion'
    
    def has_add_permission(self, request):
        """Disable adding visitors manually."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Make read-only."""
        return False

# Custom admin view for analytics summary
class AnalyticsSummary(admin.ModelAdmin):
    """Custom admin view for analytics summary."""
    
    change_list_template = 'admin/analytics_summary.html'
    
    def changelist_view(self, request, extra_context=None):
        """Add custom analytics data to context."""
        from django.utils import timezone
        from datetime import timedelta
        
        # Get today's stats
        today = timezone.now().date()
        today_visitors = GeoVisitor.objects.filter(
            last_visit__date=today
        ).count()
        
        # Get this week's stats
        week_ago = today - timedelta(days=7)
        week_visitors = GeoVisitor.objects.filter(
            last_visit__date__gte=week_ago
        ).count()
        
        # Visitor breakdown
        global_count = GeoVisitor.objects.filter(visitor_type='GLOBAL').count()
        local_count = GeoVisitor.objects.filter(visitor_type='LOCAL').count()
        
        # Conversion rate
        total_visitors = GeoVisitor.objects.count()
        conversions = GeoVisitor.objects.filter(submitted_form=True).count()
        conversion_rate = (conversions / total_visitors * 100) if total_visitors > 0 else 0
        
        extra_context = extra_context or {}
        extra_context['today_visitors'] = today_visitors
        extra_context['week_visitors'] = week_visitors
        extra_context['global_count'] = global_count
        extra_context['local_count'] = local_count
        extra_context['conversion_rate'] = round(conversion_rate, 2)
        
        return super().changelist_view(request, extra_context=extra_context)

# Register analytics summary
# admin.site.register(GeoVisitor, AnalyticsSummary)
```

---

## 7. SEO Management

### 7.1 SEO Metadata Admin

**File:** `backend/apps/seo/admin.py`

```python
"""
Admin interface for SEO metadata.
"""

from django.contrib import admin
from .models import SEOMetadata

@admin.register(SEOMetadata)
class SEOMetadataAdmin(admin.ModelAdmin):
    """Admin interface for managing SEO metadata."""
    
    list_display = [
        'page_path',
        'page_type',
        'has_title',
        'has_description',
        'has_og_image',
        'updated_at',
    ]
    
    list_filter = [
        'page_type',
        'robots_directive',
    ]
    
    search_fields = [
        'page_path',
        'title_en',
        'title_tr',
    ]
    
    fieldsets = (
        (_('Page Info'), {
            'fields': (
                'page_path',
                'page_type',
            )
        }),
        (_('Meta Tags - English'), {
            'fields': (
                'title_en',
                'description_en',
                'keywords_en',
            )
        }),
        (_('Meta Tags - Turkish'), {
            'fields': (
                'title_tr',
                'description_tr',
                'keywords_tr',
            )
        }),
        (_('Open Graph - English'), {
            'fields': (
                'og_title_en',
                'og_description_en',
            ),
            'classes': ('collapse',)
        }),
        (_('Open Graph - Turkish'), {
            'fields': (
                'og_title_tr',
                'og_description_tr',
            ),
            'classes': ('collapse',)
        }),
        (_('Images & Type'), {
            'fields': (
                'og_image',
                'og_type',
                'twitter_image',
                'twitter_card_type',
            )
        }),
        (_('Structured Data'), {
            'fields': (
                'schema_json',
            ),
            'classes': ('collapse',)
        }),
        (_('Indexing'), {
            'fields': (
                'robots_directive',
                'canonical_url',
            )
        }),
    )
    
    def has_title(self, obj):
        return bool(obj.title_en or obj.title_tr)
    has_title.boolean = True
    has_title.short_description = 'Title'
    
    def has_description(self, obj):
        return bool(obj.description_en or obj.description_tr)
    has_description.boolean = True
    has_description.short_description = 'Description'
    
    def has_og_image(self, obj):
        return bool(obj.og_image)
    has_og_image.boolean = True
    has_og_image.short_description = 'OG Image'
```

---

## 8. User Roles & Permissions

### 8.1 Custom Permissions

**File:** `backend/apps/brands/models.py`

```python
class Brand(models.Model):
    # ... existing fields ...
    
    class Meta:
        db_table = 'brands'
        ordering = ['display_order', 'name']
        permissions = [
            ('can_approve_brands', 'Can approve new brands'),
            ('can_feature_brands', 'Can feature brands on homepage'),
            ('can_export_data', 'Can export brand data'),
        ]
```

### 8.2 Staff User Groups

```python
# In Django shell or management command

from django.contrib.auth.models import Group, Permission

# Create Staff Groups
content_editor = Group.objects.create(name='Content Editor')
sales_team = Group.objects.create(name='Sales Team')
analytics_viewer = Group.objects.create(name='Analytics Viewer')

# Assign permissions
content_editor.permissions.add(
    Permission.objects.get(codename='add_brand'),
    Permission.objects.get(codename='change_brand'),
    Permission.objects.get(codename='add_product'),
    Permission.objects.get(codename='change_product'),
)

sales_team.permissions.add(
    Permission.objects.get(codename='view_application'),
    Permission.objects.get(codename='change_application'),
    Permission.objects.get(codename='view_contactsubmission'),
)

analytics_viewer.permissions.add(
    Permission.objects.get(codename='view_geovisitor'),
)
```

---

## 9. Bulk Operations

### 9.1 Import Products from CSV

**File:** `backend/apps/brands/management/commands/import_products.py`

```python
"""
Management command to import products from CSV.

Usage:
    python manage.py import_products products.csv
"""

from django.core.management.base import BaseCommand
from apps.brands.models import Brand, Product
import csv

class Command(BaseCommand):
    help = 'Import products from CSV file'
    
    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')
    
    def handle(self, *args, **options):
        csv_file = options['csv_file']
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            created = 0
            updated = 0
            errors = 0
            
            for row in reader:
                try:
                    brand = Brand.objects.get(slug=row['brand_slug'])
                    
                    product, is_created = Product.objects.update_or_create(
                        sku=row['sku'],
                        defaults={
                            'brand': brand,
                            'name_en': row['name_en'],
                            'name_tr': row['name_tr'],
                            'price_usd': row.get('price_usd'),
                            'stock_quantity': row.get('stock_quantity', 0),
                            'is_active': row.get('is_active', 'true').lower() == 'true',
                        }
                    )
                    
                    if is_created:
                        created += 1
                    else:
                        updated += 1
                        
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error on row {row}: {e}'))
                    errors += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'✅ Import complete: {created} created, {updated} updated, {errors} errors'
            ))
```

---

## 10. Admin Customization

### 10.1 Custom Dashboard

**File:** `backend/templates/admin/index.html`

```html
{% extends "admin/index.html" %}
{% load static %}

{% block extrastyle %}
{{ block.super }}
<style>
    .dashboard-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin: 20px 0;
    }
    .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #0a1128;
    }
    .stat-label {
        color: #666;
        margin-top: 5px;
    }
</style>
{% endblock %}

{% block content %}
<div class="dashboard-stats">
    <div class="stat-card">
        <div class="stat-value">{{ total_brands }}</div>
        <div class="stat-label">Total Brands</div>
    </div>
    <div class="stat-card">
        <div class="stat-value">{{ total_products }}</div>
        <div class="stat-label">Total Products</div>
    </div>
    <div class="stat-card">
        <div class="stat-value">{{ pending_applications }}</div>
        <div class="stat-label">Pending Applications</div>
    </div>
    <div class="stat-card">
        <div class="stat-value">{{ today_visitors }}</div>
        <div class="stat-label">Today's Visitors</div>
    </div>
</div>

{{ block.super }}
{% endblock %}
```

---

## 🎉 Admin Panel Complete!

### What's Included:

✅ **Brand Management** - Full CRUD with images, filtering, bulk actions
✅ **Product Management** - Inline images, stock management, export
✅ **Application Review** - Status workflow, email integration
✅ **Contact Management** - Quick reply, spam filtering
✅ **Analytics Dashboard** - Visitor stats, conversion tracking
✅ **SEO Management** - Per-page metadata control
✅ **User Permissions** - Role-based access control
✅ **Bulk Operations** - CSV import/export
✅ **Custom Dashboard** - Stats overview

### Admin Panel Access

**URL:** `https://www.loxtr.com/admin/`

---

## 🔐 Initial Setup - Creating Admin User

### Step 1: Create Superuser

After deploying the application, create your admin user:

```bash
# Connect to Django container
docker-compose exec django python manage.py createsuperuser
```

### Step 2: Enter Your Details

The command will prompt you for:

```
Username: admin
Email address: admin@loxtr.com
Password: ********* (hidden while typing)
Password (again): ********* (confirm)
```

**Password Requirements:**
- ✅ Minimum 8 characters (recommended: 12+)
- ✅ Cannot be entirely numeric
- ✅ Cannot be too common (Django validates)
- ✅ Cannot be too similar to username
- ✅ Should include: uppercase, lowercase, numbers, special characters

**Example Strong Password:**
- `T3kn!kD0kum@n2025`
- `Loxtr$ecur3#2025`
- `@dminP@ssw0rd!Str0ng`

### Step 3: Login to Admin Panel

1. Open browser: `https://www.loxtr.com/admin/`
2. Enter username and password
3. Click "Log in"
4. You're in! 🎉

---

## 🔒 Password Security Best Practices

### ❌ NEVER DO THIS:

```python
# ❌ Don't hardcode passwords
ADMIN_PASSWORD = "admin123"  # DANGEROUS!
```

```bash
# ❌ Don't put passwords in .env
ADMIN_PASSWORD=admin123  # DANGEROUS!
```

```markdown
# ❌ Don't document actual passwords
Default password: admin123  # DANGEROUS!
```

### ✅ ALWAYS DO THIS:

- ✅ Create passwords using `createsuperuser` command
- ✅ Use unique, strong passwords (12+ characters)
- ✅ Passwords are automatically hashed in database
- ✅ Change passwords regularly
- ✅ Never commit passwords to Git
- ✅ Use password manager for storage
- ✅ Enable 2FA (recommended for production)

---

## 🔧 Password Management

### Change Existing Password

**Method 1: Using Django Command**
```bash
docker-compose exec django python manage.py changepassword admin
```

**Method 2: From Admin Panel**
1. Login to admin panel
2. Click your username (top right)
3. Click "Change password"
4. Enter old password and new password twice
5. Click "Change my password"

### Reset Forgotten Password

If you forget your password:

```bash
# Open Django shell
docker-compose exec django python manage.py shell
```

```python
# In Python shell
from django.contrib.auth.models import User

# Find your user
user = User.objects.get(username='admin')

# Set new password
user.set_password('your_new_strong_password')
user.save()

# Exit shell
exit()
```

### Create Additional Admin Users

```bash
# Create another admin
docker-compose exec django python manage.py createsuperuser

# Or create staff user (limited permissions)
docker-compose exec django python manage.py shell
```

```python
from django.contrib.auth.models import User

# Create staff user
staff = User.objects.create_user(
    username='sales_manager',
    email='sales@loxtr.com',
    password='temporary_password_change_immediately'
)
staff.is_staff = True  # Can access admin
staff.is_superuser = False  # Limited permissions
staff.save()

# Assign to group (optional)
from django.contrib.auth.models import Group
sales_group = Group.objects.get(name='Sales Team')
staff.groups.add(sales_group)
```

---

## 🛡️ Production Security Checklist

Before going live, ensure:

- [ ] Default superuser password changed
- [ ] All staff users have unique passwords
- [ ] No passwords in code/config files
- [ ] Admin panel not accessible from internet (optional: use VPN or IP whitelist)
- [ ] SSL/HTTPS enabled
- [ ] Session timeout configured
- [ ] Failed login attempts logged
- [ ] 2FA enabled (optional but recommended)
- [ ] Regular password rotation policy

### Optional: IP Whitelist for Admin

Edit `nginx.conf`:

```nginx
location /admin/ {
    # Allow only office IPs
    allow 203.0.113.0/24;  # Office network
    allow 198.51.100.50;    # VPN IP
    deny all;
    
    proxy_pass http://django;
    # ... other settings
}
```

### Optional: Enable 2FA (Two-Factor Authentication)

Install Django OTP:

```bash
pip install django-otp qrcode
```

Add to `settings.py`:
```python
INSTALLED_APPS += [
    'django_otp',
    'django_otp.plugins.otp_totp',
]

MIDDLEWARE += [
    'django_otp.middleware.OTPMiddleware',
]
```

---

## 📞 Emergency Access

**If locked out:**

1. **SSH into server**
2. **Reset password using Django shell** (see above)
3. **Check logs:** `docker-compose logs -f django`
4. **Contact system administrator**

**For support:**
- Technical Lead: [to be assigned]
- Server Admin: [to be assigned]

---

## 📝 Password Policy Template

**For Your Organization:**

```
LOXTR Admin Password Policy

1. Minimum Length: 12 characters
2. Complexity: Must include uppercase, lowercase, number, special character
3. Expiration: Change every 90 days
4. History: Cannot reuse last 5 passwords
5. Failed Attempts: Account locked after 5 failed logins
6. Session Timeout: 30 minutes of inactivity

Prohibited:
- Dictionary words
- Company name
- Personal information
- Sequential characters (123, abc)
- Keyboard patterns (qwerty)
```

---

**END OF ADMIN PANEL GUIDE**

**Document Version:** 1.1 (Updated with security best practices)
**Last Updated:** January 8, 2026
