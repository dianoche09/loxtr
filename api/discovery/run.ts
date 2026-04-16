import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';
import { scraper } from '../_utils/scraper';
import { serp, type SerpSearchResult } from '../_utils/serp';
import { comtrade } from '../_utils/comtrade';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { product, targetMarkets, industry, count = 15, hsCode, preview = false } = req.body;

        if (!product || !targetMarkets || !industry) {
            return res.status(400).json({ error: 'product, targetMarkets, and industry are required' });
        }

        const safeCount = Math.min(count, 30);

        // ===== LAYER 1: REAL DATA COLLECTION (SerpAPI + Comtrade context) =====
        const [serpResults, tradeContext] = await Promise.all([
            serp.discoverCompanies({
                product,
                targetMarkets,
                industry,
                count: safeCount,
            }),
            hsCode
                ? comtrade.getMultiMarketOverview({ targetMarkets, hsCode })
                : Promise.resolve([]),
        ]);

        // Build trade context string for Gemini
        const tradeContextStr = tradeContext.length > 0
            ? tradeContext.map(t => {
                let ctx = `${t.reporter}: Total imports $${formatValue(t.totalImportValue)}.`;
                if (t.turkeyPosition) {
                    ctx += ` Turkey rank #${t.turkeyPosition.rank} (${t.turkeyPosition.share}%).`;
                }
                ctx += ` Top: ${t.topSuppliers.slice(0, 3).map(s => `${s.country} ${s.share}%`).join(', ')}.`;
                return ctx;
            }).join(' ')
            : '';

        // Build SerpAPI context for Gemini
        const serpContextStr = serpResults.length > 0
            ? serpResults.slice(0, 20).map(r => {
                let ctx = `- ${r.companyName}`;
                if (r.website) ctx += ` (${r.website})`;
                if (r.phone) ctx += ` phone:${r.phone}`;
                if (r.address) ctx += ` addr:${r.address}`;
                if (r.snippet) ctx += ` — ${r.snippet.substring(0, 100)}`;
                return ctx;
            }).join('\n')
            : '';

        // ===== LAYER 2: AI ANALYSIS (Gemini with real context) =====
        const prompt = buildDiscoveryPrompt({
            product,
            targetMarkets,
            industry,
            count: safeCount,
            tradeContext: tradeContextStr,
            serpContext: serpContextStr,
        });

        let aiResponse: string;
        try {
            aiResponse = await gemini.generateText(prompt);
        } catch (aiError: any) {
            return res.status(500).json({
                error: 'AI analysis failed',
                message: aiError.message || 'Unknown AI error',
            });
        }

        if (!aiResponse || aiResponse.length < 10) {
            return res.status(500).json({ error: 'Empty AI response', length: aiResponse?.length || 0 });
        }

        const parsed = gemini.extractJSON(aiResponse);
        let leads: any[] = extractLeadsArray(parsed);

        if (!leads || leads.length === 0) {
            return res.status(500).json({
                error: 'Failed to parse leads',
                rawPreview: aiResponse.substring(0, 500),
            });
        }

        // Merge SerpAPI data into AI leads (match by company name or domain)
        leads = mergeWithSerpData(leads, serpResults);

        // ===== LAYER 3: ENRICHMENT (Scrapling — if available) =====
        if (!preview && process.env.SCRAPER_SERVICE_URL) {
            try {
                const scraperAvailable = await scraper.isHealthy();
                if (scraperAvailable) {
                    const enrichRequests = leads.map((lead: any) => ({
                        company_name: lead.companyName,
                        website: lead.website || null,
                        country: lead.country || null,
                    }));

                    const enriched = await scraper.enrichBatch(enrichRequests);

                    leads = leads.map((lead: any, i: number) => {
                        const enrichData = enriched[i];
                        if (!enrichData) return { ...lead, verified: false };

                        return {
                            ...lead,
                            verified: enrichData.website_alive,
                            website: enrichData.website || lead.website,
                            email: enrichData.emails?.[0] || lead.email,
                            emailSource: enrichData.emails?.[0] ? 'scraped' : lead.emailSource,
                            phone: enrichData.phones?.[0] || lead.phone || null,
                            description: enrichData.description || lead.description || null,
                            socialLinks: enrichData.social_links || lead.socialLinks || {},
                            industryKeywords: enrichData.industry_keywords || [],
                            enrichmentScore: enrichData.enrichment_score || 0,
                            aiScore: Math.round(
                                (lead.aiScore || 85) * 0.6 + (enrichData.enrichment_score || 0) * 0.4
                            ),
                        };
                    });

                    return res.status(200).json({
                        success: true,
                        data: {
                            leads,
                            enriched: true,
                            serpUsed: serpResults.length > 0,
                            tradeDataUsed: tradeContext.length > 0,
                            total: leads.length,
                            preview,
                        },
                    });
                }
            } catch (enrichError: any) {
                console.error('Enrichment failed, returning AI+Serp leads:', enrichError.message);
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                leads,
                enriched: false,
                serpUsed: serpResults.length > 0,
                tradeDataUsed: tradeContext.length > 0,
                total: leads.length,
                preview,
            },
        });

    } catch (error: any) {
        console.error('Discovery Run Error:', error);
        return res.status(500).json({
            error: 'Discovery failed',
            message: error.message || 'Unknown error',
        });
    }
}

function buildDiscoveryPrompt(params: {
    product: string;
    targetMarkets: string[];
    industry: string;
    count: number;
    tradeContext: string;
    serpContext: string;
}): string {
    let prompt = `You are a Global B2B Lead Discovery Expert. Find ${params.count} REAL companies that buy "${params.product}" in ${params.targetMarkets.join(', ')} (${params.industry}).`;

    // Add real trade data context
    if (params.tradeContext) {
        prompt += `\n\nREAL TRADE DATA (UN Comtrade):\n${params.tradeContext}\nUse this data to inform your analysis — prioritize markets with high import volume and low Turkey share (growth opportunity).`;
    }

    // Add SerpAPI search results context
    if (params.serpContext) {
        prompt += `\n\nCOMPANIES FOUND VIA WEB SEARCH (Google/Maps):\n${params.serpContext}\nPrioritize these REAL companies found on the web. Verify and expand on them. Add additional companies you know are real.`;
    }

    prompt += `\n\nReturn ONLY a JSON array, no markdown:
[{
  "companyName": "Real Company Name",
  "country": "Country",
  "city": "City",
  "website": "https://realcompany.com",
  "email": "info@realcompany.com",
  "emailSource": "website|predicted",
  "phone": "+49123456789",
  "logic": "Short reason why they match (max 20 words)",
  "aiScore": 85,
  "potentialProducts": ["Product they might also buy from us"],
  "supplyChainIntel": {
    "currentSupplier": "Main current supplier country",
    "switchReason": "Why they might switch to Turkish supplier",
    "competitiveAdvantage": "Our key advantage"
  }
}]

CRITICAL RULES:
- REAL companies only. If you found them in the web search data above, use their real details.
- emailSource: "website" if you found the email on their website, "predicted" if you generated a pattern like info@domain.com
- potentialProducts: 1-3 products they might ALSO buy (cross-sell opportunity)
- supplyChainIntel: brief competitive intelligence for each lead
- aiScore: 70-98, higher if company was found in web search data
- STRICTLY FORBIDDEN: prices, discounts, financial terms
- All text in English
- No markdown, only JSON array`;

    return prompt;
}

function extractLeadsArray(parsed: any): any[] {
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.leads)) return parsed.leads;
    if (parsed && Array.isArray(parsed.companies)) return parsed.companies;
    if (parsed && Array.isArray(parsed.results)) return parsed.results;
    return [];
}

function mergeWithSerpData(leads: any[], serpResults: SerpSearchResult[]): any[] {
    return leads.map(lead => {
        // Try to find matching SerpAPI result by domain or company name
        const domain = extractDomain(lead.website || '');
        const match = serpResults.find(s => {
            const sDomain = extractDomain(s.website || '');
            if (domain && sDomain && domain === sDomain) return true;
            if (s.companyName && lead.companyName) {
                return s.companyName.toLowerCase().includes(lead.companyName.toLowerCase().substring(0, 10))
                    || lead.companyName.toLowerCase().includes(s.companyName.toLowerCase().substring(0, 10));
            }
            return false;
        });

        if (match) {
            return {
                ...lead,
                phone: match.phone || lead.phone,
                address: match.address || lead.address,
                website: match.website || lead.website,
                serpVerified: true,
                serpSource: match.type,
                rating: match.rating,
                reviews: match.reviews,
                aiScore: Math.min((lead.aiScore || 85) + 5, 98), // Boost score for SerpAPI-verified companies
            };
        }

        return { ...lead, serpVerified: false };
    });
}

function extractDomain(url: string): string {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

function formatValue(value: number): string {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
}
