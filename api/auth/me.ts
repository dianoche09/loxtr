import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_utils/supabase';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const action = req.query.action as string;

    // Dashboard summary (routed via rewrite)
    if (action === 'dashboard-summary') {
        return handleDashboardSummary(req, res);
    }

    if (req.method !== 'PUT' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '').trim();

        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const { data: authData, error: authError } = await supabase.auth.getUser(token);

        if (authError || !authData?.user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const user = authData.user;

        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ success: true, data: { user: data } });
        }

        if (req.method === 'PUT') {
            const updateData = { ...req.body };

            if (updateData.onboardingCompleted !== undefined) {
                updateData.onboarding_completed = updateData.onboardingCompleted;
                delete updateData.onboardingCompleted;
            }

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ success: true, data });
        }

    } catch (error: any) {
        console.error('Auth/Me Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

async function handleDashboardSummary(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            req.headers.authorization?.split(' ')[1] || ''
        );
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        const [leadsCount, activeCampaigns, profile] = await Promise.all([
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('users').select('*').eq('id', user.id).single(),
        ]);

        const totalLeads = leadsCount.count || 0;
        const userProfile = profile.data;
        const products = userProfile?.product_groups || [];
        const markets = userProfile?.strategy?.targetMarkets || [];

        let aiData = null;
        try {
            const prompt = `You are LOXTR Export AI. User: ${userProfile?.name || 'Hunter'}, Company: ${userProfile?.company || 'Exporter'}, Products: ${products.map((p: any) => p.name || p).join(', ') || 'not set'}, Markets: ${markets.join(', ') || 'not set'}, Stats: ${totalLeads} leads, ${activeCampaigns.count || 0} campaigns. Task: Return JSON: {"summary":"1 sentence briefing","opportunities":[{"title":"...","description":"...","type":"hot"}]}`;
            const aiResponse = await gemini.generateText(prompt);
            aiData = gemini.extractJSON(aiResponse);
        } catch {
            aiData = null;
        }

        return res.status(200).json({
            success: true,
            data: {
                briefing: {
                    greeting: `Welcome back, ${userProfile?.name?.split(' ')[0] || 'Hunter'}`,
                    summary: aiData?.summary || `Radar active. Monitoring ${products.length} products across ${markets.length} markets.`,
                },
                opportunities: aiData?.opportunities || [],
                stats: {
                    overview: {
                        totalLeads,
                        totalCampaigns: activeCampaigns.count || 0,
                    },
                },
                user: userProfile,
            },
        });
    } catch (error: any) {
        console.error('Dashboard Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
