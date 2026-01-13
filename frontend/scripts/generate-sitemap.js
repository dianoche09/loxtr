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

    sitemapContent += `</urlset>`;

    // Write to public folder
    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapContent);

    console.log(`✅ Sitemap generated at: ${sitemapPath}`);
}

generateSitemap().catch(err => {
    console.error('Failed to generate sitemap:', err);
    process.exit(1);
});
