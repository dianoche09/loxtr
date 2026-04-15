import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_utils/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { leads } = req.body;

        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ error: 'leads array is required' });
        }

        // Extract user from auth header
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const leadsToInsert = leads.map((lead: any) => ({
            user_id: user.id,
            company_name: lead.companyName || lead.company_name,
            contact_name: lead.contactName || lead.contact_name || null,
            email: lead.email || null,
            phone: lead.phone || null,
            website: lead.website || null,
            country: lead.country || null,
            city: lead.city || null,
            industry: lead.industry || null,
            source: 'radar',
            ai_score: lead.aiScore || lead.ai_score || 0,
            status: 'new',
            notes: lead.logic || lead.reason || null,
            metadata: {
                verified: lead.verified || false,
                enrichment_score: lead.enrichmentScore || 0,
                social_links: lead.socialLinks || {},
                industry_keywords: lead.industryKeywords || [],
                description: lead.description || null,
                discovered_at: new Date().toISOString(),
            },
        }));

        const { data, error } = await supabase
            .from('leads')
            .insert(leadsToInsert)
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Failed to save leads' });
        }

        // Update user subscription usage
        const { data: userData } = await supabase
            .from('users')
            .select('subscription')
            .eq('id', user.id)
            .single();

        if (userData?.subscription) {
            const subscription = userData.subscription;
            const currentUsage = subscription.usage?.leadsUnlockedThisMonth || 0;
            subscription.usage = {
                ...subscription.usage,
                leadsUnlockedThisMonth: currentUsage + leadsToInsert.length,
            };

            await supabase
                .from('users')
                .update({ subscription })
                .eq('id', user.id);
        }

        return res.status(200).json({
            success: true,
            data,
            count: data?.length || 0,
        });

    } catch (error: any) {
        console.error('Batch Create Error:', error);
        return res.status(500).json({ error: 'Failed to create leads' });
    }
}
