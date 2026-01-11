"""
Admin configuration for applications.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Application

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """
    Admin interface for Application (Partner/Distribution) submissions.
    """
    
    list_display = [
        'id',
        'company_name',
        'contact_name',
        'email',
        'application_type_badge',
        'status_badge',
        'created_at',
    ]
    
    list_filter = [
        'application_type',
        'status',
        'created_at',
        'country',
    ]
    
    search_fields = [
        'company_name',
        'contact_person',
        'email',
        'phone',
        'message',
    ]
    
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Application Info'), {
            'fields': (
                'application_type',
                'status',
            )
        }),
        (_('Company Details'), {
            'fields': (
                'company_name',
                'country',
                'website',
            )
        }),
        (_('Contact Information'), {
            'fields': (
                'contact_name',
                'email',
                'phone',
            )
        }),
        (_('Message'), {
            'fields': (
                'message',
            )
        }),
        (_('Metadata'), {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'mark_as_pending',
        'mark_as_contacted',
        'mark_as_qualified',
        'mark_as_rejected',
        'export_as_csv',
    ]
    
    def application_type_badge(self, obj):
        """Display application type with color."""
        colors = {
            'partner': 'blue',
            'distribution': 'green',
            'sourcing': 'orange',
        }
        color = colors.get(obj.application_type, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_application_type_display()
        )
    application_type_badge.short_description = 'Type'
    
    def status_badge(self, obj):
        """Display status with color."""
        colors = {
            'new': '#ffcc00',
            'pending': '#007aff',
            'contacted': '#34c759',
            'qualified': '#00c853',
            'rejected': '#ff3b30',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'
    
    # Actions
    def mark_as_pending(self, request, queryset):
        updated = queryset.update(status='pending')
        self.message_user(request, f'{updated} application(s) marked as pending.')
    mark_as_pending.short_description = 'Mark as Pending'
    
    def mark_as_contacted(self, request, queryset):
        updated = queryset.update(status='contacted')
        self.message_user(request, f'{updated} application(s) marked as contacted.')
    mark_as_contacted.short_description = 'Mark as Contacted'
    
    def mark_as_qualified(self, request, queryset):
        updated = queryset.update(status='qualified')
        self.message_user(request, f'{updated} application(s) marked as qualified.')
    mark_as_qualified.short_description = 'Mark as Qualified'
    
    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} application(s) marked as rejected.')
    mark_as_rejected.short_description = 'Mark as Rejected'
    
    def export_as_csv(self, request, queryset):
        """Export applications as CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="applications.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Company', 'Contact', 'Email', 'Phone', 'Type', 'Status', 'Date'])
        
        for app in queryset:
            writer.writerow([
                app.id,
                app.company_name,
                app.contact_person,
                app.email,
                app.phone,
                app.get_application_type_display(),
                app.get_status_display(),
                app.created_at.strftime('%Y-%m-%d %H:%M'),
            ])
        
        return response
    export_as_csv.short_description = 'Export selected as CSV'
