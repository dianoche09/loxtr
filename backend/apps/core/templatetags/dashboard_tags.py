from django import template
from apps.brands.models import Brand, Product
from apps.applications.models import Application
from apps.contact.models import ContactSubmission
from django.utils import timezone
from datetime import timedelta

register = template.Library()

@register.simple_tag
def get_dashboard_stats():
    return {
        'total_brands': Brand.objects.count(),
        'total_products': Product.objects.count(),
        'pending_applications': Application.objects.filter(status='new').count(),
        'unread_messages': ContactSubmission.objects.filter(status='new').count(),
        'active_brands': Brand.active.count(),
        'active_products': Product.active.count(),
    }

@register.simple_tag
def get_recent_applications(limit=5):
    return Application.objects.order_by('-created_at')[:limit]

@register.simple_tag
def get_recent_contacts(limit=5):
    return ContactSubmission.objects.order_by('-created_at')[:limit]
