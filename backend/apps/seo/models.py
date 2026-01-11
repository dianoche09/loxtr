"""
Dynamic SEO metadata per page.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)

class SEOMetadata(models.Model):
    """
    Dynamic SEO metadata per page.
    """
    
    # Page Identification
    page_path = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        verbose_name=_("Page Path"),
        help_text=_("e.g., /en/market-entry/")
    )
    page_type = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Page Type"),
        help_text=_("homepage, category, product, content")
    )
    
    # Meta Tags (Multi-language)
    title_en = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Title (English)")
    )
    title_tr = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Title (Turkish)")
    )
    description_en = models.TextField(
        blank=True,
        verbose_name=_("Description (English)")
    )
    description_tr = models.TextField(
        blank=True,
        verbose_name=_("Description (Turkish)")
    )
    keywords_en = models.TextField(
        blank=True,
        verbose_name=_("Keywords (English)"),
        help_text=_("Comma-separated")
    )
    keywords_tr = models.TextField(
        blank=True,
        verbose_name=_("Keywords (Turkish)"),
        help_text=_("Comma-separated")
    )
    
    # Open Graph
    og_title_en = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("OG Title (English)")
    )
    og_title_tr = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("OG Title (Turkish)")
    )
    og_description_en = models.TextField(
        blank=True,
        verbose_name=_("OG Description (English)")
    )
    og_description_tr = models.TextField(
        blank=True,
        verbose_name=_("OG Description (Turkish)")
    )
    og_image = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("OG Image URL")
    )
    og_type = models.CharField(
        max_length=50,
        default='website',
        verbose_name=_("OG Type")
    )
    
    # Twitter Card
    twitter_card_type = models.CharField(
        max_length=50,
        default='summary_large_image',
        verbose_name=_("Twitter Card Type")
    )
    twitter_title_en = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Twitter Title (English)")
    )
    twitter_title_tr = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Twitter Title (Turkish)")
    )
    twitter_description_en = models.TextField(
        blank=True,
        verbose_name=_("Twitter Description (English)")
    )
    twitter_description_tr = models.TextField(
        blank=True,
        verbose_name=_("Twitter Description (Turkish)")
    )
    twitter_image = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Twitter Image URL")
    )
    
    # Structured Data (JSON-LD)
    schema_json = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Schema.org JSON-LD"),
        help_text=_("Structured data for rich snippets")
    )
    
    # Indexing Control
    robots_directive = models.CharField(
        max_length=100,
        default='index, follow',
        verbose_name=_("Robots Directive")
    )
    canonical_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Canonical URL")
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'seo_metadata'
        ordering = ['page_path']
        verbose_name = _("SEO Metadata")
        verbose_name_plural = _("SEO Metadata")
        indexes = [
            models.Index(fields=['page_path']),
            models.Index(fields=['page_type']),
        ]
    
    def __str__(self):
        return self.page_path
    
    def get_title(self, language='en'):
        """Get title in specified language."""
        return self.title_tr if language == 'tr' else self.title_en
    
    def get_description(self, language='en'):
        """Get description in specified language."""
        return self.description_tr if language == 'tr' else self.description_en


class SiteSettings(models.Model):
    """
    Singleton model for global site settings.
    Only one instance should exist - editable from admin panel.
    """
    
    # Company Information
    company_name = models.CharField(max_length=255, default="LOXTR", verbose_name=_("Company Name"))
    company_tagline = models.CharField(max_length=255, default="Locate • Obtain • Xport", verbose_name=_("Tagline"))
    company_email = models.EmailField(default="info@loxtr.com", verbose_name=_("Email"))
    company_phone = models.CharField(max_length=50, default="+90 (212) XXX XX XX", verbose_name=_("Phone"))
    whatsapp_number = models.CharField(max_length=50, default="+90 5XX XXX XX XX", verbose_name=_("WhatsApp Number"))
    
    # Office Address
    office_address_en = models.TextField(default="Istanbul, Turkey", verbose_name=_("Office Address (English)"))
    office_address_tr = models.TextField(default="İstanbul, Türkiye", verbose_name=_("Office Address (Turkish)"))
    
    # Working Hours
    working_hours_en = models.TextField(default="Monday - Friday: 9:00 AM - 6:00 PM", verbose_name=_("Working Hours (English)"))
    working_hours_tr = models.TextField(default="Pazartesi - Cuma: 09:00 - 18:00", verbose_name=_("Working Hours (Turkish)"))
    
    # Social Media
    linkedin_url = models.URLField(max_length=500, default="https://linkedin.com/company/loxtrcom", verbose_name=_("LinkedIn URL"))
    instagram_url = models.URLField(max_length=500, default="https://instagram.com/loxtrcom", verbose_name=_("Instagram URL"))
    youtube_url = models.URLField(max_length=500, default="https://youtube.com/@loxtrcom", verbose_name=_("YouTube URL"))
    twitter_url = models.URLField(max_length=500, blank=True, verbose_name=_("Twitter/X URL"))
    facebook_url = models.URLField(max_length=500, blank=True, verbose_name=_("Facebook URL"))
    
    # SEO & Analytics
    google_analytics_id = models.CharField(max_length=50, blank=True, verbose_name=_("Google Analytics ID"), help_text=_("e.g., G-XXXXXXXXXX"))
    google_tag_manager_id = models.CharField(max_length=50, blank=True, verbose_name=_("Google Tag Manager ID"), help_text=_("e.g., GTM-XXXXXXX"))
    google_site_verification = models.CharField(max_length=100, blank=True, verbose_name=_("Google Site Verification Code"))
    
    # Features
    enable_newsletter = models.BooleanField(default=True, verbose_name=_("Enable Newsletter"))
    enable_whatsapp_button = models.BooleanField(default=True, verbose_name=_("Enable WhatsApp Button"))
    enable_live_chat = models.BooleanField(default=False, verbose_name=_("Enable Live Chat"))
    
    # Maintenance Mode
    maintenance_mode = models.BooleanField(default=False, verbose_name=_("Maintenance Mode"), help_text=_("Enable to show maintenance page"))
    maintenance_message_en = models.TextField(blank=True, verbose_name=_("Maintenance Message (English)"))
    maintenance_message_tr = models.TextField(blank=True, verbose_name=_("Maintenance Message (Turkish)"))
    
    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Last Updated By"))
    
    class Meta:
        db_table = 'site_settings'
        verbose_name = _("Site Settings")
        verbose_name_plural = _("Site Settings")
    
    def __str__(self):
        return "Site Settings"
    
    def save(self, *args, **kwargs):
        """Ensure only one instance exists and clear cache."""
        self.pk = 1
        super().save(*args, **kwargs)
        from django.core.cache import cache
        cache.delete('site_settings')
    
    def delete(self, *args, **kwargs):
        """Prevent deletion."""
        pass
    
    @classmethod
    def load(cls):
        """Load settings from cache or database."""
        from django.core.cache import cache
        settings = cache.get('site_settings')
        if settings is None:
            settings, created = cls.objects.get_or_create(pk=1)
            cache.set('site_settings', settings, 3600)
        return settings

