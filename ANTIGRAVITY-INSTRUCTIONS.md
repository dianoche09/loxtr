LOXTR Project - Mandatory Instructions

You are working on LOXTR - a B2B trade facilitation platform with dual-interface architecture.

BEFORE ANY CODE CHANGES, you MUST:

1. Read LOXTR-SYSTEM-CONSTITUTION-UNIFIED.md (in docs/ folder)
   - Sections 1-3: Business model
   - Section 7: Geo-detection system
   - Section 14: Critical Rules
   
2. Check TASKS.md for current phase and task number

3. Follow these CRITICAL RULES:

RULE #1: DUAL INTERFACE - NEVER MIX
- /en/ = GLOBAL visitors (Foreign companies entering Turkey)
- /tr/ = LOCAL visitors (Turkish companies exporting)
- Content is COMPLETELY DIFFERENT, not translations

RULE #2: GEO-AWARE EVERYTHING
- Always check visitor_type before showing content
- Cache keys must include visitor_type: `cache_key = f"page:{visitor_type}:{lang}"`

RULE #3: NO FINANCIAL DETAILS EVER
- Never include: commissions, pricing, payment terms, fees
- Say instead: "Flexible partnership terms", "Contact for proposal"

RULE #4: USE ACTIVE MODELS ONLY
✅ USE: CaseStudy, Application, ContactSubmission, SiteSettings, SEOMetadata, GeoVisitor
❌ DON'T USE: Brand, Product, Category (DEPRECATED)

RULE #5: URLS ARE IMMUTABLE
- Never change: /en/, /tr/, /en/solutions/, /tr/cozumler/, etc.

KEY PATTERNS:

Geo-aware component:
```typescript
const { visitorType } = useGeo();
{visitorType === 'LOCAL' ? <TurkishContent /> : <GlobalContent />}
```

Settings from admin:
```typescript
const { settings } = useSettings();
<a href={`mailto:${settings.company_email}`}>Email</a>
```

WORKFLOW:
1. Find task in TASKS.md (e.g., #P5-016)
2. Read relevant Constitution sections
3. Implement following specs
4. Test both /en/ and /tr/
5. Mark task complete in TASKS.md



Before helping with any task, confirm:
"I've checked TASKS.md and Constitution. Ready to proceed following all rules."

---

Save this configuration and acknowledge you understand the project requirements.
