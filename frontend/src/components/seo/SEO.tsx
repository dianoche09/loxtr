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
    const siteUrl = 'https://www.loxtr.com';
    const defaultOgImage = `${siteUrl}/static/images/og-default.jpg`;

    // Generate hreflang URLs
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const basePath = currentPath.replace(/^\/(en|tr)/, '');

    const hreflangTags = [
        { lang: 'en', url: `${siteUrl}/en${basePath}` },
        { lang: 'tr', url: `${siteUrl}/tr${basePath}` },
        { lang: 'x-default', url: `${siteUrl}/en${basePath}` },
    ];

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl || `${siteUrl}${currentPath}`} />

            {/* Hreflang Tags (CRITICAL!) */}
            {hreflangTags.map(({ lang, url }) => (
                <link key={lang} rel="alternate" hrefLang={lang} href={url} />
            ))}

            {/* Robots */}
            <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage || defaultOgImage} />
            <meta property="og:url" content={canonicalUrl || `${siteUrl}${currentPath}`} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="LOXTR" />

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={title} />
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
