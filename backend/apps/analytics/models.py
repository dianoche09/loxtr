"""
Visitor analytics with geo-location tracking.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)

class GeoVisitor(models.Model):
    """
    Visitor analytics with geo-location tracking.
    """
    
    # Visitor Identification
    ip_address = models.GenericIPAddressField(
        db_index=True,
        verbose_name=_("IP Address")
    )
    country_code = models.CharField(
        max_length=10,
        db_index=True,
        verbose_name=_("Country Code")
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("City")
    )
    visitor_type = models.CharField(
        max_length=20,
        db_index=True,
        verbose_name=_("Visitor Type"),
        help_text=_("GLOBAL or LOCAL")
    )
    
    # Session Tracking
    first_visit = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("First Visit")
    )
    last_visit = models.DateTimeField(
        auto_now=True,
        db_index=True,
        verbose_name=_("Last Visit")
    )
    visit_count = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Visit Count")
    )
    
    # Device Information
    user_agent = models.TextField(
        blank=True,
        verbose_name=_("User Agent")
    )
    device_type = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Device Type"),
        help_text=_("desktop, mobile, tablet")
    )
    browser = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Browser")
    )
    browser_version = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Browser Version")
    )
    os = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Operating System")
    )
    os_version = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("OS Version")
    )
    
    # Engagement Metrics
    pages_viewed = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Pages Viewed")
    )
    time_on_site = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Time on Site"),
        help_text=_("Total time in seconds")
    )
    bounce = models.BooleanField(
        default=False,
        verbose_name=_("Bounce"),
        help_text=_("Left after viewing only one page")
    )
    
    # Conversion Tracking
    submitted_form = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name=_("Submitted Form")
    )
    form_type = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Form Type")
    )
    conversion_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Conversion Date")
    )
    
    # Referrer Information
    referrer_domain = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Referrer Domain")
    )
    utm_source = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("UTM Source")
    )
    utm_medium = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("UTM Medium")
    )
    utm_campaign = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("UTM Campaign")
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    
    class Meta:
        db_table = 'geo_visitors'
        ordering = ['-last_visit']
        verbose_name = _("Geo Visitor")
        verbose_name_plural = _("Geo Visitors")
        indexes = [
            models.Index(fields=['ip_address']),
            models.Index(fields=['country_code']),
            models.Index(fields=['visitor_type']),
            models.Index(fields=['-last_visit']),
        ]
    
    def __str__(self):
        return f"{self.ip_address} - {self.country_code}"
    
    @classmethod
    def track_visit(cls, ip_address, country_code, visitor_type, user_agent=''):
        """
        Track or update visitor record.
        """
        # We need to import it here to avoid circular imports if any
        from django.utils import timezone
        
        visitor, created = cls.objects.get_or_create(
            ip_address=ip_address,
            defaults={
                'country_code': country_code,
                'visitor_type': visitor_type,
                'user_agent': user_agent,
            }
        )
        
        if not created:
            # Update existing visitor
            visitor.visit_count += 1
            visitor.last_visit = timezone.now()
            visitor.save(update_fields=['visit_count', 'last_visit'])
        
        return visitor
