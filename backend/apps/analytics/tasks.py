"""
Celery tasks for analytics.

Handles:
- Async visitor logging
- Report generation
- Cache warming
"""

from celery import shared_task
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task
def log_visitor_async(ip_address, country_code, visitor_type, path, user_agent, referrer):
    """
    Log visitor asynchronously (non-blocking).
    """
    try:
        from apps.analytics.models import GeoVisitor
        
        # Track or update visitor
        visitor = GeoVisitor.track_visit(
            ip_address=ip_address,
            country_code=country_code,
            visitor_type=visitor_type,
            user_agent=user_agent
        )
        
        # Update engagement metrics
        visitor.pages_viewed += 1
        
        # Parse user agent for device info
        if 'mobile' in user_agent.lower():
            visitor.device_type = 'mobile'
        elif 'tablet' in user_agent.lower():
            visitor.device_type = 'tablet'
        else:
            visitor.device_type = 'desktop'
        
        visitor.save()
        
        logger.debug(f"✅ Visitor logged: {ip_address}")
        
    except Exception as exc:
        logger.error(f"❌ Failed to log visitor: {exc}")

@shared_task
def generate_weekly_report():
    """
    Generate weekly analytics report.
    """
    try:
        from apps.analytics.models import GeoVisitor
        from apps.applications.models import Application
        from django.core.mail import send_mail
        from datetime import timedelta
        
        # Get last week's data
        week_ago = timezone.now() - timedelta(days=7)
        
        # Calculate metrics
        total_visitors = GeoVisitor.objects.filter(
            last_visit__gte=week_ago
        ).count()
        
        global_visitors = GeoVisitor.objects.filter(
            last_visit__gte=week_ago,
            visitor_type='GLOBAL'
        ).count()
        
        local_visitors = GeoVisitor.objects.filter(
            last_visit__gte=week_ago,
            visitor_type='LOCAL'
        ).count()
        
        new_applications = Application.objects.filter(
            created_at__gte=week_ago
        ).count()
        
        # Send report email
        subject = f"LOXTR Weekly Analytics Report - {timezone.now().strftime('%Y-%m-%d')}"
        message = f"""
        Weekly Analytics Report
        
        Total Visitors: {total_visitors}
        - Global (Non-TR): {global_visitors}
        - Local (TR): {local_visitors}
        
        New Applications: {new_applications}
        
        Conversion Rate: {(new_applications / total_visitors * 100) if total_visitors > 0 else 0:.2f}%
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.DEFAULT_FROM_EMAIL],  # Default to FROM email for report
            fail_silently=True,
        )
        
        logger.info(f"✅ Weekly report generated and sent")
        
    except Exception as exc:
        logger.error(f"❌ Failed to generate weekly report: {exc}")

@shared_task
def warm_cache():
    """
    Pre-warm cache with frequently accessed data.
    """
    try:
        from django.core.cache import cache
        from apps.brands.models import Brand, Product
        
        # Cache featured brands
        featured_brands = list(Brand.active.filter(featured=True)[:10])
        cache.set('featured_brands', featured_brands, timeout=86400)  # 24 hours
        
        # Cache top products
        top_products = list(Product.active.filter(featured=True)[:20])
        cache.set('top_products', top_products, timeout=86400)
        
        logger.info(f"✅ Cache warmed successfully")
        
    except Exception as exc:
        logger.error(f"❌ Failed to warm cache: {exc}")
