"""
DRF Serializers for LOXTR API.
"""

from rest_framework import serializers
from apps.case_studies.models import CaseStudy
from apps.applications.models import Application
from apps.contact.models import ContactSubmission
from apps.seo.models import SiteSettings
from django.core.validators import EmailValidator

# ============================================
# SITE SETTINGS SERIALIZER
# ============================================

class SiteSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for global site configurations.
    """
    class Meta:
        model = SiteSettings
        exclude = ['id', 'updated_at', 'updated_by']

# ============================================
# CASE STUDY SERIALIZERS
# ============================================

class CaseStudyListSerializer(serializers.ModelSerializer):
    """
    Serializer for case study list (minimal fields).
    """
    class Meta:
        model = CaseStudy
        fields = [
            'id',
            'title_en',
            'title_tr',
            'slug',
            'client_company',
            'client_industry',
            'client_country',
            'client_logo',
            'case_type',
            'featured_image',
            'is_featured',
            'created_at',
        ]

class CaseStudyDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for case study detail (full fields).
    """
    class Meta:
        model = CaseStudy
        fields = '__all__'

# ============================================
# APPLICATION SERIALIZERS
# ============================================

class ApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for partner applications.
    """
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'updated_at', 'ip_address']
    
    def validate_email(self, value):
        """Validate email format."""
        email_validator = EmailValidator()
        email_validator(value)
        return value

# ============================================
# CONTACT SERIALIZERS
# ============================================

class ContactSerializer(serializers.ModelSerializer):
    """
    Serializer for contact submissions.
    """
    
    class Meta:
        model = ContactSubmission
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'ip_address', 'is_processed']
    
    def validate_email(self, value):
        """Validate email format."""
        email_validator = EmailValidator()
        email_validator(value)
        return value
