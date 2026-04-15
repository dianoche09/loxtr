import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';
import { scraper } from '../_utils/scraper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { product, targetMarkets, industry, count = 15 } = req.body;

        if (!product || !targetMarkets || !industry) {
            return res.status(400).json({ error: 'product, targetMarkets, and industry are required' });
        }

        const prompt = `You are a Global B2B Lead Generation Expert specializing in international trade.

Find ${count} REAL companies that would be potential buyers of "${product}".

Target Markets: ${targetMarkets.join(', ')}
Industry: ${industry}

Requirements:
- Companies must be REAL and currently active
- Include their actual website URL if known
- Include a realistic contact email pattern (e.g. info@company.com)
- Provide specific reasoning for why they would buy this product
- AI confidence score based on relevance (70-98 range, be honest)

Return ONLY a JSON array:
[{
  "companyName": "Real Company Name",
  "country": "Country",
  "city": "City if known",
  "website": "https://www.company.com",
  "email": "info@company.com",
  "logic": "Specific reason why this company needs this product",
  "aiScore": 85
}]`;

        const aiResponse = await gemini.generateText(prompt);
        const parsed = gemini.extractJSON(aiResponse);

        // Handle both array and object-with-array responses
        let leads: any[];
        if (Array.isArray(parsed)) {
            leads = parsed;
        } else if (parsed && Array.isArray(parsed.leads)) {
            leads = parsed.leads;
        } else if (parsed && Array.isArray(parsed.companies)) {
            leads = parsed.companies;
        } else {
            return res.status(500).json({
                error: 'Failed to generate leads',
                debug: parsed ? 'Unexpected format' : 'No JSON parsed',
            });
        }

        // Enrich with Scrapling only if service URL is explicitly configured
        if (process.env.SCRAPER_SERVICE_URL) {
            try {
                const scraperAvailable = await scraper.isHealthy();
                if (scraperAvailable) {
                    const enrichRequests = leads.map((lead: any) => ({
                        company_name: lead.companyName,
                        website: lead.website || null,
                        country: lead.country || null,
                    }));

                    const enriched = await scraper.enrichBatch(enrichRequests);

                    const enrichedLeads = leads.map((lead: any, i: number) => {
                        const enrichData = enriched[i];
                        if (!enrichData) return { ...lead, verified: false };

                        return {
                            ...lead,
                            verified: enrichData.website_alive,
                            website: enrichData.website || lead.website,
                            email: enrichData.emails?.[0] || lead.email,
                            phone: enrichData.phones?.[0] || null,
                            description: enrichData.description || null,
                            socialLinks: enrichData.social_links || {},
                            industryKeywords: enrichData.industry_keywords || [],
                            enrichmentScore: enrichData.enrichment_score || 0,
                            aiScore: Math.round(
                                (lead.aiScore || 85) * 0.6 + (enrichData.enrichment_score || 0) * 0.4
                            ),
                        };
                    });

                    return res.status(200).json({
                        success: true,
                        leads: enrichedLeads,
                        enriched: true,
                        total: enrichedLeads.length,
                    });
                }
            } catch (enrichError: any) {
                console.error('Enrichment failed, returning raw leads:', enrichError.message);
            }
        }

        return res.status(200).json({
            success: true,
            leads,
            enriched: false,
            total: leads.length,
        });

    } catch (error: any) {
        console.error('Discovery Run Error:', error);
        return res.status(500).json({
            error: 'Discovery failed',
            message: error.message || 'Unknown error',
        });
    }
}
