"""
Admin configuration for Case Studies.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import CaseStudy

@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    """Admin interface for Case Studies."""
    
    list_display = ['title_en', 'client_company', 'client_industry', 'case_type_badge', 'status_badge', 'is_featured', 'created_at']
    list_filter = ['status', 'case_type', 'is_featured', 'client_industry']
    search_fields = ['title_en', 'title_tr', 'client_company', 'client_industry']
    prepopulated_fields = {'slug': ('title_en',)}
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('title_en', 'title_tr', 'slug', 'case_type', 'status', 'is_featured')
        }),
        (_('Client Information'), {
            'fields': ('client_company', 'client_industry', 'client_country', 'client_logo')
        }),
        (_('Case Details - English'), {
            'fields': ('challenge_en', 'solution_en', 'results_en')
        }),
        (_('Case Details - Turkish'), {
            'fields': ('challenge_tr', 'solution_tr', 'results_tr'),
            'classes': ('collapse',)
        }),
        (_('Metrics'), {
            'fields': (
                ('metric_1_label_en', 'metric_1_label_tr', 'metric_1_value'),
                ('metric_2_label_en', 'metric_2_label_tr', 'metric_2_value'),
                ('metric_3_label_en', 'metric_3_label_tr', 'metric_3_value'),
            ),
            'classes': ('collapse',)
        }),
        (_('Testimonial'), {
            'fields': ('testimonial_en', 'testimonial_tr', 'testimonial_author', 'testimonial_position'),
            'classes': ('collapse',)
        }),
        (_('Media & SEO'), {
            'fields': ('featured_image', 'meta_description_en', 'meta_description_tr'),
            'classes': ('collapse',)
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['publish', 'unpublish', 'make_featured']
    
    def case_type_badge(self, obj):
        colors = {'market_entry': '#007aff', 'export': '#34c759'}
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            colors.get(obj.case_type, 'gray'),
            obj.get_case_type_display()
        )
    case_type_badge.short_description = 'Type'
    
    def status_badge(self, obj):
        colors = {'draft': '#ff9500', 'published': '#34c759'}
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold; font-size: 11px;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'
    
    def publish(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(request, f'{updated} case study(ies) published.')
    publish.short_description = 'Publish selected'
    
    def unpublish(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} case study(ies) unpublished.')
    unpublish.short_description = 'Unpublish selected'
    
    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} case study(ies) marked as featured.')
    make_featured.short_description = 'Mark as featured'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
