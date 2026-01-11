"""
Contact form submissions and newsletter subscriptions.

Handles general inquiries from visitors and newsletter signups.
"""

from django.db import models
from django.core.validators import EmailValidator
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)

class ContactSubmission(models.Model):
    """
    Contact form submissions.
    """
    
    # Status Choices
    STATUS_NEW = 'new'
    STATUS_PROGRESS = 'in_progress'
    STATUS_REPLIED = 'replied'
    STATUS_CLOSED = 'closed'
    STATUS_SPAM = 'spam'
    
    STATUS_CHOICES = [
        (STATUS_NEW, _('New')),
        (STATUS_PROGRESS, _('In Progress')),
        (STATUS_REPLIED, _('Replied')),
        (STATUS_CLOSED, _('Closed')),
        (STATUS_SPAM, _('Spam')),
    ]
    
    # Contact Information
    full_name = models.CharField(
        max_length=255,
        verbose_name=_("Full Name")
    )
    company_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Company Name")
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
    
    # Inquiry Details
    inquiry_type = models.CharField(
        max_length=100,
        verbose_name=_("Inquiry Type")
    )
    inquiry_context = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Context"),
        help_text=_("Which page was form submitted from")
    )
    subject = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Subject")
    )
    message = models.TextField(
        verbose_name=_("Message")
    )
    
    # Source Tracking
    source_page = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Source Page")
    )
    language = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Language")
    )
    
    # Geo-Tracking
    visitor_type = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("Visitor Type")
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_("IP Address")
    )
    country_detected = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Country Detected")
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
        related_name='assigned_contacts',
        verbose_name=_("Assigned To")
    )
    internal_notes = models.TextField(
        blank=True,
        verbose_name=_("Internal Notes")
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name=_("Submitted At")
    )
    replied_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Replied At")
    )
    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Closed At")
    )
    
    class Meta:
        db_table = 'contact_submissions'
        ordering = ['-created_at']
        verbose_name = _("Contact Submission")
        verbose_name_plural = _("Contact Submissions")
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['email']),
            models.Index(fields=['inquiry_type']),
        ]
    
    def __str__(self):
        return f"{self.full_name} - {self.inquiry_type}"


class NewsletterSubscription(models.Model):
    """
    Newsletter email subscriptions.
    """
    
    email = models.EmailField(
        max_length=255,
        unique=True,
        validators=[EmailValidator()],
        verbose_name=_("Email")
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Active")
    )
    
    subscribed_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name=_("Subscribed At")
    )
    
    unsubscribed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Unsubscribed At")
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_("IP Address")
    )
    
    source_page = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Source Page")
    )
    
    class Meta:
        db_table = 'newsletter_subscriptions'
        ordering = ['-subscribed_at']
        verbose_name = _("Newsletter Subscription")
        verbose_name_plural = _("Newsletter Subscriptions")
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['-subscribed_at']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.email
