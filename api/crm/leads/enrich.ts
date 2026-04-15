import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_utils/supabase';
import { scraper } from '../../_utils/scraper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { leadId, companyName, website, country } = req.body;

        if (!companyName) {
            return res.status(400).json({ error: 'companyName is required' });
        }

        const scraperAvailable = await scraper.isHealthy();
        if (!scraperAvailable) {
            return res.status(503).json({ error: 'Scraper service unavailable' });
        }

        const enriched = await scraper.enrichLead({
            company_name: companyName,
            website: website || null,
            country: country || null,
        });

        // Update lead in database if leadId provided
        if (leadId) {
            const updateData: Record<string, any> = {
                updated_at: new Date().toISOString(),
            };

            if (enriched.website_alive && enriched.website) {
                updateData.website = enriched.website;
            }
            if (enriched.emails?.[0]) {
                updateData.email = enriched.emails[0];
            }
            if (enriched.phones?.[0]) {
                updateData.phone = enriched.phones[0];
            }
            if (enriched.description || enriched.social_links || enriched.industry_keywords?.length) {
                updateData.metadata = {
                    enriched: true,
                    enriched_at: new Date().toISOString(),
                    enrichment_score: enriched.enrichment_score,
                    description: enriched.description,
                    social_links: enriched.social_links,
                    industry_keywords: enriched.industry_keywords,
                    website_title: enriched.title,
                    all_emails: enriched.emails,
                    all_phones: enriched.phones,
                };
            }

            await supabase.from('leads').update(updateData).eq('id', leadId);
        }

        return res.status(200).json({
            success: true,
            data: enriched,
        });

    } catch (error: any) {
        console.error('Enrich Error:', error);
        return res.status(500).json({ error: 'Enrichment failed' });
    }
}
