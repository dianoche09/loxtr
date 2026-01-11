"""
Admin configuration for contact submissions.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .models import ContactSubmission, NewsletterSubscription

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    """
    Admin interface for Contact Form submissions.
    """
    
    list_display = [
        'id',
        'full_name',
        'company_name',
        'email',
        'inquiry_type_badge',
        'status_badge',
        'visitor_type_badge',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'inquiry_type',
        'visitor_type',
        'language',
        'created_at',
    ]
    
    search_fields = [
        'full_name',
        'company_name',
        'email',
        'phone',
        'message',
        'subject',
    ]
    
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'replied_at', 'closed_at', 'ip_address', 'user_agent', 'referrer_url']
    
    fieldsets = (
        (_('Contact Information'), {
            'fields': (
                'full_name',
                'company_name',
                'email',
                'phone',
            )
        }),
        (_('Inquiry Details'), {
            'fields': (
                'inquiry_type',
                'inquiry_context',
                'subject',
                'message',
            )
        }),
        (_('Status Management'), {
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
                'country_detected',
            ),
            'classes': ('collapse',)
        }),
        (_('Technical Details'), {
            'fields': (
                'ip_address',
                'user_agent',
                'referrer_url',
            ),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': (
                'created_at',
                'replied_at',
                'closed_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'mark_as_in_progress',
        'mark_as_replied',
        'mark_as_closed',
        'mark_as_spam',
        'export_as_csv',
    ]
    
    def inquiry_type_badge(self, obj):
        """Display inquiry type with color."""
        return format_html(
            '<span style="background: #007aff; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            obj.inquiry_type
        )
    inquiry_type_badge.short_description = 'Inquiry Type'
    
    def status_badge(self, obj):
        """Display status with color."""
        colors = {
            'new': '#ffcc00',
            'in_progress': '#007aff',
            'replied': '#34c759',
            'closed': '#8e8e93',
            'spam': '#ff3b30',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'
    
    def visitor_type_badge(self, obj):
        """Display visitor type."""
        if obj.visitor_type:
            color = '#34c759' if obj.visitor_type == 'FOREIGN' else '#007aff'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color,
                obj.visitor_type
            )
        return '-'
    visitor_type_badge.short_description = 'Visitor'
    
    # Actions
    def mark_as_in_progress(self, request, queryset):
        updated = queryset.update(status='in_progress')
        self.message_user(request, f'{updated} submission(s) marked as in progress.')
    mark_as_in_progress.short_description = 'Mark as In Progress'
    
    def mark_as_replied(self, request, queryset):
        updated = queryset.update(status='replied', replied_at=timezone.now())
        self.message_user(request, f'{updated} submission(s) marked as replied.')
    mark_as_replied.short_description = 'Mark as Replied'
    
    def mark_as_closed(self, request, queryset):
        updated = queryset.update(status='closed', closed_at=timezone.now())
        self.message_user(request, f'{updated} submission(s) marked as closed.')
    mark_as_closed.short_description = 'Mark as Closed'
    
    def mark_as_spam(self, request, queryset):
        updated = queryset.update(status='spam')
        self.message_user(request, f'{updated} submission(s) marked as spam.')
    mark_as_spam.short_description = 'Mark as Spam'
    
    def export_as_csv(self, request, queryset):
        """Export contacts as CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="contacts.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Name', 'Company', 'Email', 'Phone', 'Inquiry Type', 'Status', 'Message', 'Date'])
        
        for contact in queryset:
            writer.writerow([
                contact.id,
                contact.full_name,
                contact.company_name,
                contact.email,
                contact.phone,
                contact.inquiry_type,
                contact.get_status_display(),
                contact.message[:100],  # First 100 chars
                contact.created_at.strftime('%Y-%m-%d %H:%M'),
            ])
        
        return response
    export_as_csv.short_description = 'Export selected as CSV'


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    """
    Admin interface for Newsletter subscriptions.
    """
    
    list_display = [
        'email',
        'active_badge',
        'subscribed_at',
        'source_page',
    ]
    
    list_filter = [
        'is_active',
        'subscribed_at',
    ]
    
    search_fields = [
        'email',
    ]
    
    ordering = ['-subscribed_at']
    
    readonly_fields = ['subscribed_at', 'unsubscribed_at', 'ip_address']
    
    fieldsets = (
        (_('Subscription'), {
            'fields': (
                'email',
                'is_active',
            )
        }),
        (_('Tracking'), {
            'fields': (
                'source_page',
                'ip_address',
            ),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': (
                'subscribed_at',
                'unsubscribed_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'activate_subscriptions',
        'deactivate_subscriptions',
        'export_as_csv',
    ]
    
    def active_badge(self, obj):
        """Display active status."""
        if obj.is_active:
            return format_html('<span style="color: green;">✅ Active</span>')
        return format_html('<span style="color: red;">❌ Unsubscribed</span>')
    active_badge.short_description = 'Status'
    
    def activate_subscriptions(self, request, queryset):
        updated = queryset.update(is_active=True, unsubscribed_at=None)
        self.message_user(request, f'{updated} subscription(s) activated.')
    activate_subscriptions.short_description = 'Activate selected'
    
    def deactivate_subscriptions(self, request, queryset):
        updated = queryset.update(is_active=False, unsubscribed_at=timezone.now())
        self.message_user(request, f'{updated} subscription(s) deactivated.')
    deactivate_subscriptions.short_description = 'Deactivate selected'
    
    def export_as_csv(self, request, queryset):
        """Export newsletter subscribers as CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="newsletter_subscribers.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Email', 'Active', 'Subscribed At', 'Source'])
        
        for sub in queryset:
            writer.writerow([
                sub.email,
                'Yes' if sub.is_active else 'No',
                sub.subscribed_at.strftime('%Y-%m-%d %H:%M'),
                sub.source_page or '-',
            ])
        
        return response
    export_as_csv.short_description = 'Export selected as CSV'

