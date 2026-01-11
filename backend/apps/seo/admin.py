"""
Admin configuration for SEO and Site Settings.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import SEOMetadata, SiteSettings

@admin.register(SEOMetadata)
class SEOMetadataAdmin(admin.ModelAdmin):
    """Admin interface for SEO Metadata."""
    
    list_display = ['page_path', 'page_type', 'robots_directive', 'updated_at']
    list_filter = ['page_type', 'robots_directive']
    search_fields = ['page_path', 'title_en', 'title_tr']
    
    fieldsets = (
        (_('Page Info'), {
            'fields': ('page_path', 'page_type')
        }),
        (_('Meta Tags - English'), {
            'fields': ('title_en', 'description_en', 'keywords_en')
        }),
        (_('Meta Tags - Turkish'), {
            'fields': ('title_tr', 'description_tr', 'keywords_tr'),
            'classes': ('collapse',)
        }),
        (_('Open Graph - English'), {
            'fields': ('og_title_en', 'og_description_en', 'og_image', 'og_type'),
            'classes': ('collapse',)
        }),
        (_('Open Graph - Turkish'), {
            'fields': ('og_title_tr', 'og_description_tr'),
            'classes': ('collapse',)
        }),
        (_('Twitter Card - English'), {
            'fields': ('twitter_card_type', 'twitter_title_en', 'twitter_description_en', 'twitter_image'),
            'classes': ('collapse',)
        }),
        (_('Twitter Card - Turkish'), {
            'fields': ('twitter_title_tr', 'twitter_description_tr'),
            'classes': ('collapse',)
        }),
        (_('Advanced'), {
            'fields': ('schema_json', 'robots_directive', 'canonical_url'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """
    Admin interface for Site Settings.
    Only one instance exists - this is a singleton model.
    """
    
    def has_add_permission(self, request):
        """Prevent adding more than one instance."""
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion."""
        return False
    
    fieldsets = (
        (_('🏢 Company Information'), {
            'fields': ('company_name', 'company_tagline', 'company_email', 'company_phone', 'whatsapp_number'),
            'description': 'Basic company contact information displayed across the site.'
        }),
        (_('📍 Office Details'), {
            'fields': ('office_address_en', 'office_address_tr', 'working_hours_en', 'working_hours_tr'),
            'description': 'Office address and working hours in both languages.'
        }),
        (_('📱 Social Media'), {
            'fields': ('linkedin_url', 'instagram_url', 'youtube_url', 'twitter_url', 'facebook_url'),
            'description': 'Social media profile URLs.'
        }),
        (_('📊 SEO & Analytics'), {
            'fields': ('google_analytics_id', 'google_tag_manager_id', 'google_site_verification'),
            'description': 'Google Analytics, Tag Manager, and site verification codes.',
            'classes': ('collapse',)
        }),
        (_('⚙️ Features'), {
            'fields': ('enable_newsletter', 'enable_whatsapp_button', 'enable_live_chat'),
            'description': 'Enable or disable site features.'
        }),
        (_('🔧 Maintenance Mode'), {
            'fields': ('maintenance_mode', 'maintenance_message_en', 'maintenance_message_tr'),
            'description': 'Enable maintenance mode to show a maintenance page to visitors.',
            'classes': ('collapse',)
        }),
        (_('📝 Metadata'), {
            'fields': ('updated_at', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['updated_at', 'updated_by']
    
    def save_model(self, request, obj, form, change):
        """Set updated_by to current user."""
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
    
    def changelist_view(self, request, extra_context=None):
        """Redirect to edit page if settings exist."""
        if SiteSettings.objects.exists():
            obj = SiteSettings.objects.first()
            return self.changeform_view(request, str(obj.pk), '', extra_context)
        return super().changelist_view(request, extra_context)
