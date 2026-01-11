"""
Case Studies and Success Stories models.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify

class CaseStudy(models.Model):
    """
    Success stories and case studies.
    """
    
    # Status
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    
    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_PUBLISHED, _('Published')),
    ]
    
    # Type
    TYPE_MARKET_ENTRY = 'market_entry'
    TYPE_EXPORT = 'export'
    
    TYPE_CHOICES = [
        (TYPE_MARKET_ENTRY, _('Market Entry (Foreign to Turkey)')),
        (TYPE_EXPORT, _('Export (Turkey to Global)')),
    ]
    
    # Basic Info
    title_en = models.CharField(max_length=255, verbose_name=_("Title (English)"))
    title_tr = models.CharField(max_length=255, verbose_name=_("Title (Turkish)"))
    slug = models.SlugField(max_length=255, unique=True, verbose_name=_("URL Slug"))
    
    # Client Info
    client_company = models.CharField(max_length=255, verbose_name=_("Client Company"))
    client_industry = models.CharField(max_length=100, verbose_name=_("Industry"))
    client_country = models.CharField(max_length=100, verbose_name=_("Country"))
    client_logo = models.URLField(max_length=500, blank=True, verbose_name=_("Client Logo URL"))
    
    # Case Details
    case_type = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name=_("Case Type"))
    challenge_en = models.TextField(verbose_name=_("Challenge (English)"))
    challenge_tr = models.TextField(verbose_name=_("Challenge (Turkish)"))
    solution_en = models.TextField(verbose_name=_("Solution (English)"))
    solution_tr = models.TextField(verbose_name=_("Solution (Turkish)"))
    results_en = models.TextField(verbose_name=_("Results (English)"))
    results_tr = models.TextField(verbose_name=_("Results (Turkish)"))
    
    # Metrics
    metric_1_label_en = models.CharField(max_length=100, blank=True, verbose_name=_("Metric 1 Label (EN)"))
    metric_1_label_tr = models.CharField(max_length=100, blank=True, verbose_name=_("Metric 1 Label (TR)"))
    metric_1_value = models.CharField(max_length=50, blank=True, verbose_name=_("Metric 1 Value"))
    
    metric_2_label_en = models.CharField(max_length=100, blank=True, verbose_name=_("Metric 2 Label (EN)"))
    metric_2_label_tr = models.CharField(max_length=100, blank=True, verbose_name=_("Metric 2 Label (TR)"))
    metric_2_value = models.CharField(max_length=50, blank=True, verbose_name=_("Metric 2 Value"))
    
    metric_3_label_en = models.CharField(max_length=100, blank=True, verbose_name=_("Metric 3 Label (EN)"))
    metric_3_label_tr = models.CharField(max_length=100, blank=True, verbose_name=_("Metric 3 Label (TR)"))
    metric_3_value = models.CharField(max_length=50, blank=True, verbose_name=_("Metric 3 Value"))
    
    # Testimonial
    testimonial_en = models.TextField(blank=True, verbose_name=_("Testimonial (English)"))
    testimonial_tr = models.TextField(blank=True, verbose_name=_("Testimonial (Turkish)"))
    testimonial_author = models.CharField(max_length=255, blank=True, verbose_name=_("Testimonial Author"))
    testimonial_position = models.CharField(max_length=255, blank=True, verbose_name=_("Author Position"))
    
    # Media
    featured_image = models.URLField(max_length=500, blank=True, verbose_name=_("Featured Image URL"))
    
    # SEO
    meta_description_en = models.TextField(max_length=160, blank=True, verbose_name=_("Meta Description (EN)"))
    meta_description_tr = models.TextField(max_length=160, blank=True, verbose_name=_("Meta Description (TR)"))
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, verbose_name=_("Status"))
    is_featured = models.BooleanField(default=False, verbose_name=_("Featured"))
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Created By"))
    
    class Meta:
        db_table = 'case_studies'
        ordering = ['-created_at']
        verbose_name = _("Case Study")
        verbose_name_plural = _("Case Studies")
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['case_type']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.title_en
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title_en)
        super().save(*args, **kwargs)
