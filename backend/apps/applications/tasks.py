"""
Celery tasks for applications app.

Handles:
- Sending application confirmation emails
- Sending status update emails
- Admin notifications
"""

from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_application_confirmation(self, application_id):
    """
    Send confirmation email to applicant.
    
    Args:
        application_id: ID of the application
    """
    try:
        from apps.applications.models import Application
        
        application = Application.objects.get(id=application_id)
        
        # Determine language
        language = 'tr' if application.visitor_type == 'LOCAL' else 'en'
        
        # Render email template
        context = {
            'application': application,
            'language': language,
        }
        
        if language == 'tr':
            subject = f"Başvurunuz Alındı - {application.company_name}"
            template = 'emails/application_confirmation_tr.html'
        else:
            subject = f"Application Received - {application.company_name}"
            template = 'emails/application_confirmation_en.html'
        
        html_message = render_to_string(template, context)
        
        # Send email
        send_mail(
            subject=subject,
            message='',  # Plain text fallback
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.email],
            fail_silently=False,
        )
        
        logger.info(f"✅ Confirmation email sent to {application.email}")
        
        # Notify admin
        send_admin_notification.delay(application_id)
        
    except Exception as exc:
        logger.error(f"❌ Failed to send confirmation email: {exc}")
        # Retry after 5 minutes
        raise self.retry(exc=exc, countdown=300)

@shared_task
def send_admin_notification(application_id):
    """
    Notify admin team of new application.
    
    Args:
        application_id: ID of the application
    """
    try:
        from apps.applications.models import Application
        
        application = Application.objects.get(id=application_id)
        
        subject = f"New {application.get_application_type_display()} - {application.company_name}"
        
        context = {'application': application}
        html_message = render_to_string('emails/admin_notification.html', context)
        
        # Send to admin team
        admin_emails = [
            settings.DEFAULT_FROM_EMAIL,
            # Add more admin emails
        ]
        
        send_mail(
            subject=subject,
            message='',
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=True,
        )
        
        logger.info(f"✅ Admin notification sent for application {application_id}")
        
    except Exception as exc:
        logger.error(f"❌ Failed to send admin notification: {exc}")

@shared_task
def send_status_update_email(application_id):
    """
    Send email when application status changes.
    
    Args:
        application_id: ID of the application
    """
    try:
        from apps.applications.models import Application
        
        application = Application.objects.get(id=application_id)
        
        # Only send for certain status changes
        if application.status not in ['accepted', 'rejected', 'meeting_scheduled']:
            return
        
        language = 'tr' if application.visitor_type == 'LOCAL' else 'en'
        
        # Render email based on status and language
        template = f'emails/status_{application.status}_{language}.html'
        context = {'application': application}
        
        html_message = render_to_string(template, context)
        
        if language == 'tr':
            subject = f"Başvuru Durumu Güncellendi - {application.company_name}"
        else:
            subject = f"Application Status Update - {application.company_name}"
        
        send_mail(
            subject=subject,
            message='',
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.email],
            fail_silently=False,
        )
        
        logger.info(f"✅ Status update email sent to {application.email}")
        
    except Exception as exc:
        logger.error(f"❌ Failed to send status update email: {exc}")
