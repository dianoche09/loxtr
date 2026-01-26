import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_utils/supabase';
import { gemini } from '../../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // In a real app, we'd get the user from the Supabase session token
        // For now, we'll assume the user is authenticated and we'd fetch their ID
        const { data: { user }, error: authError } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1] || '');

        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        const [leadsCount, activeCampaigns, recentLeads, profile] = await Promise.all([
            supabase.from('leads').select('*', { count: 'exact', head: true }),
            supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
            supabase.from('users').select('*').eq('id', user.id).single()
        ]);

        const totalLeads = leadsCount.count || 0;

        // Generate AI Briefing
        const prompt = `You are LOXTR Export AI. Generate a 1-sentence briefing for ${profile.data?.name || 'Hunter'}.
        Stats: ${totalLeads} total leads, ${activeCampaigns.count || 0} active campaigns. 
        Focus on motivation. Return ONLY text.`;

        const aiMessage = await gemini.generateText(prompt);

        return res.status(200).json({
            success: true,
            data: {
                briefing: {
                    greeting: `Welcome back, ${profile.data?.name?.split(' ')[0] || 'Hunter'} 👋`,
                    summary: aiMessage,
                },
                stats: {
                    overview: {
                        totalLeads,
                        totalCampaigns: activeCampaigns.count || 0,
                    }
                },
                user: profile.data
            }
        });

    } catch (error: any) {
        console.error('Dashboard Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
