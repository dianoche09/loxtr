# LOXTR Project - Master Plan & Task Tracker

**Last Updated:** 2026-01-08 (Updated with Comprehensive Improvements)
**Status:** ACTIVE  
**Reference:** `LOXTR-SYSTEM-CONSTITUTION-UNIFIED.md` (The Law)

---

## 🎯 CURRENT FOCUS: Phase 5 - Enhancement & Growth

Core system is complete (Phases 1-4 ✅). Now focusing on conversion optimization, content creation, and user engagement features to drive business growth.

---

## 📊 PROGRESS OVERVIEW

```
Foundation:        ████████████████████ 100% (Phase 1-4 Complete)
Pre-Deployment:    ████░░░░░░░░░░░░░░░░  20% (Phase 5 In Progress)
Enhancements:      ░░░░░░░░░░░░░░░░░░░░   0% (Phase 6 Planned)
Content:           ██░░░░░░░░░░░░░░░░░░  10% (Ongoing)
```

---

## 🗓️ TASK LIST

### Phase 1: Core Foundation (✅ DONE)
- [x] **Backend**: Django + DRF + Postgres + Redis + Celery setup
- [x] **Frontend**: React + Vite + TypeScript + Tailwind
- [x] **Infrastructure**: Docker Compose, GeoIP, SendGrid
- [x] **Routing**: Dual-interface (EN/TR) logic
- [x] **Admin**: Jazzmin UI setup

### Phase 2: Essential Features (✅ DONE)
- [x] **Site Settings**: Singleton model for global config
- [x] **Case Studies**: Success stories model (Replacing Brands/Products)
- [x] **Applications**: Partner & Export program forms
- [x] **Contact**: Contact form & Newsletter subscription
- [x] **SEO**: SEOMetadata model per page
- [x] **Analytics**: GeoVisitor tracking

### Phase 3: Content Pages (✅ DONE)
- [x] Home (EN/TR with dual messaging)
- [x] Solutions (Market Entry vs Export)
- [x] Industries (12 sectors with detail pages)
- [x] Case Studies (List + Detail pages)
- [x] About Us
- [x] FAQ (Dual content: Entry vs Export)
- [x] Contact Page
- [x] Legal (Terms, Privacy)

### Phase 4: Integration & Cleanup (✅ DONE)
- [x] **Frontend Settings**: Fetch `SiteSettings` from API
- [x] **Case Studies UI**: Listing & detail pages
- [x] **Cleanup**: Remove deprecated Brands/Products/Categories
- [x] **Admin**: Verify all Site Settings editable
- [x] **UX**: Refine menu & CTAs

---

## 🚀 Phase 5: Pre-Deployment & Quick Wins (IN PROGRESS)

### 5.1 Security & Infrastructure (Priority: CRITICAL)
- [ ] **#P5-001**: Set `DEBUG=False` in production
- [ ] **#P5-002**: Configure `ALLOWED_HOSTS` with actual domain
- [ ] **#P5-003**: Setup SSL Certificate (Let's Encrypt via Certbot)
- [ ] **#P5-004**: Enable rate limiting on forms (Nginx + Django middleware)
- [ ] **#P5-005**: Set Redis password
- [ ] **#P5-006**: Configure PostgreSQL production backup (daily to S3)

### 5.2 Static & Media Files
- [ ] **#P5-007**: Setup AWS S3 for media files
- [ ] **#P5-008**: Run `collectstatic` and verify static files
- [ ] **#P5-009**: Configure CDN (Cloudflare) for static assets

### 5.3 SEO & Analytics (Priority: HIGH)
- [ ] **#P5-010**: Add Google Analytics 4 ID to Site Settings
- [ ] **#P5-011**: Generate sitemap.xml (EN + TR + Case Studies)
- [ ] **#P5-012**: Create robots.txt file
- [ ] **#P5-013**: Add hreflang tags to all pages (verify)
- [ ] **#P5-014**: Add structured data (Organization, Service, FAQ schemas)

### 5.4 Compliance (Priority: HIGH)
- [ ] **#P5-015**: Add Cookie Consent Banner (GDPR/KVKK compliant)
  - **Effort**: M (4-6h)
  - **Tool**: Use cookie-consent library
  - **Languages**: EN/TR
  - **Options**: Accept All, Customize, Reject

### 5.5 Quick Win Features (Priority: CRITICAL)
These are high-impact, low-effort improvements from gap analysis:

- [ ] **#P5-016**: Add WhatsApp Floating Button (TR mobile only)
  - **Effort**: S (2-3h)
  - **Component**: `frontend/src/components/geo/WhatsAppButton.tsx`
  - **Logic**: Show if `visitorType === 'LOCAL'` && mobile device
  - **Design**: Green circle, bottom-right, pulse animation
  - **Link**: `https://wa.me/{settings.whatsapp_number}?text=...`

- [ ] **#P5-017**: Implement Exit Intent Popup
  - **Effort**: M (4-6h)
  - **Component**: `frontend/src/components/ExitPopup.tsx`
  - **Trigger**: Mouse leaves viewport (desktop) or back button (mobile)
  - **Offer**: Free guide download
  - **Cookie**: Don't show again for 7 days
  - **Form**: Email capture → Newsletter API

- [ ] **#P5-018**: Add Trust Signals to Homepage
  - **Effort**: S (2-3h)
  - **Location**: Below hero section
  - **Content**:
    - "Trusted by 15+ Brands" heading
    - Client logo carousel (6-10 logos)
    - Trust badges: ISO, Chamber of Commerce
  - **Design**: White background, grayscale logos

- [ ] **#P5-019**: Animate Stats Counter
  - **Effort**: XS (1-2h)
  - **Current**: Static numbers (85M, 25, $50M+, 2000+)
  - **Goal**: Count-up animation on scroll into view
  - **Library**: Framer Motion or react-countup
  - **Example**: "85M" counts from 0 → 85 over 2 seconds

- [ ] **#P5-020**: Add Sticky CTA Bar (Mobile)
  - **Effort**: S (2-3h)
  - **Position**: Bottom of mobile screen, fixed
  - **Content**: "[📞 Call] [✉️ Apply]" buttons
  - **Hide**: When footer is visible
  - **Design**: Navy background, yellow buttons

### 5.6 Content Population (Priority: HIGH)
- [ ] **#P5-021**: Populate Site Settings in Admin
  - Real company phone, email, WhatsApp
  - Social media URLs
  - Enable features (newsletter, WhatsApp button)
  - Google Analytics ID

- [ ] **#P5-022**: Create 5-10 Case Studies
  - **Mix**: 2-3 Market Entry (EN), 3-4 Export (TR)
  - **Content**: Client company, challenge, solution, results, metrics
  - **Testimonials**: Get client quotes
  - **Images**: Client logos (get permission)
  - **Status**: Publish after review

- [ ] **#P5-023**: Populate SEO Metadata
  - All pages need title/description
  - OG images for social sharing
  - Focus on: Home, Solutions, Industries, Case Studies

---

## 📈 Phase 6: Growth & Optimization (PLANNED)

### 6.1 Blog & Content Marketing (Priority: HIGH)
- [ ] **#P6-001**: Create Blog Module (Backend)
  - **Effort**: L (1-2 days)
  - **Model**: `BlogPost(title, slug, content, excerpt, category, tags, author, published_at)`
  - **Admin**: Full CRUD in Jazzmin
  - **API**: `/api/v1/blog/` endpoints
  - **Categories**: Market Entry, Export, Industry Trends, Success Stories, Regulations

- [ ] **#P6-002**: Create Blog Module (Frontend)
  - **Effort**: L (1-2 days)
  - **Pages**: `/en/blog/`, `/en/blog/:slug/`, `/en/blog/category/:category/`
  - **Features**: Search, filter, pagination
  - **Design**: Card layout, featured image, read time

- [ ] **#P6-003**: Write 10 Blog Posts (EN)
  - **Topics**: Market entry guides, regulations, case studies, industry insights
  - **Length**: 1,500-3,000 words each
  - **SEO**: Keyword research, internal links
  - **Timeline**: 2 posts per week

- [ ] **#P6-004**: Write 10 Blog Posts (TR)
  - **Topics**: Export guides, market opportunities, success stories
  - **Length**: 1,500-3,000 words each
  - **SEO**: Turkish keyword optimization

### 6.2 Lead Generation (Priority: HIGH)
- [ ] **#P6-005**: Create Lead Magnet PDFs
  - **EN**: "Ultimate Guide to Entering Turkish Market" (30 pages)
  - **TR**: "İhracat Başlangıç Rehberi" (30 pages)
  - **Design**: Professional, branded
  - **Landing Pages**: Dedicated download pages with form

- [ ] **#P6-006**: Build ROI Calculator
  - **Effort**: L (1-2 days)
  - **Page**: `/en/calculator/` and `/tr/hesaplayici/`
  - **Inputs**: Revenue, category, market share, current markets
  - **Outputs**: Year 1 potential, Year 3 projection, break-even, ROI
  - **CTA**: Email capture for detailed report

- [ ] **#P6-007**: Implement Email Nurture Sequences
  - **Effort**: L (2 days)
  - **Tool**: Celery tasks + Django email templates
  - **Sequences**:
    - Guide Download: Day 0, 3, 7, 14
    - Application Started: Day 1, 3, 7
    - Post-Application: Day 0, 3, 7
  - **Content**: Write email copy (EN/TR)

### 6.3 Video & Rich Media (Priority: MEDIUM)
- [ ] **#P6-008**: Record Company Introduction Video
  - **Effort**: XL (1 week with agency)
  - **Length**: 90-120 seconds
  - **Versions**: EN + TR
  - **Content**: Company intro, services, value proposition
  - **Agency**: Hire Turkish video production
  - **Budget**: $2,000-5,000

- [ ] **#P6-009**: Add Video to Homepage Hero
  - **Effort**: M (4-6h)
  - **Type**: Background video or embedded YouTube
  - **Fallback**: Static image if video fails
  - **Controls**: Mute by default, play button
  - **Hosting**: YouTube or Vimeo

- [ ] **#P6-010**: Create Customer Testimonial Videos
  - **Effort**: L per video (2-3 days)
  - **Count**: 3-5 videos
  - **Format**: Customer interview (1-2 min)
  - **Content**: Challenge, solution, results
  - **Record**: Via Zoom, professional editing

### 6.4 Analytics & Testing (Priority: MEDIUM)
- [ ] **#P6-011**: Install Hotjar / Heatmaps
  - **Effort**: XS (1h)
  - **Cost**: $39/month
  - **Features**: Heatmaps, session recordings, funnels, surveys
  - **Action**: Watch 20 recordings per week

- [ ] **#P6-012**: Setup A/B Testing
  - **Effort**: M (1 day)
  - **Tool**: Google Optimize (free) or VWO (paid)
  - **Tests**:
    - Hero headline variants
    - CTA button text/color
    - Form length (5 vs 10 fields)
  - **Tracking**: GA4 goals

- [ ] **#P6-013**: Install Retargeting Pixels
  - **Effort**: S (2-3h)
  - **Pixels**: Facebook, Google Ads, LinkedIn
  - **Audiences**: Homepage visitors, service viewers, application starters
  - **Budget**: $1,500-2,500/month for ads

- [ ] **#P6-014**: Optimize Page Speed
  - **Effort**: L (1-2 days)
  - **Audit**: Google PageSpeed Insights
  - **Actions**:
    - Convert images to WebP
    - Lazy loading
    - Code splitting
    - Enable CDN
    - Minify assets
  - **Target**: LCP < 2.5s

### 6.5 UX Improvements (Priority: MEDIUM)
- [ ] **#P6-015**: Create Mega Menu Navigation
  - **Effort**: M (1 day)
  - **Structure**: Services, Industries (with icons), Resources
  - **Design**: Full-width dropdown on hover
  - **Mobile**: Accordion menu

- [ ] **#P6-016**: Add Breadcrumbs
  - **Effort**: XS (1-2h)
  - **Format**: Home > Industries > Electronics
  - **Schema**: BreadcrumbList structured data

- [ ] **#P6-017**: Implement Site Search
  - **Effort**: M (1 day)
  - **Backend**: Full-text search on Blog, Case Studies, Pages
  - **Frontend**: Search bar in header, instant results
  - **Library**: ElasticSearch or simple Postgres full-text

- [ ] **#P6-018**: Add Testimonial Section to Homepage
  - **Effort**: S (3-4h)
  - **Data**: Fetch from CaseStudy model (filter by testimonial)
  - **Design**: Carousel or grid of 3 testimonials
  - **Position**: After features, before industries

### 6.6 Mobile Optimization (Priority: MEDIUM)
- [ ] **#P6-019**: Mobile-First Form Redesign
  - **Effort**: M (1 day)
  - **Improvements**:
    - Single column layout
    - Larger inputs (min 48px)
    - Multi-step with progress bar
    - Auto-focus next field
  - **Test**: iPhone, Android

- [ ] **#P6-020**: Add Click-to-Call Buttons
  - **Effort**: XS (30min)
  - **Replace**: Display phone numbers
  - **With**: `<a href="tel:+90...">`
  - **Test**: Works on iOS and Android

- [ ] **#P6-021**: Optimize Images for Mobile
  - **Effort**: M (4-6h)
  - **Actions**: Responsive images, WebP, lazy load
  - **Tool**: Sharp (already installed)

---

## 🎓 Phase 7: Advanced Features (FUTURE)

### 7.1 Backend Enhancements
- [ ] **#P7-001**: Add Email Automation (Celery)
  - Welcome emails, status updates, nurture sequences
  - Django email templates (EN/TR)

- [ ] **#P7-002**: Create Admin Dashboard
  - Metrics: Applications, contacts, conversions
  - Charts: Chart.js or similar
  - Access: `/admin/dashboard/`

- [ ] **#P7-003**: Implement File Upload
  - Direct file upload for applications
  - Storage: AWS S3
  - Types: PDF, DOCX, images

- [ ] **#P7-004**: Add Multi-language FAQ
  - Model: `FAQ(question_en, question_tr, answer, category)`
  - Frontend: Accordion with search
  - SEO: FAQ schema markup

### 7.2 Integration & Automation
- [ ] **#P7-005**: CRM Integration (HubSpot/Salesforce)
- [ ] **#P7-006**: Live Chat Widget (Intercom/Drift)
- [ ] **#P7-007**: Marketing Automation (Mailchimp API)
- [ ] **#P7-008**: Payment Gateway (Stripe for future services)

### 7.3 Expansion
- [ ] **#P7-009**: Additional Languages (DE, FR, RU, AR)
- [ ] **#P7-010**: Partner Portal (authenticated area)
- [ ] **#P7-011**: Mobile App (React Native)

---

## 🐛 KNOWN ISSUES / TODO

### Critical
1. **Content**: Case Studies need to be populated with real client data
2. **Settings**: Site Settings need real company info (currently defaults)
3. **SSL**: Production SSL certificate pending

### Important
4. **SEO**: Meta descriptions missing on some pages
5. **Images**: Need client logos for trust signals
6. **Legal**: Terms & Privacy need lawyer review

### Nice to Have
7. **About Page**: Could use dynamic content from admin
8. **Chat**: Live chat would improve conversion
9. **Video**: Professional video production needed

---

## 📊 SUCCESS METRICS

Track these KPIs to measure success:

### Traffic
- **Organic Traffic**: Target +40-60% (from blog SEO)
- **Bounce Rate**: Target <50% (from UX improvements)
- **Pages/Session**: Target >3 (from navigation)

### Conversion
- **Application Rate**: Target 2-3% of visitors
- **Contact Form**: Target 5-7% of visitors
- **Newsletter Signup**: Target 8-10% of visitors

### Engagement
- **Time on Site**: Target >3 minutes
- **Return Visitor Rate**: Target >25%
- **Exit Popup Conversion**: Target 2-5%

### Technical
- **Page Load Time**: Target <2.5s (LCP)
- **Mobile Score**: Target 90+ (Lighthouse)
- **Uptime**: Target 99.9%

---

## 🛠️ DEPLOYMENT VARIABLES

**⚠️ DO NOT CHANGE IN CODE. CHANGE IN ADMIN PANEL (Site Settings).**

### Company Info
- `company_name`: LOXTR
- `company_tagline`: Locate • Obtain • Xport
- `company_email`: info@loxtr.com
- `company_phone`: +90 (212) XXX XX XX
- `whatsapp_number`: +90 5XX XXX XX XX

### Office Details
- `office_address_en`: Istanbul, Turkey
- `office_address_tr`: İstanbul, Türkiye
- `working_hours_en`: Monday - Friday: 9:00 AM - 6:00 PM
- `working_hours_tr`: Pazartesi - Cuma: 09:00 - 18:00

### Social Media
- `linkedin_url`: https://linkedin.com/company/loxtrcom
- `instagram_url`: https://instagram.com/loxtrcom
- `youtube_url`: https://youtube.com/@loxtrcom

### Features
- `enable_newsletter`: True
- `enable_whatsapp_button`: True
- `enable_live_chat`: False
- `maintenance_mode`: False

### Analytics
- `google_analytics_id`: (Add in production)
- `google_tag_manager_id`: (Add in production)

---

## 🗂️ PROJECT STRUCTURE REFERENCE

```
loxtr/
├── backend/
│   ├── apps/
│   │   ├── analytics/     # GeoVisitor tracking
│   │   ├── api/           # REST API endpoints
│   │   ├── applications/  # Partner applications
│   │   ├── case_studies/  # Success stories ⭐
│   │   ├── contact/       # Contact & newsletter
│   │   ├── core/          # Core utilities
│   │   ├── global_view/   # EN view logic
│   │   ├── local_view/    # TR view logic
│   │   └── seo/           # SEO + SiteSettings ⭐
│   ├── loxtr/            # Project settings
│   └── middleware/        # Geo-detection ⭐
│
├── frontend/
│   ├── src/
│   │   ├── pages/        # All pages (Home, Solutions, etc.)
│   │   ├── components/   # Reusable components
│   │   ├── context/      # GeoContext, SettingsContext ⭐
│   │   └── siteConfig.ts # Static config (12 industries, etc.)
│   └── public/           # Static assets
│
├── docs/
│   ├── LOXTR-SYSTEM-CONSTITUTION.md  # THE LAW ⭐
│   ├── LOXTR-TASKS-LIST.md          # Comprehensive improvements
│   └── LOXTR-AI-TASK-PROMPT.md      # AI helper for PM tools
│
├── docker-compose.yml
├── TASKS.md              # This file ⭐
└── README.md
```

---

## 🔗 QUICK LINKS

### Documentation
- **Constitution**: [LOXTR-SYSTEM-CONSTITUTION-UNIFIED.md](./LOXTR-SYSTEM-CONSTITUTION-UNIFIED.md) ⭐ READ FIRST
- **Comprehensive Tasks**: [LOXTR-TASKS-LIST.md](./LOXTR-TASKS-LIST.md)
- **AI Task Helper**: [LOXTR-AI-TASK-PROMPT.md](./LOXTR-AI-TASK-PROMPT.md)

### Development
- **Admin**: http://localhost:8000/admin/
- **Frontend**: http://localhost:5174/
- **API**: http://localhost:8000/api/v1/

### Production
- **Website**: https://www.loxtr.com (pending)
- **Admin**: https://www.loxtr.com/admin/ (pending)

---

## 📝 NOTES

### Priority System
- **CRITICAL**: Must do before launch
- **HIGH**: Significant business impact
- **MEDIUM**: Important but not urgent
- **LOW**: Nice to have

### Effort Estimates
- **XS**: <2 hours
- **S**: 2-4 hours
- **M**: 1 day
- **L**: 2-3 days
- **XL**: 1 week+

### Task Numbering
- **#P5-XXX**: Phase 5 tasks (Pre-Deployment)
- **#P6-XXX**: Phase 6 tasks (Growth)
- **#P7-XXX**: Phase 7 tasks (Advanced)

---

## 🎯 IMMEDIATE NEXT STEPS

**This Week (Phase 5):**
1. ✅ Populate Site Settings with real data
2. ✅ Create 5+ Case Studies
3. ✅ Add WhatsApp floating button (TR mobile)
4. ✅ Implement exit intent popup
5. ✅ Add trust signals to homepage

**Next Week:**
6. Deploy to staging for testing
7. Security audit & SSL setup
8. Populate SEO metadata
9. Launch MVP to production! 🚀

**Month 2 (Phase 6):**
10. Build blog module
11. Create lead magnets (PDFs)
12. Install analytics tools
13. Write 10-20 blog posts
14. Launch growth marketing

---

## 🎉 PROJECT STATUS

```
✅ System Architecture: SOLID
✅ Dual Interface: WORKING
✅ Geo-Detection: ACCURATE
✅ Admin Panel: FUNCTIONAL
✅ Core Pages: COMPLETE

⏳ Content: IN PROGRESS (30%)
⏳ Pre-Deployment: IN PROGRESS (20%)
🔜 Enhancements: PLANNED
🔜 Growth Features: PLANNED
```

**We're ready to launch MVP and iterate! 🚀**

---

**Last Updated:** 2026-01-08 23:30  
**Next Review:** Weekly during active development  
**Maintained By:** Development Team
