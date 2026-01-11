"""
API URL routing for LOXTR.

All endpoints versioned under /api/v1/
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'api'

# ViewSets (auto-generate CRUD endpoints)
router = DefaultRouter()
router.register(r'case-studies', views.CaseStudyViewSet, basename='case-study')

urlpatterns = [
    # ============================================
    # GEO-DETECTION & SETTINGS
    # ============================================
    path('geo/detect/', views.detect_geo, name='geo_detect'),
    path('settings/', views.get_site_settings, name='site_settings'),
    
    # ============================================
    # VIEWSETS
    # ============================================
    path('', include(router.urls)),
    
    # ============================================
    # APPLICATIONS
    # ============================================
    path('applications/submit/', views.submit_application, name='submit_application'),
    path('applications/<int:pk>/', views.application_detail, name='application_detail'),
    
    # ============================================
    # CONTACT
    # ============================================
    path('contact/submit/', views.submit_contact, name='submit_contact'),
    
    # ============================================
    # NEWSLETTER
    # ============================================
    path('newsletter/subscribe/', views.subscribe_newsletter, name='subscribe_newsletter'),
    
    # ============================================
    # SEARCH
    # ============================================
    path('search/', views.search, name='search'),
]
