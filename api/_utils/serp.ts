import axios from 'axios';

const SERP_API_KEY = process.env.SERP_API_KEY || '';
const SERP_BASE = 'https://serpapi.com/search.json';

interface SerpOrganicResult {
    title: string;
    link: string;
    snippet: string;
    position: number;
}

interface SerpMapsResult {
    title: string;
    address: string;
    phone?: string;
    website?: string;
    rating?: number;
    reviews?: number;
    type?: string;
    gps_coordinates?: { latitude: number; longitude: number };
    thumbnail?: string;
}

export interface SerpSearchResult {
    type: 'organic' | 'maps';
    companyName: string;
    website: string | null;
    phone: string | null;
    address: string | null;
    snippet: string | null;
    sourceUrl: string;
    rating: number | null;
    reviews: number | null;
}

export const serp = {
    /**
     * Google Search — find importers/distributors via organic results
     * Best for: trade directories, company listings, LinkedIn profiles
     */
    async searchGoogle(params: {
        product: string;
        country: string;
        industry?: string;
        count?: number;
    }): Promise<SerpSearchResult[]> {
        if (!SERP_API_KEY) return [];

        const queries = [
            `${params.product} importers ${params.country} wholesale B2B`,
            `${params.product} distributors ${params.country} contact email`,
        ];

        const allResults: SerpSearchResult[] = [];

        for (const q of queries) {
            try {
                const { data } = await axios.get(SERP_BASE, {
                    params: {
                        api_key: SERP_API_KEY,
                        engine: 'google',
                        q,
                        num: params.count || 10,
                        gl: getCountryGl(params.country),
                    },
                    timeout: 15_000,
                });

                const organicResults: SerpOrganicResult[] = data.organic_results || [];

                for (const r of organicResults) {
                    // Skip generic sites (Wikipedia, Amazon, etc.)
                    if (isGenericSite(r.link)) continue;

                    allResults.push({
                        type: 'organic',
                        companyName: extractCompanyName(r.title),
                        website: r.link,
                        phone: null,
                        address: null,
                        snippet: r.snippet || null,
                        sourceUrl: r.link,
                        rating: null,
                        reviews: null,
                    });
                }
            } catch (error: any) {
                console.error(`SerpAPI Google search error for "${q}":`, error.message);
            }
        }

        // Deduplicate by domain
        const seen = new Set<string>();
        return allResults.filter(r => {
            const domain = extractDomain(r.website || '');
            if (!domain || seen.has(domain)) return false;
            seen.add(domain);
            return true;
        });
    },

    /**
     * Google Maps — find local businesses (importers, wholesalers, distributors)
     * Best for: verified business data with phone, address, ratings
     */
    async searchMaps(params: {
        product: string;
        country: string;
        city?: string;
    }): Promise<SerpSearchResult[]> {
        if (!SERP_API_KEY) return [];

        const location = params.city
            ? `${params.city}, ${params.country}`
            : params.country;

        const query = `${params.product} importer wholesale ${location}`;

        try {
            const { data } = await axios.get(SERP_BASE, {
                params: {
                    api_key: SERP_API_KEY,
                    engine: 'google_maps',
                    q: query,
                    type: 'search',
                    ll: undefined, // Let SerpAPI resolve location
                },
                timeout: 15_000,
            });

            const mapsResults: SerpMapsResult[] = data.local_results || [];

            return mapsResults.map(r => ({
                type: 'maps' as const,
                companyName: r.title,
                website: r.website || null,
                phone: r.phone || null,
                address: r.address || null,
                snippet: r.type || null,
                sourceUrl: r.website || '',
                rating: r.rating || null,
                reviews: r.reviews || null,
            }));
        } catch (error: any) {
            console.error('SerpAPI Maps search error:', error.message);
            return [];
        }
    },

    /**
     * Combined search: Google + Maps, deduplicated
     * Returns up to `count` unique companies
     */
    async discoverCompanies(params: {
        product: string;
        targetMarkets: string[];
        industry?: string;
        count?: number;
    }): Promise<SerpSearchResult[]> {
        const maxPerMarket = Math.ceil((params.count || 15) / params.targetMarkets.length);
        const allResults: SerpSearchResult[] = [];

        // Run Google + Maps searches for each market in parallel
        const searchPromises = params.targetMarkets.flatMap(country => [
            this.searchGoogle({ product: params.product, country, industry: params.industry, count: maxPerMarket }),
            this.searchMaps({ product: params.product, country }),
        ]);

        const results = await Promise.allSettled(searchPromises);

        for (const result of results) {
            if (result.status === 'fulfilled') {
                allResults.push(...result.value);
            }
        }

        // Deduplicate by domain
        const seen = new Set<string>();
        const unique = allResults.filter(r => {
            const domain = extractDomain(r.website || '');
            if (!domain || seen.has(domain)) return false;
            seen.add(domain);
            return true;
        });

        return unique.slice(0, params.count || 30);
    },

    /**
     * Check remaining API credits
     */
    async getAccountInfo(): Promise<{ remaining: number } | null> {
        if (!SERP_API_KEY) return null;
        try {
            const { data } = await axios.get('https://serpapi.com/account.json', {
                params: { api_key: SERP_API_KEY },
                timeout: 5_000,
            });
            return { remaining: data.total_searches_left || 0 };
        } catch {
            return null;
        }
    },
};

// --- Helpers ---

function extractCompanyName(title: string): string {
    // Remove common suffixes: "- Official Site", "| LinkedIn", "Company Profile"
    return title
        .replace(/\s*[-|–]\s*(Official|Home|Contact|About|LinkedIn|Profile|Website).*$/i, '')
        .replace(/\s*\|.*$/, '')
        .trim();
}

function extractDomain(url: string): string {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

function isGenericSite(url: string): boolean {
    const blocked = [
        'wikipedia.org', 'amazon.com', 'ebay.com', 'alibaba.com',
        'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com',
        'reddit.com', 'quora.com', 'medium.com', 'pinterest.com',
        'tiktok.com', 'gov.', 'yelp.com', 'tripadvisor.com',
        'indeed.com', 'glassdoor.com',
    ];
    return blocked.some(b => url.includes(b));
}

function getCountryGl(country: string): string {
    const glMap: Record<string, string> = {
        'Germany': 'de', 'France': 'fr', 'Italy': 'it', 'Spain': 'es',
        'United Kingdom': 'uk', 'UK': 'uk', 'Netherlands': 'nl', 'Belgium': 'be',
        'Poland': 'pl', 'Austria': 'at', 'Sweden': 'se', 'Denmark': 'dk',
        'Finland': 'fi', 'Norway': 'no', 'Switzerland': 'ch', 'Portugal': 'pt',
        'Greece': 'gr', 'Czech Republic': 'cz', 'Romania': 'ro', 'Hungary': 'hu',
        'USA': 'us', 'United States': 'us', 'Canada': 'ca', 'Mexico': 'mx',
        'Brazil': 'br', 'Argentina': 'ar', 'China': 'cn', 'Japan': 'jp',
        'South Korea': 'kr', 'India': 'in', 'Turkey': 'tr', 'Russia': 'ru',
        'Australia': 'au', 'New Zealand': 'nz', 'South Africa': 'za',
        'Saudi Arabia': 'sa', 'UAE': 'ae', 'United Arab Emirates': 'ae',
        'Egypt': 'eg', 'Nigeria': 'ng', 'Kenya': 'ke', 'Morocco': 'ma',
        'Israel': 'il', 'Iraq': 'iq', 'Iran': 'ir', 'Pakistan': 'pk',
        'Indonesia': 'id', 'Thailand': 'th', 'Vietnam': 'vn', 'Malaysia': 'my',
        'Singapore': 'sg', 'Philippines': 'ph', 'Colombia': 'co', 'Chile': 'cl',
    };
    return glMap[country] || 'us';
}
