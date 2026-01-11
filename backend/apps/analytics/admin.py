"""
Admin interface for analytics data.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from django.utils.translation import gettext_lazy as _
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

# Register analytics summary (usually we'd register it with a proxy model if we want it separate)
# For now, we'll keep GeoVisitor with the standard admin but keep the summary logic available.
