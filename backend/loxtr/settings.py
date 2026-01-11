"""
Django settings for LOXTR project.

CRITICAL SETTINGS:
- GeoIP configuration for location detection
- Middleware order (GeoLocationMiddleware must be after sessions)
- Cache configuration for geo-aware caching
"""

import os
import environ
from pathlib import Path

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables
env = environ.Env(
    DEBUG=(bool, False),
    USE_CLOUDFLARE_GEO=(bool, False),
    ENABLE_GEO_DETECTION=(bool, True),
)

# Read .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Application definition
INSTALLED_APPS = [
    'jazzmin',  # Modern admin UI - MUST be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    'django_celery_beat',
    'storages',  # For S3
    
    # Local apps
    'apps.global_view',
    'apps.local_view',
    # 'apps.brands',  # REMOVED
    # 'apps.categories',  # REMOVED
    'apps.case_studies',  # Success stories
    'apps.applications',
    'apps.contact',
    'apps.analytics',
    'apps.seo',
    'apps.api',
]



# MIDDLEWARE ORDER IS CRITICAL!
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # i18n
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # CUSTOM MIDDLEWARE - ADD AFTER SESSIONS!
    'middleware.geo_detection.GeoLocationMiddleware',  # ← OUR GEO MIDDLEWARE
]

ROOT_URLCONF = 'loxtr.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                # Custom context processors
                'apps.seo.context_processors.seo_metadata',
            ],
        },
    },
]

WSGI_APPLICATION = 'loxtr.wsgi.application'

# ============================================
# DATABASE CONFIGURATION
# ============================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='loxtr_db'),
        'USER': env('DB_USER', default='loxtr_user'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST', default='postgres'),
        'PORT': env('DB_PORT', default='5432'),
        'CONN_MAX_AGE': 600,  # Connection pooling
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}

# ============================================
# CACHE CONFIGURATION (Redis)
# ============================================

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://redis:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PASSWORD': env('REDIS_PASSWORD', default=None),
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'RETRY_ON_TIMEOUT': True,
            'MAX_CONNECTIONS': 50,
        },
        'KEY_PREFIX': 'loxtr',
        'TIMEOUT': 1800,  # Default 30 minutes
    }
}

# Session backend (use Redis)
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# ============================================
# GEO-LOCATION CONFIGURATION (CRITICAL!)
# ============================================

# Enable/disable geo-detection globally
ENABLE_GEO_DETECTION = env.bool('ENABLE_GEO_DETECTION', default=True)

# GeoIP Database Path (MaxMind GeoLite2-Country)
# Download from: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
GEOIP_DATABASE_PATH = env.str(
    'GEOIP_DATABASE_PATH',
    default=os.path.join(BASE_DIR, 'geoip', 'GeoLite2-Country.mmdb')
)

# Use Cloudflare headers instead of database (recommended for production)
USE_CLOUDFLARE_GEO = env.bool('USE_CLOUDFLARE_GEO', default=False)

# Enable visitor analytics logging
ENABLE_ANALYTICS = env.bool('ENABLE_ANALYTICS', default=True)

# ============================================
# CELERY CONFIGURATION (Async Tasks)
# ============================================

CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://redis:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://redis:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Europe/Istanbul'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes

# ============================================
# INTERNATIONALIZATION
# ============================================

LANGUAGE_CODE = 'en'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ('en', 'English'),
    ('tr', 'Türkçe'),
]

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

# ============================================
# STATIC FILES
# ============================================

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# WhiteNoise configuration (for serving static files)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ============================================
# MEDIA FILES (AWS S3 or Local)
# ============================================

USE_S3 = env.bool('USE_S3', default=False)

if USE_S3:
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='eu-central-1')
    AWS_S3_CUSTOM_DOMAIN = env('AWS_S3_CUSTOM_DOMAIN', default=None)
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',  # 1 day
    }
    AWS_DEFAULT_ACL = 'public-read'
    AWS_LOCATION = 'media'
    
    # Use S3 for media files
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN or AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{AWS_LOCATION}/'
else:
    # Local file storage (development)
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ============================================
# EMAIL CONFIGURATION
# ============================================

EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='info@loxtr.com')

# SendGrid (recommended)
if 'sendgrid' in EMAIL_BACKEND.lower():
    SENDGRID_API_KEY = env('SENDGRID_API_KEY')
    EMAIL_HOST = 'smtp.sendgrid.net'
    EMAIL_HOST_USER = 'apikey'
    EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True

# AWS SES (alternative)
elif 'ses' in EMAIL_BACKEND.lower():
    EMAIL_HOST = f'email-smtp.{AWS_S3_REGION_NAME}.amazonaws.com'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = env('AWS_SES_ACCESS_KEY_ID')
    EMAIL_HOST_PASSWORD = env('AWS_SES_SECRET_ACCESS_KEY')

# ============================================
# SECURITY SETTINGS (Production)
# ============================================

if not DEBUG:
    # HTTPS
    SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # HSTS
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Other security headers
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
    
    # Referrer policy
    SECURE_REFERRER_POLICY = 'same-origin'

# ============================================
# CORS CONFIGURATION
# ============================================

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://www.loxtr.com',
    'https://loxtr.com',
])

CORS_ALLOW_CREDENTIALS = True

# ============================================
# REST FRAMEWORK
# ============================================

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
}

# ============================================
# LOGGING CONFIGURATION
# ============================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'geo_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'geo.log'),
            'maxBytes': 1024 * 1024 * 5,  # 5 MB
            'backupCount': 3,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'middleware.geo_detection': {
            'handlers': ['console', 'geo_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

# ============================================
# SEO & ANALYTICS
# ============================================

GOOGLE_ANALYTICS_ID = env('GOOGLE_ANALYTICS_ID', default='')
GOOGLE_TAG_MANAGER_ID = env('GOOGLE_TAG_MANAGER_ID', default='')
GOOGLE_SITE_VERIFICATION = env('GOOGLE_SITE_VERIFICATION', default='')
BING_SITE_VERIFICATION = env('BING_SITE_VERIFICATION', default='')

# ============================================
# FEATURE FLAGS
# ============================================

ENABLE_EXPORT_PROGRAM = env.bool('ENABLE_EXPORT_PROGRAM', default=True)
ENABLE_WHATSAPP_BUTTON = env.bool('ENABLE_WHATSAPP_BUTTON', default=True)
ENABLE_DEALER_PORTAL = env.bool('ENABLE_DEALER_PORTAL', default=False)  # Phase 2
ENABLE_MULTI_CURRENCY = env.bool('ENABLE_MULTI_CURRENCY', default=False)  # Phase 2

# WhatsApp Configuration
WHATSAPP_BUSINESS_NUMBER = env('WHATSAPP_BUSINESS_NUMBER', default='905XXXXXXXXX')
WHATSAPP_BUSINESS_NAME = env('WHATSAPP_BUSINESS_NAME', default='LOXTR')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Site URL for SEO and Sitemaps
SITE_URL = env('SITE_URL', default='https://www.loxtr.com')

# ============================================
# JAZZMIN ADMIN UI CONFIGURATION
# ============================================

JAZZMIN_SETTINGS = {
    # Title on the login screen & admin header
    "site_title": "LOXTR Admin",
    "site_header": "LOXTR",
    "site_brand": "LOXTR Admin Panel",
    
    # Logo
    "site_logo": None,  # Path to logo image in static files
    "login_logo": None,
    "site_logo_classes": "img-circle",
    
    # Welcome text
    "welcome_sign": "Welcome to LOXTR Admin Panel",
    
    # Copyright
    "copyright": "LOXTR - Global Trade & Distribution",
    
    # Search model (appears in top nav)
    "search_model": ["case_studies.CaseStudy", "contact.ContactSubmission"],
    
    # User menu
    "user_avatar": None,
    
    ############
    # Top Menu #
    ############
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "View Site", "url": "/", "new_window": True},
        {"model": "auth.User"},
    ],
    
    #############
    # Side Menu #
    #############
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    
    # Custom menu ordering
    "order_with_respect_to": [
        "seo",  # Site Settings at the top
        "case_studies",  # Success stories
        "applications",
        "contact",
        "analytics",
        "auth",
    ],
    
    # Custom icons for models (Font Awesome 5)
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        
        "case_studies.CaseStudy": "fas fa-trophy",
        
        "applications.Application": "fas fa-file-alt",
        
        "contact.ContactSubmission": "fas fa-envelope",
        "contact.NewsletterSubscription": "fas fa-newspaper",
        
        "analytics.PageView": "fas fa-chart-line",
        "analytics.Event": "fas fa-mouse-pointer",
        
        "seo": "fas fa-cog",
        "seo.SEOMetadata": "fas fa-search",
        "seo.SiteSettings": "fas fa-cogs",
    },
    
    # Icons for default apps
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    
    #################
    # Related Modal #
    #################
    "related_modal_active": False,
    
    #############
    # UI Tweaks #
    #############
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    
    ###############
    # Change view #
    ###############
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs"
    },
}

# Jazzmin UI Tweaks
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "#0a1128",  # Navy
    "accent": "accent-warning",  # Yellow accent
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-warning",  # Dark sidebar with yellow accent
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",  # Options: default, cerulean, cosmo, cyborg, darkly, flatly, journal, litera, lumen, lux, materia, minty, pulse, sandstone, simplex, sketchy, slate, solar, spacelab, superhero, united, yeti
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    },
    "actions_sticky_top": True
}

