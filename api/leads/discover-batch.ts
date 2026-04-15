import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_utils/supabase';
import { gemini } from '../_utils/gemini';
import { scraper } from '../_utils/scraper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { product, targetMarkets, industry, count = 10 } = req.body;

        if (!product || !targetMarkets || !industry) {
            return res.status(400).json({ error: 'Missing required discovery parameters' });
        }

        const prompt = `You are a Global Lead Generation Expert. Find ${count} real companies that would buy "${product}".
        Target Markets: ${targetMarkets.join(', ')}
        Industry: ${industry}
        Return ONLY a JSON array with: {companyName, country, website, email, logic, aiScore}.`;

        const aiResponse = await gemini.generateText(prompt);
        const leads = gemini.extractJSON(aiResponse);

        if (!leads) throw new Error('Failed to parse AI response');

        // Enrich leads with Scrapling scraper service
        const scraperAvailable = await scraper.isHealthy();

        if (scraperAvailable) {
            const enrichRequests = leads.map((lead: any) => ({
                company_name: lead.companyName,
                website: lead.website || null,
                country: lead.country || null,
            }));

            try {
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
                    data: enrichedLeads,
                    enriched: true,
                });
            } catch (enrichError: any) {
                console.error('Enrichment failed, returning raw leads:', enrichError.message);
                return res.status(200).json({
                    success: true,
                    data: leads,
                    enriched: false,
                });
            }
        }

        return res.status(200).json({ success: true, data: leads, enriched: false });

    } catch (error: any) {
        console.error('Discovery Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
