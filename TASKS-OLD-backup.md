# LOXTR Project - Master Plan & Task Tracker

**Last Updated:** 2026-01-08 (Phase 4 Completed)
**Status:** ACTIVE
**Reference:** `LOXTR-SYSTEM-CONSTITUTION.md` (The Law)

---

## 🎯 CURRENT FOCUS: Pre-Deployment & Verification

We have successfully refined the system (Phase 4), removing deprecated features and integrating dynamic settings. The focus now shifts to verifying the system in staging, populating content (Case Studies), and preparing for production deployment.

---

## 🗓️ TASK LIST

### Phase 1: Core Foundation (✅ DONE)
- [x] **Backend**: Django + DRF + Postgres + Redis + Celery setup
- [x] **Frontend**: React + Vite + TypeScript + Tailwind
- [x] **Infrastructure**: Docker Compose, GeoIP, SendGrid
- [x] **Routing**: Dual-interface (EN/TR) logic
- [x] **Admin**: Jazzmin UI setup

### Phase 2: Essential Features (✅ DONE)
- [x] **Site Settings**: Singleton model for global config (Company info, Socials, etc.)
- [x] **Case Studies**: Success stories model (Replacing Brands/Products)
- [x] **Applications**: Partner & Export program forms
- [x] **Contact**: Contact form & Newsletter subscription
- [x] **SEO**: SEOMetadata model per page

### Phase 3: Content Pages (✅ DONE)
- [x] Home (EN/TR)
- [x] Solutions (EN/TR)
- [x] Industries (12 sectors)
- [x] About Us
- [x] FAQ (Dual content: Entry vs Export)
- [x] Contact Page
- [x] Legal (Terms, Privacy)

### Phase 4: Integration & Cleanup (✅ DONE)
- [x] **Frontend Settings**: Fetch `SiteSettings` from API (replace hardcoded hardcoded phone/email)
- [x] **Case Studies UI**: Create Case Studies listing & detail pages
- [x] **Cleanup**: Remove deprecated `Brands`, `Products`, `Categories` apps & code
- [x] **Content**: Populate initial Success Stories (Case Studies) - *Pending Content Entry*
- [x] **Admin**: Verify all Site Settings are editable and working
- [x] **UX**: Refine Menu structure & Add 'Become Partner' CTA

### Phase 5: Pre-Deployment Checks (Draft)
- [ ] **Security**:
  - [ ] `DEBUG=False`
  - [ ] `ALLOWED_HOSTS` configured
  - [ ] SSL Certificate (Let's Encrypt)
  - [ ] Rate limiting enabled
- [ ] **Database**:
  - [ ] PostgreSQL production backup scheduled
  - [ ] Redis password set
- [ ] **Static/Media**:
  - [ ] AWS S3 configured for media files
  - [ ] Static files collected (`collectstatic`)
- [ ] **SEO & Analytics**:
  - [ ] Google Analytics 4 ID added to Site Settings
  - [ ] Sitemap.xml generation
  - [ ] Robots.txt file
- [ ] **Compliance**:
  - [ ] Cookie Consent Banner (GDPR/KVKK)

### Phase 6: Post-Launch Growth
- [ ] **Marketing**: Email drip campaigns
- [ ] **Expansion**: Additional languages (DE, RU, AR)
- [ ] **CRM**: HubSpot/Salesforce integration

---

## 🛠️ DEPLOYMENT VARIABLES (Managed in Admin > Site Settings)

**DO NOT CHANGE IN CODE. CHANGE IN ADMIN PANEL.**

- **Company**: LOXTR, Tagline, Email, Phone
- **Socials**: LinkedIn, Instagram, YouTube, X
- **Features**: Newsletter, WhatsApp Button, Live Chat
- **Maintenance**: Maintenance Mode ON/OFF

---

## 🐛 KNOWN ISSUES / TODO
1.  **Content**: Case Studies and Site Settings data needs to be populated in the Admin Panel.
2.  **About Page**: Currently static, eventually could use dynamic content.

---

## 🔗 QUICK LINKS
- **Constitution**: [LOXTR-SYSTEM-CONSTITUTION.md](./LOXTR-SYSTEM-CONSTITUTION.md)
- **Admin**: http://localhost:8000/admin/
- **Frontend**: http://localhost:5174/
