import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.loxtr.com';

const STATIC_ROUTES = [
    '', // Home
    'solutions', // cozumler
    'industries', // sektorler
    'partner',
    'distribution',
    'about',
    'contact',
    'faq',
    'export-solutions' // TR only usually, but we handle mapping below
];

const ROUTE_MAP = {
    en: {
        'solutions': 'solutions',
        'industries': 'industries',
        'partner': 'partner',
        'distribution': 'distribution',
        'about': 'about',
        'contact': 'contact',
        'faq': 'faq',
        'export-solutions': 'export-solutions'
    },
    tr: {
        'solutions': 'cozumler',
        'industries': 'sektorler',
        'partner': 'partner',
        'distribution': 'distribution',
        'about': 'about',
        'contact': 'contact',
        'faq': 'faq',
        'export-solutions': 'export-solutions'
    }
};

// Mock function to fetch dynamic routes (e.g. from headless CMS or database)
async function getDynamicRoutes() {
    // In a real scenario, fetch these from your API
    const industries = [
        'consumer-electronics',
        'industrial-machinery',
        'medical-healthcare',
        'automotive-parts',
        'construction-materials',
        'textile-apparel',
        'food-beverage',
        'cosmetics'
    ];

    return industries.map(slug => ({
        slug,
        type: 'industry',
        updatedAt: new Date().toISOString().split('T')[0]
    }));
}

// Manually added blog posts list for sitemap purposes
// In a real app, this should import from data/blog-content.ts but we are in Node environment (module type: module) so we can't easily import TS files.
// We will duplicate the slugs here for now or read the file as string and parse regex (too brittle).
// Hardcoding the slugs is the safest quick way for now.
const BLOG_SLUGS = [
    // EN
    'why-turkey-target-market-2026',
    'gateway-to-emea',
    'navigating-turkish-customs',
    // TR
    'ihracata-baslarken-yapilan-hatalar',
    'yurtdisi-musteri-bulma-yontemleri',
    'ihracat-destekleri-2026'
];

function generateUrlEntry(loc, lastmod, priority, alternates = []) {
    let xml = `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <priority>${priority}</priority>\n`;

    alternates.forEach(alt => {
        xml += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}"/>\n`;
    });

    xml += `  </url>\n`;
    return xml;
}

async function generateSitemap() {
    console.log('Generating sitemap...');

    const today = new Date().toISOString().split('T')[0];
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    // 1. Generate Static Routes
    STATIC_ROUTES.forEach(route => {
        const isHome = route === '';
        const priority = isHome ? '1.0' : '0.8';

        // EN Version
        const enPath = route === '' ? '' : `/${ROUTE_MAP.en[route] || route}`;
        const enUrl = `${BASE_URL}/en${enPath}`;

        // TR Version
        const trPath = route === '' ? '' : `/${ROUTE_MAP.tr[route] || route}`;
        const trUrl = `${BASE_URL}/tr${trPath}`;

        // Add EN Entry
        sitemapContent += generateUrlEntry(enUrl, today, priority, [
            { lang: 'tr', url: trUrl },
            { lang: 'en', url: enUrl } // Self-ref is good practice
        ]);

        // Add TR Entry
        sitemapContent += generateUrlEntry(trUrl, today, priority, [
            { lang: 'tr', url: trUrl },
            { lang: 'en', url: enUrl }
        ]);
    });

    // 2. Generate Dynamic Routes (Industries)
    const dynamicRoutes = await getDynamicRoutes();

    dynamicRoutes.forEach(item => {
        const priority = '0.7';

        // EN: /en/industries/[slug]
        const enUrl = `${BASE_URL}/en/industries/${item.slug}`;

        // TR: /tr/sektorler/[slug]
        const trUrl = `${BASE_URL}/tr/sektorler/${item.slug}`;

        // Add EN Entry
        sitemapContent += generateUrlEntry(enUrl, item.updatedAt, priority, [
            { lang: 'tr', url: trUrl },
            { lang: 'en', url: enUrl }
        ]);

        // Add TR Entry
        sitemapContent += generateUrlEntry(trUrl, item.updatedAt, priority, [
            { lang: 'tr', url: trUrl },
            { lang: 'en', url: enUrl }
        ]);
    });

    // 3. Generate Blog Routes
    // Note: Blog posts are language specific. An EN post might not have a direct TR translation or slug might differ.
    // Our blog-content.ts handles lang specifically.
    // For simplicity in this script, we assume no direct alternates for blog posts unless we map them.
    // The user didn't specify strict 1:1 mapping for blog posts yet, just "12 EN, 12 TR".
    // So we will list them individually without alternates or with self-ref only.

    // However, to be cleaner, we should check the lang of the slug. 
    // Since we hardcoded the slugs above mixed, let's just loop and guess or check knowing the list.

    const EN_BLOGS = [
        'why-turkey-target-market-2026',
        'gateway-to-emea',
        'navigating-turkish-customs'
    ];
    const TR_BLOGS = [
        'ihracata-baslarken-yapilan-hatalar',
        'yurtdisi-musteri-bulma-yontemleri',
        'ihracat-destekleri-2026'
    ];

    EN_BLOGS.forEach(slug => {
        const url = `${BASE_URL}/en/blog/${slug}`;
        sitemapContent += generateUrlEntry(url, today, '0.6', [{ lang: 'en', url }]);
    });

    TR_BLOGS.forEach(slug => {
        const url = `${BASE_URL}/tr/blog/${slug}`;
        sitemapContent += generateUrlEntry(url, today, '0.6', [{ lang: 'tr', url }]);
    });

    sitemapContent += `</urlset>`;

    // Write to public folder (for dev)
    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);

    // Write to dist folder (for prod) - CRITICAL for Vercel deployment
    const distDir = path.resolve(__dirname, '../dist');
    if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent);
        console.log(`✅ Sitemap generated at: ${path.join(distDir, 'sitemap.xml')}`);
    } else {
        console.warn('⚠️ Dist directory not found. Sitemap only written to public.');
    }
}

generateSitemap().catch(err => {
    console.error('Failed to generate sitemap:', err);
    process.exit(1);
});
