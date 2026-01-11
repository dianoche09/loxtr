"""
Application models for partnership inquiries.

Handles both:
- Market Entry applications (foreign manufacturers)
- Export Program applications (Turkish manufacturers)
"""

from django.db import models
from django.core.validators import EmailValidator
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)

class Application(models.Model):
    """
    Unified application model for both market entry and export programs.
    """
    
    # Application Type Choices
    TYPE_MARKET_ENTRY = 'market_entry'
    TYPE_EXPORT = 'export_program'
    
    TYPE_CHOICES = [
        (TYPE_MARKET_ENTRY, _('Market Entry')),
        (TYPE_EXPORT, _('Export Program')),
    ]
    
    # Status Choices
    STATUS_NEW = 'new'
    STATUS_REVIEW = 'under_review'
    STATUS_MEETING = 'meeting_scheduled'
    STATUS_ACCEPTED = 'accepted'
    STATUS_REJECTED = 'rejected'
    STATUS_HOLD = 'on_hold'
    
    STATUS_CHOICES = [
        (STATUS_NEW, _('New')),
        (STATUS_REVIEW, _('Under Review')),
        (STATUS_MEETING, _('Meeting Scheduled')),
        (STATUS_ACCEPTED, _('Accepted')),
        (STATUS_REJECTED, _('Rejected')),
        (STATUS_HOLD, _('On Hold')),
    ]
    
    # Application Type
    application_type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        db_index=True,
        verbose_name=_("Application Type")
    )
    
    # Company Information
    company_name = models.CharField(
        max_length=255,
        verbose_name=_("Company Name")
    )
    country = models.CharField(
        max_length=100,
        verbose_name=_("Country")
    )
    contact_name = models.CharField(
        max_length=255,
        verbose_name=_("Contact Person")
    )
    email = models.EmailField(
        max_length=255,
        validators=[EmailValidator()],
        verbose_name=_("Email")
    )
    phone = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Phone")
    )
    website_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Website")
    )
    
    # Product Information
    product_category = models.CharField(
        max_length=100,
        verbose_name=_("Product Category")
    )
    product_description = models.TextField(
        verbose_name=_("Product Description")
    )
    
    # Additional Details
    current_markets = models.TextField(
        blank=True,
        verbose_name=_("Current Markets"),
        help_text=_("Markets where you currently sell")
    )
    annual_production_capacity = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Annual Production Capacity")
    )
    target_markets = models.TextField(
        blank=True,
        verbose_name=_("Target Markets"),
        help_text=_("Markets you want to enter")
    )
    certifications = models.TextField(
        blank=True,
        verbose_name=_("Certifications"),
        help_text=_("ISO, CE, TSE, etc.")
    )
    export_experience_years = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Export Experience (Years)")
    )
    
    # File Attachments
    company_profile_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Company Profile URL")
    )
    product_catalog_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Product Catalog URL")
    )
    certificates_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Certificates URL")
    )
    
    # Status Management
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
        db_index=True,
        verbose_name=_("Status")
    )
    assigned_to = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_applications',
        verbose_name=_("Assigned To")
    )
    internal_notes = models.TextField(
        blank=True,
        verbose_name=_("Internal Notes"),
        help_text=_("Not visible to applicant")
    )
    rejection_reason = models.TextField(
        blank=True,
        verbose_name=_("Rejection Reason")
    )
    
    # Geo-Tracking (for analytics)
    visitor_type = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("Visitor Type"),
        help_text=_("GLOBAL or LOCAL")
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_("IP Address")
    )
    country_detected = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Country Detected"),
        help_text=_("From GeoIP")
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name=_("User Agent")
    )
    referrer_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Referrer")
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name=_("Submitted At")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Last Updated")
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Reviewed At")
    )
    
    class Meta:
        db_table = 'applications'
        ordering = ['-created_at']
        verbose_name = _("Application")
        verbose_name_plural = _("Applications")
        indexes = [
            models.Index(fields=['application_type', 'status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['email']),
            models.Index(fields=['country']),
        ]
    
    def __str__(self):
        return f"{self.company_name} - {self.get_application_type_display()}"
    
    def save(self, *args, **kwargs):
        """Send notification email on status change."""
        # Check if status changed
        if self.pk:
            old_instance = Application.objects.get(pk=self.pk)
            if old_instance.status != self.status:
                self._status_changed = True
        
        super().save(*args, **kwargs)
        
        # Send email notification if status changed
        if hasattr(self, '_status_changed'):
            from apps.applications.tasks import send_status_update_email
            send_status_update_email.delay(self.id)
    
    @property
    def is_new(self):
        """Check if application is new."""
        return self.status == self.STATUS_NEW
    
    @property
    def is_closed(self):
        """Check if application is closed (accepted or rejected)."""
        return self.status in [self.STATUS_ACCEPTED, self.STATUS_REJECTED]
    
    def mark_as_reviewed(self, user=None):
        """Mark application as reviewed."""
        from django.utils import timezone
        self.status = self.STATUS_REVIEW
        self.reviewed_at = timezone.now()
        if user:
            self.assigned_to = user
        self.save()
    
    def accept(self, notes=''):
        """Accept application."""
        self.status = self.STATUS_ACCEPTED
        if notes:
            self.internal_notes += f"\n\nAccepted: {notes}"
        self.save()
    
    def reject(self, reason=''):
        """Reject application."""
        self.status = self.STATUS_REJECTED
        self.rejection_reason = reason
        self.save()
