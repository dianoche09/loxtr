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

        const safeCount = Math.min(count, 10);
        const prompt = `Find ${safeCount} REAL companies that buy "${product}" in ${targetMarkets.join(', ')} (${industry}).

Return ONLY a JSON array, no markdown:
[{"companyName":"Name","country":"Country","city":"City","website":"https://example.com","email":"info@example.com","logic":"Short reason (max 15 words)","aiScore":85}]

Rules: Real companies only. Keep logic field under 15 words. Score 70-98.`;

        let aiResponse: string;
        try {
            aiResponse = await gemini.generateText(prompt);
        } catch (aiError: any) {
            return res.status(500).json({
                error: 'Gemini API failed',
                message: aiError.message || 'Unknown AI error',
            });
        }

        if (!aiResponse || aiResponse.length < 10) {
            return res.status(500).json({
                error: 'Empty AI response',
                length: aiResponse?.length || 0,
            });
        }

        const parsed = gemini.extractJSON(aiResponse);

        // Handle both array and object-with-array responses
        let leads: any[];
        if (Array.isArray(parsed)) {
            leads = parsed;
        } else if (parsed && Array.isArray(parsed.leads)) {
            leads = parsed.leads;
        } else if (parsed && Array.isArray(parsed.companies)) {
            leads = parsed.companies;
        } else if (parsed && Array.isArray(parsed.results)) {
            leads = parsed.results;
        } else {
            return res.status(500).json({
                error: 'Failed to parse leads',
                rawPreview: aiResponse.substring(0, 500),
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
