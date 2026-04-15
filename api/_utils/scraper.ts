import axios from 'axios';

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8100';
const SCRAPER_KEY = process.env.SCRAPER_API_KEY || '';

const client = axios.create({
    baseURL: SCRAPER_URL,
    timeout: 60_000,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SCRAPER_KEY,
    },
});

export interface EnrichRequest {
    company_name: string;
    website?: string | null;
    country?: string | null;
}

export interface EnrichResult {
    company_name: string;
    website: string | null;
    website_alive: boolean;
    title: string | null;
    description: string | null;
    emails: string[];
    phones: string[];
    social_links: Record<string, string>;
    address: string | null;
    industry_keywords: string[];
    enrichment_score: number;
}

export interface DiscoverRequest {
    product: string;
    target_markets: string[];
    industry: string;
    count?: number;
}

export interface DiscoveredLead {
    company_name: string;
    website: string | null;
    website_alive: boolean;
    country: string;
    city: string | null;
    email: string | null;
    phone: string | null;
    description: string | null;
    products: string[];
    source_url: string | null;
    confidence: number;
}

export const scraper = {
    async enrichLead(req: EnrichRequest): Promise<EnrichResult> {
        const { data } = await client.post<EnrichResult>('/enrich-lead', req);
        return data;
    },

    async enrichBatch(leads: EnrichRequest[]): Promise<EnrichResult[]> {
        const { data } = await client.post<EnrichResult[]>('/enrich-batch', { leads });
        return data;
    },

    async discover(req: DiscoverRequest): Promise<DiscoveredLead[]> {
        const { data } = await client.post<DiscoveredLead[]>('/discover', req);
        return data;
    },

    async isHealthy(): Promise<boolean> {
        try {
            const { data } = await client.get('/health', { timeout: 5_000 });
            return data?.status === 'ok';
        } catch {
            return false;
        }
    },
};
