import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_utils/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Auth check
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // Route by action query param (for rewrites) or method
    const action = req.query.action as string;

    if (action === 'batch' && req.method === 'POST') {
        return handleBatchCreate(req, res, user);
    }
    if (action === 'stats') {
        return handleStats(req, res, user);
    }

    if (req.method === 'GET') {
        return handleList(req, res, user);
    }
    if (req.method === 'POST') {
        return handleCreate(req, res, user);
    }
    if (req.method === 'PUT') {
        return handleUpdate(req, res, user);
    }
    if (req.method === 'DELETE') {
        return handleDelete(req, res, user);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleList(req: VercelRequest, res: VercelResponse, user: any) {
    try {
        const { page = '1', limit = '20', status, search, country, industry, min_score, sort } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        let query = supabase
            .from('leads')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limitNum - 1);

        if (status && status !== 'all') query = query.eq('status', status);
        if (country && country !== 'all') query = query.eq('country', country);
        if (industry && industry !== 'all') query = query.ilike('industry', `%${industry}%`);
        if (min_score) query = query.gte('ai_score', parseInt(min_score as string));
        if (search) query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%`);

        const { data, error, count } = await query;

        if (error) {
            console.error('Leads list error:', error);
            return res.status(500).json({ error: 'Failed to fetch leads' });
        }

        // Map snake_case to camelCase for frontend
        const leads = (data || []).map((l: any) => ({
            id: l.id,
            companyName: l.company_name,
            contactName: l.contact_name,
            email: l.email,
            phone: l.phone,
            website: l.website,
            country: l.country,
            city: l.city,
            industry: l.industry,
            source: l.source,
            aiScore: l.ai_score,
            status: l.status,
            notes: l.notes,
            metadata: l.metadata,
            createdAt: l.created_at,
            updatedAt: l.updated_at,
        }));

        return res.status(200).json({
            success: true,
            data: leads,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limitNum),
            },
        });
    } catch (error: any) {
        console.error('Leads list error:', error);
        return res.status(500).json({ error: 'Failed to fetch leads' });
    }
}

async function handleCreate(req: VercelRequest, res: VercelResponse, user: any) {
    try {
        const body = req.body;
        const { data, error } = await supabase
            .from('leads')
            .insert({
                user_id: user.id,
                company_name: body.companyName || body.company_name,
                contact_name: body.contactName || body.contact_name || null,
                email: body.email || null,
                phone: body.phone || null,
                website: body.website || null,
                country: body.country || null,
                city: body.city || null,
                industry: body.industry || null,
                source: body.source || 'manual',
                ai_score: body.aiScore || body.ai_score || 0,
                status: body.status || 'new',
                notes: body.notes || null,
                metadata: body.metadata || {},
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: 'Failed to create lead' });

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to create lead' });
    }
}

async function handleUpdate(req: VercelRequest, res: VercelResponse, user: any) {
    try {
        const id = req.query.id as string;
        if (!id) return res.status(400).json({ error: 'Lead ID required' });

        const body = req.body;
        const updateData: any = { updated_at: new Date().toISOString() };

        if (body.companyName || body.company_name) updateData.company_name = body.companyName || body.company_name;
        if (body.email) updateData.email = body.email;
        if (body.phone) updateData.phone = body.phone;
        if (body.website) updateData.website = body.website;
        if (body.country) updateData.country = body.country;
        if (body.status) updateData.status = body.status;
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.metadata) updateData.metadata = body.metadata;

        const { data, error } = await supabase
            .from('leads')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: 'Failed to update lead' });

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to update lead' });
    }
}

async function handleDelete(req: VercelRequest, res: VercelResponse, user: any) {
    try {
        const id = req.query.id as string;
        if (!id) return res.status(400).json({ error: 'Lead ID required' });

        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) return res.status(500).json({ error: 'Failed to delete lead' });

        return res.status(200).json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to delete lead' });
    }
}

async function handleBatchCreate(req: VercelRequest, res: VercelResponse, user: any) {
    try {
        const { leads } = req.body;

        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ error: 'leads array is required' });
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

async function handleStats(req: VercelRequest, res: VercelResponse, user: any) {
    try {
        const { data: leads, error } = await supabase
            .from('leads')
            .select('status, ai_score, country')
            .eq('user_id', user.id);

        if (error) return res.status(500).json({ error: 'Failed to fetch stats' });

        const total = leads?.length || 0;
        const byStatus: Record<string, number> = {};
        const byCountry: Record<string, number> = {};
        let totalScore = 0;

        (leads || []).forEach((l: any) => {
            byStatus[l.status] = (byStatus[l.status] || 0) + 1;
            byCountry[l.country] = (byCountry[l.country] || 0) + 1;
            totalScore += l.ai_score || 0;
        });

        return res.status(200).json({
            success: true,
            data: {
                total,
                byStatus,
                byCountry,
                averageScore: total > 0 ? Math.round(totalScore / total) : 0,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
    }
}
