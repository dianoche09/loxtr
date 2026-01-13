/**
 * SEO Component
 * 
 * Wrapper around React Helmet for managing meta tags.
 * Includes hreflang, Open Graph, Twitter Cards, and structured data.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    structuredData?: object;
    noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    structuredData,
    noIndex = false,
}) => {
    const siteUrl = 'https://loxtr.vercel.app'; // Ideally configurable
    const defaultOgImage = `${siteUrl}/static/images/og-default.jpg`;

    // Determine language from URL since we don't have it passed prop yet everywhere
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentLang = currentPath.startsWith('/tr') ? 'tr' : 'en';

    // Route Translation Map (Duplicated from App.tsx for independence or should be shared)
    // Ideally this should be imported from a config file.
    const routeMap: Record<string, Record<string, string>> = {
        en: {
            'solutions': 'cozumler',
            'industries': 'sektorler',
            'contact': 'contact',
            'about': 'about',
            'partner': 'partner',
            'distribution': 'distribution',
            'faq': 'faq',
            'export-solutions': 'export-solutions'
        },
        tr: {
            'cozumler': 'solutions',
            'sektorler': 'industries',
            'contact': 'contact',
            'about': 'about',
            'partner': 'partner',
            'distribution': 'distribution',
            'faq': 'faq',
            'export-solutions': 'export-solutions'
        }
    };

    const getAlternateUrl = (targetLang: 'en' | 'tr') => {
        const segments = currentPath.split('/').filter(Boolean);
        // segments[0] is lang (en or tr)
        // segments[1] is page (e.g. solutions)
        // segments[2+] are params (slugs) - simplistic handling here

        if (segments.length < 2) return `${siteUrl}/${targetLang}`;

        const currentPage = segments[1];
        const rest = segments.slice(2).join('/');

        let translatedPage = currentPage;

        if (currentLang !== targetLang) {
            // Translate the segment if map exists
            const map = routeMap[currentLang];
            if (map && map[currentPage]) {
                translatedPage = map[currentPage];
            }
        }

        return `${siteUrl}/${targetLang}/${translatedPage}${rest ? '/' + rest : ''}`;
    };

    const hreflangTags = [
        { lang: 'en', url: getAlternateUrl('en') },
        { lang: 'tr', url: getAlternateUrl('tr') },
        { lang: 'x-default', url: getAlternateUrl('en') },
    ];

    const fullTitle = `${title} | LOXTR`; // Consistent suffix

    return (
        <Helmet>
            <html lang={currentLang} />

            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl || `${siteUrl}${currentPath}`} />

            {/* Hreflang Tags */}
            {hreflangTags.map(({ lang, url }) => (
                <link key={lang} rel="alternate" hrefLang={lang} href={url} />
            ))}

            {/* Robots */}
            <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage || defaultOgImage} />
            <meta property="og:url" content={canonicalUrl || `${siteUrl}${currentPath}`} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="LOXTR Global Trade" />
            <meta property="og:locale" content={currentLang === 'en' ? 'en_US' : 'tr_TR'} />
            <meta property="og:locale:alternate" content={currentLang === 'en' ? 'tr_TR' : 'en_US'} />

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
