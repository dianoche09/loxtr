# LOXTR SYSTEM CONSTITUTION
## The Definitive Reference for LOXTR Platform Development

**Version:** 2.0 UNIFIED EDITION  
**Last Updated:** January 8, 2026  
**Status:** CANONICAL - ALL DEVELOPMENT MUST COMPLY

---

## 📋 TABLE OF CONTENTS

### PART A: BUSINESS & STRATEGY
1. [Core Business Model](#1-core-business-model)
2. [Dual Interface Architecture](#2-dual-interface-architecture)
3. [Critical Business Rules](#3-critical-business-rules)
4. [Industries Served](#4-industries-served)
5. [Financial Content Policy](#5-financial-content-policy)

### PART B: TECHNICAL ARCHITECTURE
6. [Technology Stack](#6-technology-stack)
7. [Geo-Detection System](#7-geo-detection-system)
8. [URL Structure](#8-url-structure)
9. [Database Models](#9-database-models)
10. [Caching Strategy](#10-caching-strategy)

### PART C: IMPLEMENTATION DETAILS
11. [SEO Requirements](#11-seo-requirements)
12. [API Architecture](#12-api-architecture)
13. [Admin Panel Structure](#13-admin-panel-structure)
14. [Content Management](#14-content-management)
15. [Frontend Components](#15-frontend-components)

### PART D: OPERATIONS
16. [Deployment Configuration](#16-deployment-configuration)
17. [Common Mistakes](#17-common-mistakes)
18. [Testing Checklist](#18-testing-checklist)
19. [Glossary](#19-glossary)

---

# PART A: BUSINESS & STRATEGY

## 1. CORE BUSINESS MODEL

### 1.1 What LOXTR Is

**LOXTR is a B2B SERVICE COMPANY, NOT a product marketplace.**

```
✅ WE ARE:
- Distribution management service provider
- Export facilitation service provider
- Compliance handling service provider
- B2B trade intermediary

❌ WE ARE NOT:
- E-commerce platform
- Product marketplace
- Retailer
- Product seller
```

### 1.2 Company Identity

```
Legal Name:    LOXTR Dış Ticaret Ltd. Şti.
Brand Name:    LOXTR
Tagline:       Locate • Obtain • Xport
Founded:       2024
Location:      Istanbul, Turkey
Industry:      International Trade Services
```

### 1.3 Dual Business Model

**CRITICAL: One platform, two completely different services**

```
┌─────────────────────────────────────────────────┐
│         ONE WEBSITE, TWO BUSINESS MODELS        │
├─────────────────────────────────────────────────┤
│                                                 │
│  NON-TR IP → GLOBAL VIEW (/en/)                │
│  ─────────────────────────────                 │
│  Target:    Foreign manufacturers              │
│  Service:   Market Entry to Turkey             │
│  Message:   "Your gateway to Turkish market"   │
│  Value:     We become your distributor in TR   │
│  Goal:      Get partnership applications       │
│                                                 │
│  What we do:                                   │
│  • Act as authorized distributor in Turkey     │
│  • Handle import compliance (TSE, CE)          │
│  • Manage B2B distribution to 2,000+ dealers   │
│  • No need for client local entity             │
│                                                 │
│  TR IP → LOCAL VIEW (/tr/)                     │
│  ─────────────────────────                     │
│  Target:    Turkish manufacturers/exporters    │
│  Service:   Export Management                  │
│  Message:   "Sizin dış ticaret departmanınız"  │
│  Value:     We manage your entire export       │
│  Goal:      Get export applications            │
│                                                 │
│  What we do:                                   │
│  • End-to-end export management                │
│  • Find buyers in target markets               │
│  • Handle logistics & customs                  │
│  • Payment security & collection guarantee     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 2. DUAL INTERFACE ARCHITECTURE

### 2.1 Critical Principle

> **EN and TR versions MUST have different content targeting different audiences.**
> 
> **TR is NOT a translation of EN. It's a different service for a different audience.**

### 2.2 Content Differentiation Rules

**❌ WRONG APPROACH:**
```
EN: "How to enter Turkish market"
TR: "Türk pazarına nasıl girilir" (literal translation)
```

**✅ CORRECT APPROACH:**
```
EN: "How can my company enter the Turkish market?"
TR: "LOXTR ihracatımı nasıl yönetir?" (How does LOXTR manage my exports?)
```

### 2.3 Page-by-Page Content Strategy

| Element | EN Version (Market Entry) | TR Version (Export Management) |
|---------|--------------------------|--------------------------------|
| **Hero Headline** | "Your Gateway to Turkish Market" | "Sizin Dış Ticaret Departmanınız" |
| **Hero Subtitle** | "We help global brands enter Turkey" | "Ürünlerinizi dünyaya ihraç ediyoruz" |
| **Services** | Market Entry, Distribution in Turkey | Export Management, Global Markets |
| **FAQs** | How to enter Turkey, certifications | Export process, payment security |
| **Case Studies** | Foreign brands entering Turkey | Turkish companies exporting globally |
| **CTAs** | "Enter the Turkish Market" | "İhracata Başla" |
| **Industries** | "Industries for market entry" | "Global pazar fırsatları" |
| **About Page** | "About LOXTR's Turkey expertise" | "İhracat tecrübemiz" |

### 2.4 Real Examples

**Homepage Hero:**
```
EN: "Unlock the Turkish Market
     Your gateway to 85 million consumers and beyond"

TR: "Global Pazarlara Açılın
     Ürünlerinizi 200+ ülkeye ihraç ediyoruz"
```

**Solutions Page:**
```
EN: Market Entry Services
    → Regulatory Compliance
    → Distribution Network
    → Local Market Expertise
    
TR: İhracat Yönetimi Hizmetleri
    → Alıcı Bulma
    → Lojistik Organizasyonu
    → Tahsilat Garantisi
```

---

## 3. CRITICAL BUSINESS RULES

### Rule #1: Never Mix Audiences
```
❌ WRONG: Show export services to foreign visitors
❌ WRONG: Show market entry services to Turkish visitors
✅ RIGHT: EN content targets foreign companies only
✅ RIGHT: TR content targets Turkish exporters only
```

### Rule #2: Service Company, Not Marketplace
```
❌ WRONG: "Browse our product catalog"
❌ WRONG: "Add to cart"
❌ WRONG: "Buy now"
✅ RIGHT: "View our success stories"
✅ RIGHT: "Apply for partnership"
✅ RIGHT: "Schedule consultation"
```

**Historical Note:**
- Brand/Product/Category models are **DEPRECATED**
- Will be removed in future version
- Replaced by **Case Studies** (success stories)

### Rule #3: Admin Panel is Truth
```
✅ ALL site variables must be editable from Admin Panel
✅ NO hardcoded contact info in code
✅ NO hardcoded feature flags
✅ NO hardcoded social media URLs

Use: Site Settings (Singleton model)
```

### Rule #4: Content Differentiation
```
Every page must have contextually appropriate content:
- FAQ categories differ between EN/TR
- Case studies differ between EN/TR
- CTAs differ between EN/TR
- Headlines differ between EN/TR
```

### Rule #5: Dual Language ≠ Translation
```
❌ WRONG: Turkish version is Google Translate of English
✅ RIGHT: Turkish version is completely different content
         for a completely different audience
```

---

## 4. INDUSTRIES SERVED

### 4.1 The 12 Sectors (CANONICAL LIST)

**Do not add/remove without approval:**

```
1.  Electronics & Consumer Tech        📱
2.  Industrial Equipment & Automation  ⚙️
3.  Construction & Building Materials  🏗️
4.  Medical & Laboratory Equipment     🏥
5.  Automotive Parts & Accessories     🚗
6.  Textile & Apparel                  👔
7.  Food & Beverage                    🍽️
8.  Cosmetics & Personal Care          💄
9.  Chemicals & Plastics               🧪
10. Home & Furniture                   🛋️
11. Packaging Materials                📦
12. Tools & Professional Equipment     🔧
```

### 4.2 Why These 12?

**Turkey's Export Strengths:**
- Textile (world's 3rd largest exporter)
- Automotive (European production hub)
- Construction materials (regional leader)
- Food (Halal food hub)
- Cosmetics (Middle East export)
- Furniture (IKEA supplier)

**Turkey's Import Needs:**
- Electronics & technology
- Industrial equipment
- Medical devices
- Chemicals & raw materials
- Professional equipment

### 4.3 Content Strategy Per Sector

**EN Version (Market Entry):**
```
"Electronics & Consumer Tech
Turkey's tech-savvy population of 85M creates 
strong demand for innovative electronic products."
```

**TR Version (Export):**
```
"Elektronik & Teknoloji
Türk elektronik üreticileri için global pazar 
fırsatları: AB, Ortadoğu, Afrika"
```

---

## 5. FINANCIAL CONTENT POLICY

### 5.1 ABSOLUTE RULE: NO FINANCIAL DETAILS

**NEVER include in any content, documentation, or public UI:**

```
❌ Commission percentages (15%, 20%, etc.)
❌ Pricing ranges ($50K-100K, etc.)
❌ Payment terms (30 days, 60 days, etc.)
❌ Minimum order quantities
❌ Specific cost breakdowns
❌ Fee structures
❌ Profit sharing ratios
❌ Margin percentages
❌ Pricing examples
❌ Cost estimates
```

### 5.2 Why This Rule Exists

```
1. Business terms are negotiated case-by-case
2. Market conditions change
3. Different products = different economics
4. Competitive sensitivity
5. Legal compliance
6. Flexibility needed
```

### 5.3 What To Say Instead

**❌ WRONG:**
```
"Our commission is 15-20% depending on product category.
Minimum order: $50,000. Payment terms: 30 days."
```

**✅ RIGHT:**
```
"We offer flexible, performance-based partnership terms 
tailored to your product category and market goals. 
Contact us for a detailed proposal."
```

**✅ ACCEPTABLE PHRASES:**
```
- "Flexible partnership terms"
- "Commission-based pricing available"
- "Custom terms based on product category"
- "Contact us for detailed proposal"
- "Performance-based compensation"
- "Terms discussed during consultation"
- "Competitive rates"
- "Industry-standard terms"
```

### 5.4 Exception: Internal Use Only

```
✅ Allowed in admin notes (not visible to users)
✅ Allowed in private quotes (sent via email)
✅ Allowed in internal documents
✅ Allowed in contracts (between parties)

❌ Never on website
❌ Never in public API responses
❌ Never in marketing materials
```

---

# PART B: TECHNICAL ARCHITECTURE

## 6. TECHNOLOGY STACK

### 6.1 Backend Stack (FIXED)

```
Framework:      Django 5.0+ (Python 3.11)
API Layer:      Django REST Framework 3.14+
Database:       PostgreSQL 15+
Cache:          Redis 7+
Queue:          Celery 5.3+
Web Server:     Nginx 1.24+
Email:          SendGrid / AWS SES
File Storage:   AWS S3 / MinIO
Admin UI:       Django Jazzmin (modern dark theme)
```

### 6.2 Frontend Stack (FIXED)

```
Framework:      React 18+ with Vite
Routing:        React Router v6
Styling:        Tailwind CSS (custom config)
Animations:     Framer Motion
Icons:          Lucide React
State:          React hooks + Context API
SEO:            React Helmet
HTTP Client:    Fetch API (native)
```

### 6.3 Infrastructure

```
Containerization: Docker + Docker Compose
Reverse Proxy:    Nginx
SSL:              Let's Encrypt (Certbot)
Monitoring:       Sentry (errors)
Analytics:        Google Analytics 4
CDN:              Cloudflare (optional)
```

### 6.4 Development Tools

```
Package Manager:  npm / yarn
Code Quality:     ESLint, Prettier
Git:              GitHub
CI/CD:            GitHub Actions (future)
Documentation:    Markdown + Constitution
```

---

## 7. GEO-DETECTION SYSTEM

### 7.1 Overview

**MOST CRITICAL COMPONENT - Handle with extreme care!**

The geo-detection system is the heart of LOXTR's dual-interface architecture.

### 7.2 Detection Flow

```
1. Request arrives → Nginx
2. Cloudflare headers checked:
   - CF-IPCountry (country code)
   - CF-Connecting-IP (real IP)
3. GeoLocationMiddleware processes request
4. IP → Country lookup (GeoIP2 database)
5. Decision logic:
   - Country = "TR" → visitor_type = "LOCAL"
   - Country ≠ "TR" → visitor_type = "GLOBAL"
6. Set cookie: loxtr_visitor_type (30 days)
7. Attach to request: request.visitor_type
8. Redirect to /tr/ or /en/ (if on root /)
9. Log visit to GeoVisitor table (async via Celery)
```

### 7.3 Implementation

**File:** `backend/middleware/geo_detection.py`

```python
class GeoLocationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.geoip_reader = geoip2.database.Reader(
            settings.GEOIP_DATABASE_PATH
        )
    
    def __call__(self, request):
        # 1. Check cookie first (user override)
        cookie_visitor_type = request.COOKIES.get('loxtr_visitor_type')
        if cookie_visitor_type in ['GLOBAL', 'LOCAL']:
            request.visitor_type = cookie_visitor_type
            return self.get_response(request)
        
        # 2. Get IP address
        ip = self.get_client_ip(request)
        
        # 3. Check cache
        cache_key = f'geo_ip:{ip}'
        cached = cache.get(cache_key)
        if cached:
            request.visitor_type = cached
            return self.get_response(request)
        
        # 4. GeoIP lookup
        try:
            country_code = self.get_country_code(ip)
            visitor_type = 'LOCAL' if country_code == 'TR' else 'GLOBAL'
        except Exception:
            visitor_type = 'GLOBAL'  # Default fallback
        
        # 5. Cache result (1 hour)
        cache.set(cache_key, visitor_type, timeout=3600)
        
        # 6. Attach to request
        request.visitor_type = visitor_type
        request.country_code = country_code
        
        # 7. Log visit (async)
        log_visitor.delay(ip, country_code, visitor_type)
        
        return self.get_response(request)
    
    def get_client_ip(self, request):
        """Get real IP (Cloudflare-aware)."""
        # Priority order:
        cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
        if cf_ip:
            return cf_ip
        
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        
        return request.META.get('REMOTE_ADDR')
    
    def get_country_code(self, ip):
        """GeoIP2 lookup."""
        response = self.geoip_reader.country(ip)
        return response.country.iso_code
```

### 7.4 Critical Rules

```
1. ✅ ALWAYS use Cloudflare headers if available
2. ✅ ALWAYS allow manual override via cookie
3. ✅ ALWAYS cache geo lookups (1 hour)
4. ✅ ALWAYS have fallback (default to GLOBAL)
5. ❌ NEVER block if geo-detection fails
6. ❌ NEVER serve wrong content to wrong audience
7. ❌ NEVER skip logging (analytics needed)
```

### 7.5 Manual Override (ViewSwitcher)

**Frontend Component:**
```typescript
<ViewSwitcher />

// Allows user to toggle:
// "Switch to Global View" or "Switch to Local View"
// Sets cookie, redirects to /en/ or /tr/
```

**Why needed:**
- VPN users
- Travelers
- Testing
- User preference

### 7.6 Cache Strategy

```
GeoIP lookups → Redis
Key format:     geo_ip:{ip_address}
TTL:            1 hour (3600 seconds)

Example:
geo_ip:203.0.113.42 → "GLOBAL"
geo_ip:176.88.45.12 → "LOCAL"
```

---

## 8. URL STRUCTURE

### 8.1 Complete URL Map (IMMUTABLE)

```
ROOT
├── / → Auto-redirect based on geo-detection
│   ├── TR IP → /tr/
│   └── Non-TR IP → /en/
│
├── /en/ (GLOBAL VIEW - Market Entry)
│   ├── /en/ → Homepage (market entry focus)
│   ├── /en/about/ → About LOXTR
│   ├── /en/industries/ → 12 sectors for market entry
│   ├── /en/industries/{slug}/ → Industry detail
│   ├── /en/solutions/ → Market Entry services
│   ├── /en/distribution/ → Distribution in Turkey
│   ├── /en/partner/ → Partner program
│   ├── /en/faq/ → FAQ for foreign companies
│   ├── /en/contact/ → Contact form
│   ├── /en/terms/ → Terms of Service
│   └── /en/privacy/ → Privacy Policy
│
├── /tr/ (LOCAL VIEW - Export Management)
│   ├── /tr/ → Homepage (export focus)
│   ├── /tr/hakkimizda/ → About LOXTR
│   ├── /tr/sektorler/ → 12 sectors for export
│   ├── /tr/sektorler/{slug}/ → Industry detail
│   ├── /tr/cozumler/ → Export management services
│   ├── /tr/ihracat-cozumleri/ → Export solutions
│   ├── /tr/ortak/ → Export partnership
│   ├── /tr/sss/ → FAQ for Turkish exporters
│   ├── /tr/iletisim/ → Contact form
│   ├── /tr/kosullar/ → Terms of Service
│   └── /tr/gizlilik/ → Privacy Policy
│
├── /admin/ → Django Admin Panel
│
└── /api/v1/ → REST API
    ├── /api/v1/geo/detect/ → Geo detection
    ├── /api/v1/settings/ → Site settings
    ├── /api/v1/case-studies/ → Success stories
    ├── /api/v1/applications/ → Submit application
    ├── /api/v1/contact/ → Contact form
    └── /api/v1/health/ → Health check
```

### 8.2 Routing Rules

```
1. ✅ Root (/) MUST auto-redirect based on geo
2. ✅ NEVER mix /en/ and /tr/ content
3. ✅ ALWAYS maintain parallel structure
4. ✅ ALWAYS have both EN and TR versions
5. ❌ NO language switcher with identical content
6. ❌ NO /en-us/ or /en-gb/ (just /en/)
```

### 8.3 Homepage Router

**File:** `backend/loxtr/views.py`

```python
def homepage_router(request):
    """
    Smart router for homepage.
    Redirects to /en/ or /tr/ based on visitor_type.
    """
    visitor_type = getattr(request, 'visitor_type', 'GLOBAL')
    
    if visitor_type == 'LOCAL':
        return redirect('/tr/', permanent=False)
    else:
        return redirect('/en/', permanent=False)
```

**CRITICAL:** Use `permanent=False` (302) not `permanent=True` (301)
- 302 allows geo-detection to work on each visit
- 301 would cache the redirect permanently

---

## 9. DATABASE MODELS

### 9.1 Active Models (Current)

#### **SiteSettings** (apps.seo)
```sql
Purpose:  Global site configuration (Singleton)
Type:     Only 1 record allowed
Fields:
  - company_name, company_email, company_phone
  - whatsapp_number, office_address_en, office_address_tr
  - linkedin_url, instagram_url, youtube_url
  - enable_newsletter, enable_whatsapp_button
  - google_analytics_id, google_tag_manager_id
```

#### **CaseStudy** (apps.case_studies)
```sql
Purpose:  Success stories & testimonials
Types:    market_entry, export_program
Fields:
  - client_name, client_country, client_industry
  - challenge_en, challenge_tr (what problem they had)
  - solution_en, solution_tr (how we helped)
  - results_en, results_tr (outcomes achieved)
  - metrics JSON (e.g., {"revenue": "$2.5M", "markets": 5})
  - testimonial_en, testimonial_tr
  - is_featured, display_order
  - status (draft, published)
```

#### **Application** (apps.applications)
```sql
Purpose:  Partner/Export program applications
Types:    market_entry, export_program
Fields:
  - application_type VARCHAR
  - status VARCHAR (new, under_review, accepted, rejected)
  - company_name, email, phone, website
  - country, product_category, product_description
  - visitor_type, ip_address (for analytics)
  - internal_notes, reviewed_at
```

#### **ContactSubmission** (apps.contact)
```sql
Purpose:  Contact form submissions
Fields:
  - full_name, email, phone, company_name
  - inquiry_type, subject, message
  - status (new, replied, closed, spam)
  - visitor_type, language, source_page
```

#### **NewsletterSubscription** (apps.contact)
```sql
Purpose:  Email list management
Fields:
  - email UNIQUE
  - is_active BOOLEAN
  - subscribed_at TIMESTAMP
  - language VARCHAR (en, tr)
```

#### **SEOMetadata** (apps.seo)
```sql
Purpose:  Per-page SEO settings
Fields:
  - page_path VARCHAR UNIQUE (/en/about/, /tr/hakkimizda/)
  - title_en, title_tr
  - description_en, description_tr
  - og_image, og_type
  - canonical_url, robots_directive
  - schema_json (JSON-LD structured data)
```

#### **PageView & Event** (apps.analytics)
```sql
Purpose:  Analytics tracking
Fields:
  - page_path, visitor_type, country_code
  - session_id, user_agent
  - timestamp, metadata JSON
```

### 9.2 Deprecated Models (DO NOT USE)

```
❌ Brand      (was used for product catalog)
❌ Product    (was used for product catalog)
❌ Category   (was used for product catalog)

Reason: LOXTR is a service company, not a marketplace.
Replace with: CaseStudy (success stories)

Status: Will be removed in future version
Action: Do NOT reference these models in new code
```

### 9.3 Future Models (Planned)

```
📅 BlogPost (apps.blog)
   - title_en, title_tr
   - slug, content_en, content_tr
   - author, published_at, category

📅 FAQ (apps.faq)
   - question_en, question_tr
   - answer_en, answer_tr
   - category (market_entry, export, logistics)
   - display_order

📅 Industry (apps.industries)
   - name_en, name_tr
   - slug, icon
   - description_en, description_tr
   - market_size_en, market_size_tr
```

---

## 10. CACHING STRATEGY

### 10.1 Multi-Layer Architecture

```
Layer 1: Cloudflare CDN (Edge Cache)
  └─ Static files only (.js, .css, images)
  └─ TTL: 24 hours
  └─ Geographic distribution

Layer 2: Nginx (Reverse Proxy Cache)
  └─ /static/, /media/ directories
  └─ TTL: 7 days
  └─ Fast local disk access

Layer 3: Redis (Application Cache)
  ├─ GeoIP lookups → 1 hour
  ├─ Page cache (geo-aware) → 30 minutes
  ├─ API responses → 15 minutes
  ├─ Database query results → 5 minutes
  └─ Session data → 2 weeks

Layer 4: PostgreSQL (Query Cache)
  └─ Built-in query result cache
  └─ Materialized views (future)
```

### 10.2 CRITICAL: Geo-Aware Cache Keys

**❌ WRONG - Serves same cached content to everyone:**
```python
cache_key = "homepage"
cache.set(cache_key, content, timeout=1800)

# Problem: Turkish visitor gets English homepage!
```

**✅ CORRECT - Different cache per visitor type:**
```python
cache_key = f"homepage:{visitor_type}:{language}"
cache.set(cache_key, content, timeout=1800)

# Results in:
# - "homepage:GLOBAL:en" → English homepage
# - "homepage:LOCAL:tr" → Turkish homepage
```

### 10.3 Cache Utility Functions

**File:** `backend/utils/cache_utils.py`

```python
def make_cache_key(base_key, visitor_type, language='en'):
    """
    Generate geo-aware cache key.
    
    ALWAYS use this for pages that differ by audience.
    """
    return f"{base_key}:{visitor_type}:{language}"

def cache_page_geo_aware(timeout=1800):
    """
    Decorator for caching pages with geo-awareness.
    
    Usage:
    @cache_page_geo_aware(timeout=1800)
    def my_view(request):
        ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            visitor_type = getattr(request, 'visitor_type', 'GLOBAL')
            language = request.LANGUAGE_CODE
            cache_key = make_cache_key(
                view_func.__name__,
                visitor_type,
                language
            )
            
            # Try cache first
            cached = cache.get(cache_key)
            if cached:
                return cached
            
            # Generate response
            response = view_func(request, *args, **kwargs)
            
            # Cache it
            cache.set(cache_key, response, timeout=timeout)
            
            return response
        return wrapper
    return decorator
```

### 10.4 Cache Invalidation

**Automatic invalidation via Django signals:**

```python
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

@receiver(post_save, sender=CaseStudy)
def invalidate_case_study_cache(sender, instance, **kwargs):
    """Clear cache when case study changes."""
    cache.delete_pattern('case_studies:*')
    cache.delete_pattern('homepage:*')  # Homepage shows featured

@receiver(post_save, sender=SiteSettings)
def invalidate_site_settings_cache(sender, instance, **kwargs):
    """Clear all caches when site settings change."""
    cache.delete('site_settings')
    cache.clear()  # Nuclear option
```

### 10.5 Manual Cache Management

```bash
# Via Django management command
python manage.py clear_cache --all
python manage.py clear_cache --pattern "homepage:*"
python manage.py warm_cache  # Pre-populate cache
```

### 10.6 Cache Warming

```python
# File: backend/apps/core/management/commands/warm_cache.py

def warm_cache():
    """Pre-populate cache with frequently accessed data."""
    
    # 1. Site settings
    settings = SiteSettings.load()
    cache.set('site_settings', settings, timeout=86400)
    
    # 2. Featured case studies
    for visitor_type in ['GLOBAL', 'LOCAL']:
        case_studies = CaseStudy.objects.filter(
            is_featured=True,
            status='published'
        )
        cache_key = f'case_studies:featured:{visitor_type}'
        cache.set(cache_key, list(case_studies), timeout=3600)
    
    # 3. Homepage content
    for visitor_type in ['GLOBAL', 'LOCAL']:
        for language in ['en', 'tr']:
            # ... generate and cache homepage
```

---

## 11. SEO REQUIREMENTS

### 11.1 Hreflang Tags (MANDATORY!)

**Every page MUST include hreflang tags:**

```html
<head>
  <!-- Current page canonical -->
  <link rel="canonical" href="https://www.loxtr.com/en/about/" />
  
  <!-- Alternate language versions -->
  <link rel="alternate" hreflang="en" 
        href="https://www.loxtr.com/en/about/" />
  <link rel="alternate" hreflang="tr" 
        href="https://www.loxtr.com/tr/hakkimizda/" />
  
  <!-- Default fallback (usually English) -->
  <link rel="alternate" hreflang="x-default" 
        href="https://www.loxtr.com/en/about/" />
</head>
```

**Why critical:**
- Tells Google that EN and TR are translations (not duplicates)
- Prevents duplicate content penalties
- Essential for international SEO
- Wrong implementation = ranking loss

### 11.2 Meta Tags Template

**File:** `backend/templates/base.html`

```html
<head>
  <!-- Basic Meta -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Title & Description -->
  <title>{{ seo.title }}</title>
  <meta name="description" content="{{ seo.description }}" />
  <meta name="keywords" content="{{ seo.keywords }}" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="{{ seo.canonical_url }}" />
  
  <!-- Hreflang (if available) -->
  {% if seo.alternate_en %}
  <link rel="alternate" hreflang="en" href="{{ seo.alternate_en }}" />
  {% endif %}
  {% if seo.alternate_tr %}
  <link rel="alternate" hreflang="tr" href="{{ seo.alternate_tr }}" />
  {% endif %}
  <link rel="alternate" hreflang="x-default" href="{{ seo.default_url }}" />
  
  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:title" content="{{ seo.og_title|default:seo.title }}" />
  <meta property="og:description" content="{{ seo.og_description|default:seo.description }}" />
  <meta property="og:image" content="{{ seo.og_image }}" />
  <meta property="og:url" content="{{ seo.canonical_url }}" />
  <meta property="og:type" content="{{ seo.og_type|default:'website' }}" />
  <meta property="og:site_name" content="LOXTR" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{{ seo.og_title|default:seo.title }}" />
  <meta name="twitter:description" content="{{ seo.og_description|default:seo.description }}" />
  <meta name="twitter:image" content="{{ seo.og_image }}" />
  
  <!-- Structured Data (JSON-LD) -->
  {% if seo.schema_json %}
  <script type="application/ld+json">
  {{ seo.schema_json|safe }}
  </script>
  {% endif %}
  
  <!-- Robots -->
  <meta name="robots" content="{{ seo.robots|default:'index, follow' }}" />
  
  <!-- Google Analytics -->
  {% if settings.google_analytics_id %}
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id={{ settings.google_analytics_id }}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{{ settings.google_analytics_id }}');
  </script>
  {% endif %}
</head>
```

### 11.3 Robots.txt

**File:** `backend/public/robots.txt`

```
User-agent: *
Allow: /en/
Allow: /tr/
Allow: /static/
Allow: /media/

Disallow: /admin/
Disallow: /api/v1/auth/
Disallow: /api/v1/admin/

Sitemap: https://www.loxtr.com/sitemap.xml
```

### 11.4 Sitemap Generation

**Separate sitemaps per language:**

```xml
<!-- /sitemap.xml (index) -->
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.loxtr.com/sitemap-en.xml</loc>
    <lastmod>2026-01-08</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.loxtr.com/sitemap-tr.xml</loc>
    <lastmod>2026-01-08</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.loxtr.com/sitemap-case-studies.xml</loc>
    <lastmod>2026-01-08</lastmod>
  </sitemap>
</sitemapindex>
```

**File:** `backend/apps/seo/sitemaps.py`

```python
from django.contrib.sitemaps import Sitemap
from django.urls import reverse

class EnglishViewSitemap(Sitemap):
    """English pages (/en/)"""
    changefreq = "weekly"
    priority = 0.8
    
    def items(self):
        return [
            'en_home', 'en_about', 'en_industries',
            'en_solutions', 'en_partner', 'en_faq', 'en_contact'
        ]
    
    def location(self, item):
        return reverse(item)

class TurkishViewSitemap(Sitemap):
    """Turkish pages (/tr/)"""
    changefreq = "weekly"
    priority = 0.8
    
    def items(self):
        return [
            'tr_home', 'tr_hakkimizda', 'tr_sektorler',
            'tr_cozumler', 'tr_ortak', 'tr_sss', 'tr_iletisim'
        ]
    
    def location(self, item):
        return reverse(item)

class CaseStudySitemap(Sitemap):
    """Case studies"""
    changefreq = "monthly"
    priority = 0.6
    
    def items(self):
        return CaseStudy.objects.filter(
            status='published'
        ).order_by('-created_at')
    
    def lastmod(self, obj):
        return obj.updated_at
```

### 11.5 Structured Data (JSON-LD)

**Organization Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LOXTR",
  "url": "https://www.loxtr.com",
  "logo": "https://www.loxtr.com/static/images/logo.png",
  "description": "International trade services for market entry and export management",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Maslak Mahallesi, Büyükdere Caddesi No: 123",
    "addressLocality": "Istanbul",
    "addressCountry": "TR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+90-212-XXX-XX-XX",
    "contactType": "Customer Service",
    "email": "info@loxtr.com"
  },
  "sameAs": [
    "https://www.linkedin.com/company/loxtrcom",
    "https://www.instagram.com/loxtrcom"
  ]
}
```

---

## 12. API ARCHITECTURE

### 12.1 Base URL & Versioning

```
Base URL:  http://localhost:8000/api/v1/
           https://www.loxtr.com/api/v1/

Version:   v1 (current)
Format:    JSON (REST)
Auth:      No auth required (public API for now)
```

### 12.2 Active Endpoints

#### **Public Endpoints (No Auth)**

```http
# Geo-detection
GET /api/v1/geo/detect/
Response: {
  "country_code": "TR",
  "visitor_type": "LOCAL",
  "language": "tr"
}

# Site settings
GET /api/v1/settings/
Response: {
  "company_name": "LOXTR",
  "company_email": "info@loxtr.com",
  "whatsapp_number": "+90 5XX XXX XX XX",
  ...
}

# Contact form
POST /api/v1/contact/submit/
Body: {
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company_name": "Acme Corp",
  "message": "Interested in market entry",
  "inquiry_type": "market_entry"
}
Response: {
  "success": true,
  "message": "Thank you for contacting us"
}

# Newsletter
POST /api/v1/newsletter/subscribe/
Body: {
  "email": "john@example.com"
}
Response: {
  "success": true,
  "message": "Subscribed successfully"
}

# Case studies
GET /api/v1/case-studies/
Query params: ?type=market_entry&featured=true
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "client_name": "TechCorp",
      "client_country": "USA",
      "results_en": "Achieved $2.5M in Year 1 sales",
      ...
    }
  ]
}

GET /api/v1/case-studies/{id}/
Response: {
  "success": true,
  "data": { ... }
}

# Applications
POST /api/v1/applications/
Body: {
  "application_type": "market_entry",
  "company_name": "Acme Corp",
  "email": "contact@acme.com",
  "product_category": "Electronics",
  ...
}
Response: {
  "success": true,
  "message": "Application submitted",
  "reference_id": "APP-2026-001234"
}

# Health check
GET /api/v1/health/
Response: {
  "status": "ok",
  "timestamp": "2026-01-08T12:00:00Z"
}
```

### 12.3 Response Format (STANDARD)

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid email address",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Enter a valid email address"]
  }
}
```

**Pagination:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total": 42,
    "pages": 5
  }
}
```

### 12.4 Rate Limiting (ENFORCED)

**Implemented at:**
1. Nginx level (primary)
2. Django middleware (secondary)

**Limits:**
```
General API:        100 requests/hour per IP (anonymous)
                    1000 requests/hour per user (authenticated)

Applications:       3 requests/hour per IP
Contact Forms:      5 requests/hour per IP
Newsletter:         10 requests/hour per IP

Health Check:       Unlimited (monitoring)
```

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1641648000
```

**Rate Limit Error:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600
}
```

### 12.5 Error Codes

```
VALIDATION_ERROR        - Invalid input data
RATE_LIMIT_EXCEEDED     - Too many requests
NOT_FOUND               - Resource not found
SERVER_ERROR            - Internal server error
GEO_DETECTION_FAILED    - Could not determine location
DUPLICATE_SUBMISSION    - Already submitted
```

---

# PART C: IMPLEMENTATION DETAILS

## 13. ADMIN PANEL STRUCTURE

### 13.1 Access & Authentication

```
URL:        https://www.loxtr.com/admin/
UI Theme:   Django Jazzmin (dark sidebar + yellow accent)
Login:      Django users with staff permission

Security:
- 2FA enabled (recommended)
- Session timeout: 30 minutes
- IP whitelist (optional)
- SSL required
```

### 13.2 Menu Structure (EXACT ORDER)

**Priority 1: Site Configuration**
```
⚙️ SEO
├── Site Settings (Singleton) ⭐ MOST IMPORTANT
└── SEO Metadata (per-page)
```

**Priority 2: Content Management**
```
🏆 Case Studies
├── Success Stories (list/add/edit)
└── Categories: Market Entry, Export
```

**Priority 3: Business Operations**
```
📝 Applications
├── Partner Applications
└── Export Applications

✉️ Contact
├── Contact Submissions
└── Newsletter Subscriptions
```

**Priority 4: Analytics & Users**
```
📊 Analytics
├── Page Views
└── Events

👥 Authentication & Authorization
├── Users
└── Groups
```

### 13.3 Site Settings (Most Important!)

**ALL site variables managed here:**

**Company Information:**
```
- company_name: "LOXTR"
- company_tagline: "Locate • Obtain • Xport"
- company_email: "info@loxtr.com"
- company_phone: "+90 (212) XXX XX XX"
- whatsapp_number: "+90 5XX XXX XX XX"
```

**Office Details:**
```
- office_address_en: "Istanbul, Turkey"
- office_address_tr: "İstanbul, Türkiye"
- working_hours_en: "Monday - Friday: 9:00 AM - 6:00 PM"
- working_hours_tr: "Pazartesi - Cuma: 09:00 - 18:00"
```

**Social Media:**
```
- linkedin_url: "https://linkedin.com/company/loxtrcom"
- instagram_url: "https://instagram.com/loxtrcom"
- youtube_url: "https://youtube.com/@loxtrcom"
```

**Feature Toggles:**
```
- enable_newsletter: True
- enable_whatsapp_button: True
- enable_live_chat: False
- maintenance_mode: False
```

**SEO & Analytics:**
```
- google_analytics_id: "G-XXXXXXXXXX"
- google_tag_manager_id: "GTM-XXXXXXX"
- google_site_verification: "xxxxxxxxxxxx"
```

### 13.4 How to Use Site Settings

**In Django Views:**
```python
from apps.seo.models import SiteSettings

def my_view(request):
    settings = SiteSettings.load()  # Cached, singleton
    
    context = {
        'company_email': settings.company_email,
        'whatsapp_enabled': settings.enable_whatsapp_button,
    }
    return render(request, 'template.html', context)
```

**In Templates:**
```django
{{ site_settings.company_email }}
{{ site_settings.company_phone }}

{% if site_settings.enable_whatsapp_button %}
  <a href="https://wa.me/{{ site_settings.whatsapp_number }}">
    Contact via WhatsApp
  </a>
{% endif %}
```

**In Frontend (via API):**
```typescript
const response = await fetch('/api/v1/settings/');
const settings = await response.json();

console.log(settings.company_email);
```

### 13.5 Admin Actions

**Bulk Actions Available:**
```
Case Studies:
- Mark as featured / Remove featured
- Publish / Unpublish
- Change status (draft, published)
- Export as CSV

Applications:
- Change status (new, under_review, accepted, rejected)
- Send email notification
- Export as CSV

Contact Submissions:
- Mark as replied / Spam
- Export as CSV
```

### 13.6 Admin Permissions

**User Groups:**
```
1. Superuser
   - Full access to everything
   
2. Content Editor
   - Can add/edit Case Studies
   - Can edit SEO Metadata
   - Cannot change Site Settings
   - Cannot access Applications
   
3. Sales Team
   - Can view/edit Applications
   - Can view Contact Submissions
   - Cannot edit Case Studies
   - Cannot change Site Settings
   
4. Analytics Viewer (Read-only)
   - Can view Analytics
   - Cannot edit anything
```

---

## 14. CONTENT MANAGEMENT

### 14.1 CMS Philosophy

```
✅ Content that changes frequently → Admin-editable
✅ Content that rarely changes → Code-based
✅ Business data (case studies) → Admin-editable
❌ System structure (menus, routes) → Code-based
```

### 14.2 Editable via Admin

```
✅ Site Settings (all company info)
✅ Case Studies (success stories)
✅ SEO Metadata (per-page)
✅ Contact form submissions (read)
✅ Applications (review/manage)
✅ Newsletter subscribers (manage)
```

### 14.3 Not Editable (Hardcoded)

```
❌ Navigation menu structure
❌ URL routes
❌ Page templates
❌ Form fields
❌ Email templates (coming in Phase 2)
❌ Footer links
```

**Why not editable?**
- Requires testing after changes
- Security implications
- Breaks if misconfigured
- Rarely changes anyway

### 14.4 Future CMS Features (Phase 2)

```
📅 Blog/News Module
   - Rich text editor
   - Image upload
   - Categories & tags
   - SEO fields

📅 FAQ Module
   - Question/Answer pairs
   - Categories
   - Reorder/sort

📅 Page Builder
   - Drag & drop sections
   - Pre-made blocks
   - Custom layouts
```

---

## 15. FRONTEND COMPONENTS

### 15.1 React Component Structure

```
src/
├── components/
│   ├── common/          # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Button.tsx
│   │   └── SEO.tsx
│   │
│   ├── geo/             # Geo-specific
│   │   ├── GeoContext.tsx
│   │   ├── ViewSwitcher.tsx
│   │   └── WhatsAppButton.tsx
│   │
│   ├── forms/           # Form components
│   │   ├── ContactForm.tsx
│   │   ├── ApplicationForm.tsx
│   │   └── NewsletterForm.tsx
│   │
│   └── sections/        # Page sections
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── CaseStudies.tsx
│       └── CTA.tsx
│
├── pages/
│   ├── en/              # English pages
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Industries.tsx
│   │   └── Contact.tsx
│   │
│   └── tr/              # Turkish pages
│       ├── Ana.tsx
│       ├── Hakkimizda.tsx
│       ├── Sektorler.tsx
│       └── Iletisim.tsx
│
├── hooks/               # Custom hooks
│   ├── useGeo.ts
│   ├── useSettings.ts
│   └── useAnalytics.ts
│
├── services/            # API clients
│   ├── api.ts
│   └── analytics.ts
│
└── utils/               # Utilities
    ├── formatting.ts
    └── validation.ts
```

### 15.2 GeoContext Provider

**MOST IMPORTANT FRONTEND COMPONENT**

**File:** `src/components/geo/GeoContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState } from 'react';

interface GeoData {
  countryCode: string | null;
  visitorType: 'GLOBAL' | 'LOCAL' | null;
  language: 'en' | 'tr';
  loading: boolean;
}

const GeoContext = createContext<GeoData>({
  countryCode: null,
  visitorType: null,
  language: 'en',
  loading: true,
});

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const [geoData, setGeoData] = useState<GeoData>({
    countryCode: null,
    visitorType: null,
    language: 'en',
    loading: true,
  });

  useEffect(() => {
    // Fetch geo data from API
    fetch('/api/v1/geo/detect/')
      .then(res => res.json())
      .then(data => {
        setGeoData({
          countryCode: data.country_code,
          visitorType: data.visitor_type,
          language: data.language,
          loading: false,
        });
      })
      .catch(error => {
        console.error('Geo detection failed:', error);
        setGeoData({
          countryCode: null,
          visitorType: 'GLOBAL', // Default fallback
          language: 'en',
          loading: false,
        });
      });
  }, []);

  return (
    <GeoContext.Provider value={geoData}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  const context = useContext(GeoContext);
  if (!context) {
    throw new Error('useGeo must be used within GeoProvider');
  }
  return context;
}
```

**Usage in Components:**
```typescript
import { useGeo } from '@/components/geo/GeoContext';

function MyComponent() {
  const { visitorType, loading } = useGeo();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {visitorType === 'GLOBAL' ? (
        <h1>Welcome to Turkish Market</h1>
      ) : (
        <h1>İhracata Başlayın</h1>
      )}
    </div>
  );
}
```

### 15.3 ViewSwitcher Component

**File:** `src/components/geo/ViewSwitcher.tsx`

```typescript
import { useGeo } from './GeoContext';

export function ViewSwitcher() {
  const { visitorType } = useGeo();
  
  const switchView = async (newType: 'GLOBAL' | 'LOCAL') => {
    // Set cookie
    document.cookie = `loxtr_visitor_type=${newType}; path=/; max-age=2592000`; // 30 days
    
    // Redirect
    if (newType === 'GLOBAL') {
      window.location.href = '/en/';
    } else {
      window.location.href = '/tr/';
    }
  };
  
  return (
    <div className="view-switcher">
      {visitorType === 'GLOBAL' ? (
        <button onClick={() => switchView('LOCAL')}>
          🇹🇷 Switch to Turkish View
        </button>
      ) : (
        <button onClick={() => switchView('GLOBAL')}>
          🌍 Switch to English View
        </button>
      )}
    </div>
  );
}
```

### 15.4 WhatsApp Button

**File:** `src/components/geo/WhatsAppButton.tsx`

```typescript
import { useGeo } from './GeoContext';
import { useSettings } from '@/hooks/useSettings';

export function WhatsAppButton() {
  const { visitorType } = useGeo();
  const { settings } = useSettings();
  
  // Only show for Turkish visitors
  if (visitorType !== 'LOCAL') return null;
  
  // Only show if enabled
  if (!settings?.enable_whatsapp_button) return null;
  
  // Only show on mobile (optional)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return null;
  
  const message = encodeURIComponent(
    'Merhaba LOXTR, ihracat hizmetleriniz hakkında bilgi almak istiyorum.'
  );
  
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${message}`;
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all animate-pulse"
      aria-label="WhatsApp ile iletişime geç"
    >
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        {/* WhatsApp icon path */}
      </svg>
    </a>
  );
}
```

### 15.5 Critical Frontend Rules

```
1. ✅ NEVER use localStorage or sessionStorage
   - Not supported in React artifacts
   - Use React state (useState, useReducer)

2. ✅ ALWAYS use Tailwind utility classes
   - No custom CSS that needs compilation

3. ✅ ALWAYS check visitorType before showing content
   if (visitorType === 'GLOBAL') { ... }

4. ✅ ALWAYS use centralized API service
   import { api } from '@/services/api';

5. ❌ NEVER hardcode company info
   - Always fetch from Site Settings API
```

---

# PART D: OPERATIONS

## 16. DEPLOYMENT CONFIGURATION

### 16.1 Environment Variables (Required)

**File:** `backend/.env`

```bash
# Django Core
DJANGO_SECRET_KEY=change-me-in-production
DEBUG=False
ALLOWED_HOSTS=www.loxtr.com,loxtr.com

# Database
DB_NAME=loxtr_db
DB_USER=loxtr_user
DB_PASSWORD=secure_password_here
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Geo-Location (CRITICAL!)
ENABLE_GEO_DETECTION=True
USE_CLOUDFLARE_GEO=True
GEOIP_DATABASE_PATH=/app/geoip/GeoLite2-Country.mmdb

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
DEFAULT_FROM_EMAIL=info@loxtr.com
ADMIN_EMAIL=admin@loxtr.com

# AWS S3 (Optional)
USE_S3=True
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_STORAGE_BUCKET_NAME=loxtr-media
AWS_S3_REGION_NAME=eu-central-1

# Security
CSRF_TRUSTED_ORIGINS=https://www.loxtr.com,https://loxtr.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# SEO & Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
SITE_URL=https://www.loxtr.com

# Features
ENABLE_WHATSAPP_BUTTON=True
WHATSAPP_BUSINESS_NUMBER=905XXXXXXXXX
ENABLE_NEWSLETTER=True
```

### 16.2 Docker Compose

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  django:
    build: ./backend
    command: gunicorn --bind 0.0.0.0:8000 --workers 4 loxtr.wsgi:application
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    env_file:
      - ./backend/.env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  celery_worker:
    build: ./backend
    command: celery -A loxtr worker -l info --concurrency=2
    volumes:
      - ./backend:/app
    env_file:
      - ./backend/.env
    depends_on:
      - django
      - redis
    restart: unless-stopped

  celery_beat:
    build: ./backend
    command: celery -A loxtr beat -l info
    volumes:
      - ./backend:/app
    env_file:
      - ./backend/.env
    depends_on:
      - django
      - redis
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - static_volume:/app/staticfiles:ro
      - media_volume:/app/media:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - django
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

### 16.3 Nginx Configuration

**File:** `nginx/nginx.conf`

```nginx
upstream django {
    server django:8000;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=form_limit:10m rate=5r/h;

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name www.loxtr.com loxtr.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name www.loxtr.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/www.loxtr.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.loxtr.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Vary header for CDN (CRITICAL for geo-awareness!)
    add_header Vary "Accept-Language, CF-IPCountry" always;
    
    client_max_body_size 100M;
    
    # Static files
    location /static/ {
        alias /app/staticfiles/;
        expires 7d;
        add_header Cache-Control "public, immutable";
        gzip on;
        gzip_types text/css application/javascript image/svg+xml;
    }
    
    # Media files
    location /media/ {
        alias /app/media/;
        expires 7d;
        add_header Cache-Control "public";
    }
    
    # API with rate limiting
    location /api/v1/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Forward Cloudflare headers (CRITICAL!)
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-IPCountry $http_cf_ipcountry;
        
        proxy_redirect off;
        proxy_buffering off;
    }
    
    # Forms with stricter rate limiting
    location ~ ^/api/v1/(applications|contact)/submit/ {
        limit_req zone=form_limit burst=2 nodelay;
        
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-IPCountry $http_cf_ipcountry;
    }
    
    # Django application
    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-IPCountry $http_cf_ipcountry;
        
        proxy_redirect off;
    }
}
```

### 16.4 Deployment Script

**File:** `deploy.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Starting LOXTR deployment..."

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 2. Build Docker images
echo "🏗️ Building Docker images..."
docker-compose build --no-cache

# 3. Stop old containers
echo "🛑 Stopping old containers..."
docker-compose down

# 4. Start new containers
echo "▶️ Starting new containers..."
docker-compose up -d

# 5. Wait for services to be healthy
echo "⏳ Waiting for services..."
sleep 10

# 6. Run database migrations
echo "📊 Running migrations..."
docker-compose exec -T django python manage.py migrate --noinput

# 7. Collect static files
echo "📦 Collecting static files..."
docker-compose exec -T django python manage.py collectstatic --noinput

# 8. Warm cache
echo "🔥 Warming cache..."
docker-compose exec -T django python manage.py warm_cache

# 9. Health check
echo "🏥 Running health check..."
sleep 5
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health/)

if [ "$HEALTH" = "200" ]; then
    echo "✅ Deployment successful!"
    echo "🌍 Site is live at: https://www.loxtr.com"
else
    echo "❌ Deployment failed! Health check returned: $HEALTH"
    echo "🔍 Check logs: docker-compose logs -f django"
    exit 1
fi

echo "🎉 Deployment complete!"
```

### 16.5 Post-Deployment Verification

**File:** `verify.sh`

```bash
#!/bin/bash

DOMAIN="https://www.loxtr.com"
FAILED=0

echo "🔍 Verifying LOXTR deployment..."

# Test 1: Homepage EN
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/en/)
if [ "$STATUS" = "200" ]; then
    echo "✅ Homepage EN (Status: $STATUS)"
else
    echo "❌ Homepage EN (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

# Test 2: Homepage TR
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/tr/)
if [ "$STATUS" = "200" ]; then
    echo "✅ Homepage TR (Status: $STATUS)"
else
    echo "❌ Homepage TR (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

# Test 3: API Health
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/v1/health/)
if [ "$STATUS" = "200" ]; then
    echo "✅ API Health (Status: $STATUS)"
else
    echo "❌ API Health (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

# Test 4: Admin Panel
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/admin/)
if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
    echo "✅ Admin Panel (Status: $STATUS)"
else
    echo "❌ Admin Panel (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

# Test 5: Sitemap
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/sitemap.xml)
if [ "$STATUS" = "200" ]; then
    echo "✅ Sitemap (Status: $STATUS)"
else
    echo "❌ Sitemap (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

# Test 6: Robots.txt
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/robots.txt)
if [ "$STATUS" = "200" ]; then
    echo "✅ Robots.txt (Status: $STATUS)"
else
    echo "❌ Robots.txt (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

# Test 7: SSL Certificate
echo "🔒 Checking SSL..."
SSL=$(echo | openssl s_client -servername www.loxtr.com -connect www.loxtr.com:443 2>/dev/null | grep "Verify return code: 0")
if [ ! -z "$SSL" ]; then
    echo "✅ SSL Certificate Valid"
else
    echo "⚠️ SSL Certificate Issue"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "❌ $FAILED test(s) failed!"
    exit 1
fi
```

---

## 17. COMMON MISTAKES

### 17.1 Content Mistakes

**❌ MISTAKE #1: Translating Instead of Adapting**
```
Wrong:
EN: "How to enter Turkish market"
TR: "Türk pazarına nasıl girilir" (literal translation)

Right:
EN: "How can my company enter Turkish market?"
TR: "LOXTR ürünlerinizi nasıl ihraç eder?"
```

**❌ MISTAKE #2: Including Financial Details**
```
Wrong:
"Our commission is 15-20% depending on product category."

Right:
"We offer flexible, performance-based terms tailored to your business."
```

**❌ MISTAKE #3: Using Old Brand/Product Models**
```python
# Wrong
brands = Brand.objects.filter(is_active=True)

# Right
case_studies = CaseStudy.objects.filter(status='published')
```

### 17.2 Technical Mistakes

**❌ MISTAKE #4: Non-Geo-Aware Caching**
```python
# Wrong - serves same content to everyone
cache_key = "homepage"

# Right - different cache per visitor type
cache_key = f"homepage:{visitor_type}:{language}"
```

**❌ MISTAKE #5: Missing Hreflang Tags**
```html
<!-- Wrong - no hreflang -->
<head>
  <title>About Us</title>
</head>

<!-- Right - includes hreflang -->
<head>
  <title>About Us</title>
  <link rel="alternate" hreflang="en" href="https://www.loxtr.com/en/about/" />
  <link rel="alternate" hreflang="tr" href="https://www.loxtr.com/tr/hakkimizda/" />
  <link rel="alternate" hreflang="x-default" href="https://www.loxtr.com/en/about/" />
</head>
```

**❌ MISTAKE #6: Hardcoded Company Info**
```python
# Wrong - hardcoded
email = "info@loxtr.com"

# Right - from Site Settings
settings = SiteSettings.load()
email = settings.company_email
```

**❌ MISTAKE #7: Using localStorage in React**
```typescript
// Wrong - not supported in artifacts
localStorage.setItem('data', JSON.stringify(data));

// Right - use React state
const [data, setData] = useState(initialData);
```

**❌ MISTAKE #8: Not Forwarding Cloudflare Headers**
```nginx
# Wrong - loses real IP
proxy_set_header X-Real-IP $remote_addr;

# Right - forwards Cloudflare headers
proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
proxy_set_header CF-IPCountry $http_cf_ipcountry;
```

---

## 18. TESTING CHECKLIST

### 18.1 Pre-Deployment Checklist

**System Configuration:**
```
□ Environment variables set (.env file)
□ DJANGO_SECRET_KEY changed from default
□ DEBUG=False in production
□ ALLOWED_HOSTS configured
□ Database credentials set
□ Redis URL configured
□ GEOIP_DATABASE_PATH correct
```

**Geo-Detection:**
```
□ GeoIP2 database file exists
□ Middleware in settings.MIDDLEWARE
□ ENABLE_GEO_DETECTION=True
□ USE_CLOUDFLARE_GEO=True
□ Test with TR IP (should go to /tr/)
□ Test with US IP (should go to /en/)
□ Manual override (ViewSwitcher) works
```

**Content:**
```
□ No financial details anywhere (commission, prices)
□ EN content targets foreign companies
□ TR content targets Turkish exporters
□ All 12 industries listed consistently
□ Case studies (not brands/products)
□ Site Settings populated in admin
```

**SEO:**
```
□ Hreflang tags on all pages
□ Canonical URLs set
□ Sitemap.xml accessible
□ Robots.txt configured
□ Meta descriptions present
□ Alt text on images
```

**API:**
```
□ /api/v1/health/ returns 200
□ /api/v1/geo/detect/ works
□ /api/v1/settings/ returns data
□ Rate limiting active
□ CORS configured (if needed)
```

**Admin Panel:**
```
□ /admin/ accessible
□ Jazzmin theme loaded
□ Site Settings accessible
□ Can add/edit Case Studies
□ Can view Applications
□ User permissions set
```

**Frontend:**
```
□ Homepage loads (/en/ and /tr/)
□ GeoContext provides visitor_type
□ ViewSwitcher works
□ WhatsApp button (TR mobile only)
□ Forms submit successfully
□ Mobile responsive
□ Cross-browser tested (Chrome, Firefox, Safari)
```

**Security:**
```
□ SSL certificate active (HTTPS)
□ Security headers present
□ Admin IP whitelist (optional)
□ Rate limiting on forms
□ CSRF protection enabled
□ Session timeout configured
```

**Performance:**
```
□ Static files served with caching
□ Redis cache working
□ Page load < 3 seconds
□ Lighthouse score > 80
□ No console errors
```

### 18.2 Post-Deployment Verification

```bash
# Run verification script
./verify.sh

# Manual checks:
1. Visit https://www.loxtr.com (auto-redirect)
2. Visit https://www.loxtr.com/en/ (English)
3. Visit https://www.loxtr.com/tr/ (Turkish)
4. Submit contact form (both EN/TR)
5. Check admin panel
6. Monitor logs for errors
```

### 18.3 Monitoring

**Daily:**
```
□ Check error logs (Sentry)
□ Monitor uptime (health endpoint)
□ Review application submissions
□ Check contact form spam
```

**Weekly:**
```
□ Review analytics (GA4)
□ Check cache hit rates
□ Review failed requests
□ Update case studies
```

**Monthly:**
```
□ Update GeoIP2 database
□ Review and optimize slow queries
□ Security updates (Django, packages)
□ SSL certificate expiry check
```

---

## 19. GLOSSARY

### Key Terms

**GLOBAL View**
- English website (/en/)
- Targets foreign companies
- Promotes market entry to Turkey

**LOCAL View**
- Turkish website (/tr/)
- Targets Turkish exporters
- Promotes export management services

**Geo-Detection**
- IP-based country identification
- Determines visitor_type (GLOBAL or LOCAL)
- Cached in Redis for performance

**Visitor Type**
- Either "GLOBAL" or "LOCAL"
- Set by GeoLocationMiddleware
- Attached to every request

**Dual-Direction Trade**
- Import: Foreign → Turkey (market entry)
- Export: Turkey → Foreign (export management)

**Service Company**
- LOXTR does NOT sell products
- LOXTR provides B2B trade services
- Success stories, not product catalogs

**Case Study**
- Success story / testimonial
- Replaces old Brand/Product models
- Shows real results from partnerships

**Site Settings**
- Singleton model
- ALL site variables editable from admin
- Cached for performance

**Geo-Aware Cache**
- Cache keys include visitor_type
- Different cache for EN vs TR
- Prevents serving wrong content

**Hreflang**
- HTML tags for multi-language SEO
- Tells search engines about translations
- Essential for avoiding duplicate content penalties

**Market Entry**
- Service for foreign brands entering Turkey
- Target audience: Non-Turkish companies
- EN view focus

**Export Management**
- Service for Turkish brands going global
- Target audience: Turkish manufacturers
- TR view focus

**CMS (Content Management System)**
- Admin-editable content
- Not full page builder
- Strategic content only

**Middleware**
- Django layer that processes requests
- GeoLocationMiddleware adds visitor_type
- Runs before views

**Rate Limiting**
- Prevents abuse (spam, DDoS)
- Implemented at Nginx + Django
- Different limits per endpoint type

**Celery**
- Async task queue
- Used for: emails, analytics logging, cache warming
- Background processing

**Jazzmin**
- Modern Django admin theme
- Dark sidebar + yellow accent
- Better UX than default admin

---

## 🎯 FINAL REMINDERS

### The Golden Rules

1. **Business Model Rule**
   > LOXTR is a SERVICE COMPANY, not a marketplace.
   > Success stories, not product catalogs.

2. **Content Differentiation Rule**
   > EN and TR are NOT translations.
   > They're different services for different audiences.

3. **No Financial Details Rule**
   > NEVER include commission rates, pricing, payment terms.
   > Business terms are negotiated individually.

4. **Geo-Aware Rule**
   > ALWAYS use geo-aware cache keys.
   > NEVER serve wrong content to wrong audience.

5. **Admin First Rule**
   > ALL site variables must be in Site Settings.
   > NO hardcoded company info in code.

### Before Every Code Change, Ask:

```
1. Does this respect the dual business model?
2. Is this content appropriate for the target audience?
3. Have I included any financial details? (If yes, remove!)
4. Is this geo-aware? (Should it be?)
5. Should this be in Site Settings instead of code?
6. Have I tested both EN and TR paths?
7. Are hreflang tags present?
8. Is cache invalidation handled?
```

### When in Doubt:

1. ✅ Read this constitution first
2. ✅ Check existing similar features
3. ✅ Test with both visitor types
4. ✅ Ask: "Would this confuse our target audience?"
5. ✅ Document any new patterns

---

## 📞 DOCUMENT MAINTENANCE

**This document should be updated when:**
- Core business model changes
- New major features added
- Technical architecture changes
- Critical bugs discovered and fixed
- New patterns/standards adopted

**Update Responsibility:**
- Lead Developer
- Technical Architect
- Product Manager

**Version History:**
```
v2.0 - January 8, 2026
  - Unified edition combining business + technical
  - Removed Brand/Product references (deprecated)
  - Added detailed geo-detection documentation
  - Expanded SEO requirements
  - Added comprehensive examples

v1.0 - December 2025
  - Initial constitution
  - Basic business model documented
```

---

## ✅ COMPLIANCE STATEMENT

> **This document is LAW.**
> 
> All development decisions must align with these principles.
> When this conflicts with other documentation, THIS document wins.
> Read and understand before making ANY changes to LOXTR.

---

**END OF CONSTITUTION**

**Status:** ACTIVE AND ENFORCED  
**Next Review:** March 2026 or upon major system changes  
**Maintained By:** LOXTR Development Team

---

*"One platform, two businesses, endless possibilities."*
