"""
API Views for LOXTR.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache
from django.db.models import Q
from rest_framework.throttling import AnonRateThrottle

from apps.case_studies.models import CaseStudy
from apps.applications.models import Application
from apps.seo.models import SiteSettings
from .serializers import (
    CaseStudyListSerializer, CaseStudyDetailSerializer,
    ApplicationSerializer, ContactSerializer, SiteSettingsSerializer
)
from utils.cache_utils import cache_api_response
import logging
import resend
from django.conf import settings

logger = logging.getLogger(__name__)

def send_resend_notification(subject, html_content):
    """
    Send notification via Resend.
    """
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is not set. Skipping email notification.")
        return

    resend.api_key = settings.RESEND_API_KEY
    
    try:
        # construct email body
        params = {
            "from": "LOXTR Notifications <onboarding@resend.dev>",
            "to": ["info@loxtr.com"],
            "subject": subject,
            "html": html_content,
        }
        
        email = resend.Emails.send(params)
        logger.info(f"Email sent via Resend: {email}")
    except Exception as e:
        logger.error(f"Failed to send Resend email: {e}")

# ============================================
# PAGINATION
# ============================================

class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination (20 items per page)."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# ============================================
# SITE SETTINGS ENDPOINT
# ============================================

@cache_api_response(timeout=3600)
@api_view(['GET'])
def get_site_settings(request):
    """
    Get global site settings.
    """
    print("DEBUG: Calling get_site_settings")
    settings = SiteSettings.load()
    serializer = SiteSettingsSerializer(settings)
    return Response(serializer.data)

# ============================================
# GEO-DETECTION ENDPOINT
# ============================================

@cache_api_response(timeout=3600)
@api_view(['GET'])
def detect_geo(request):
    """
    Detect visitor's geo-location.
    """
    print("DEBUG: Calling detect_geo")
    response_data = {
        'country_code': getattr(request, 'geo_country', 'UNKNOWN'),
        'visitor_type': getattr(request, 'visitor_type', 'GLOBAL'),
        'default_language': getattr(request, 'default_language', 'en'),
    }
    
    # Include IP only in debug mode
    if request.GET.get('debug') == 'true':
        response_data['ip_address'] = getattr(request, 'geo_ip', None)
    
    return Response(response_data)

# ============================================
# CASE STUDY VIEWSET
# ============================================

class CaseStudyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for case studies (success stories).
    """
    pagination_class = StandardResultsSetPagination
    lookup_field = 'slug'
    
    def get_queryset(self):
        """
        Get published case studies with filtering.
        """
        queryset = CaseStudy.objects.filter(status=CaseStudy.STATUS_PUBLISHED)
        
        # Filter by type (market_entry vs export)
        case_type = self.request.query_params.get('type')
        if case_type:
            queryset = queryset.filter(case_type=case_type)
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
            
        # Filter by industry
        industry = self.request.query_params.get('industry')
        if industry:
            queryset = queryset.filter(client_industry__icontains=industry)
            
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CaseStudyDetailSerializer
        return CaseStudyListSerializer

# ============================================
# APPLICATION ENDPOINTS
# ============================================

@api_view(['POST'])
def submit_application(request):
    """
    Submit a partner/export application.
    """
    serializer = ApplicationSerializer(data=request.data)
    if serializer.is_valid():
        instance = serializer.save(ip_address=request.META.get('REMOTE_ADDR'))
        
        # Send notification
        try:
            html = f"""
            <h2>New Application Received</h2>
            <p><strong>Type:</strong> {instance.get_application_type_display()}</p>
            <p><strong>Company:</strong> {instance.company_name}</p>
            <p><strong>Contact:</strong> {instance.contact_name} ({instance.email})</p>
            <p><strong>Country:</strong> {instance.country}</p>
            <p><strong>Product:</strong> {instance.product_category}</p>
            <br>
            <a href="https://loxtr.com/admin/applications/application/{instance.id}/change/">View in Admin</a>
            """
            send_resend_notification(f"New Application: {instance.company_name}", html)
        except Exception as e:
            logger.error(f"Error in app notification: {e}")

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def application_detail(request, pk):
    """
    Get application status (protected).
    """
    # TODO: Add authentication
    try:
        application = Application.objects.get(pk=pk)
    except Application.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = ApplicationSerializer(application)
    return Response(serializer.data)

# ============================================
# CONTACT ENDPOINTS
# ============================================

@api_view(['POST'])
def submit_contact(request):
    """
    Submit contact form.
    """
    serializer = ContactSerializer(data=request.data)
    if serializer.is_valid():
        instance = serializer.save(ip_address=request.META.get('REMOTE_ADDR'))
        
        # Send Notification
        try:
            html = f"""
            <h2>New Contact Inquiry</h2>
            <p><strong>Name:</strong> {instance.full_name}</p>
            <p><strong>Company:</strong> {instance.company_name}</p>
            <p><strong>Email:</strong> {instance.email}</p>
            <p><strong>Type:</strong> {instance.inquiry_type}</p>
            <p><strong>Message:</strong><br>{instance.message}</p>
            <br>
            <a href="https://loxtr.com/admin/contact/contactsubmission/{instance.id}/change/">View in Admin</a>
            """
            send_resend_notification(f"Contact Inquiry: {instance.full_name}", html)
        except Exception as e:
            logger.error(f"Error in contact notification: {e}")
            
        return Response({'success': True, 'message': 'Message sent successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# NEWSLETTER ENDPOINTS
# ============================================

@api_view(['POST'])
def subscribe_newsletter(request):
    """
    Subscribe to newsletter.
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    from apps.contact.models import NewsletterSubscription
    
    # Check if already subscribed
    if NewsletterSubscription.objects.filter(email=email).exists():
        return Response({'success': True, 'message': 'Already subscribed'}, status=status.HTTP_200_OK)
        
    NewsletterSubscription.objects.create(email=email, is_active=True)
    
    # Send Notification
    try:
        html = f"""
        <h2>New Newsletter Subscriber</h2>
        <p><strong>Email:</strong> {email}</p>
        """
        send_resend_notification(f"New Subscriber: {email}", html)
    except Exception as e:
        logger.error(f"Error in newsletter notification: {e}")

    return Response({'success': True, 'message': 'Subscribed successfully'}, status=status.HTTP_201_CREATED)

# ============================================
# SEARCH ENDPOINT
# ============================================

@api_view(['GET'])
def search(request):
    """
    Global search endpoint.
    """
    query = request.GET.get('q', '')
    if len(query) < 3:
        return Response([])
        
    # Search in Case Studies
    case_studies = CaseStudy.objects.filter(
        Q(title_en__icontains=query) | 
        Q(title_tr__icontains=query) |
        Q(client_company__icontains=query)
    ).filter(status=CaseStudy.STATUS_PUBLISHED)[:5]
    
    results = []
    
    for case in case_studies:
        results.append({
            'type': 'case_study',
            'title': case.title_en,
            'url': f'/case-studies/{case.slug}',
            'image': case.featured_image
        })
        
    return Response(results)
