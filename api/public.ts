import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { supabase } from './_utils/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action as string;

    // Vercel cron keepalive
    if (req.method === 'GET' && req.query.keepalive === 'true') {
        try {
            await supabase.from('users').select('id').limit(1);
            return res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
        } catch {
            return res.status(200).json({ status: 'ping-sent' });
        }
    }

    // Admin GET endpoints
    if (req.method === 'GET') {
        if (action === 'admin-stats') return handleAdminStats(req, res);
        if (action === 'admin-submissions') return handleAdminSubmissions(req, res);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (action === 'contact') return handleContact(req, res);
    if (action === 'newsletter') return handleNewsletter(req, res);
    if (action === 'application') return handleApplication(req, res);

    return res.status(400).json({ error: `Unknown action: ${action}` });
}

async function sendNotification(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) return 'API Key missing';
    try {
        const { error } = await resend.emails.send({
            from: 'LOXTR <noreply@loxtr.com>',
            to: [to],
            subject,
            html,
        });
        return error || null;
    } catch (err: any) {
        console.error('Resend error:', err);
        return err.message;
    }
}

async function handleContact(req: VercelRequest, res: VercelResponse) {
    try {
        const { name, email, company, phone, message, page } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email and message are required' });
        }

        const { data: submission } = await supabase
            .from('contact_submissions')
            .insert([{ name, email, company, phone, message, page: page || 'Unknown' }])
            .select()
            .single();

        await sendNotification(
            'info@loxtr.com',
            `[Contact - ${page || 'Website'}] ${name}`,
            `<div style="font-family:sans-serif;padding:20px"><h2>Contact: ${name}</h2><p><b>Email:</b> ${email}</p><p><b>Company:</b> ${company || '-'}</p><p><b>Phone:</b> ${phone || '-'}</p><p><b>Message:</b></p><p>${message}</p></div>`
        );

        return res.status(200).json({ success: true, id: submission?.id });
    } catch (error: any) {
        console.error('Contact error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleNewsletter(req: VercelRequest, res: VercelResponse) {
    try {
        const { email, page } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        const { error: dbError } = await supabase
            .from('newsletter_subscriptions')
            .insert([{ email, page: page || 'Unknown' }]);

        if (dbError && dbError.code !== '23505') console.error('DB Error:', dbError);

        await sendNotification(
            'info@loxtr.com',
            `[Newsletter] New subscriber: ${email}`,
            `<p>New newsletter subscriber: <b>${email}</b> from ${page || 'Unknown'}</p>`
        );

        return res.status(200).json({ success: true, message: 'Subscribed' });
    } catch (error: any) {
        console.error('Newsletter error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleApplication(req: VercelRequest, res: VercelResponse) {
    try {
        const { name, email, company, phone, country, industry, applicationType, message, page } = req.body;
        if (!name || !email || !company) {
            return res.status(400).json({ error: 'Name, email and company are required' });
        }

        await supabase.from('applications').insert([{
            name, email, company, phone, country, industry,
            application_type: applicationType || 'general',
            message, page: page || 'Unknown',
        }]);

        await sendNotification(
            'info@loxtr.com',
            `[${(applicationType || 'APPLICATION').toUpperCase()}] ${company}`,
            `<div style="font-family:sans-serif;padding:20px"><h2>${applicationType || 'Application'}: ${company}</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone || '-'}</p><p><b>Country:</b> ${country || '-'}</p><p><b>Industry:</b> ${industry || '-'}</p><p><b>Message:</b> ${message || '-'}</p></div>`
        );

        return res.status(200).json({ success: true, message: 'Application submitted' });
    } catch (error: any) {
        console.error('Application error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleAdminStats(_req: VercelRequest, res: VercelResponse) {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

        const [contacts, newsletters, applications, users,
               contactsPrev, newslettersPrev, applicationsPrev, usersPrev] = await Promise.all([
            supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
            supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
            supabase.from('applications').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
            supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
            supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo),
            supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo),
            supabase.from('applications').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo),
            supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo),
        ]);

        // Total counts (all time)
        const [contactsTotal, newslettersTotal, applicationsTotal, usersTotal] = await Promise.all([
            supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
            supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }),
            supabase.from('applications').select('id', { count: 'exact', head: true }),
            supabase.from('users').select('id', { count: 'exact', head: true }),
        ]);

        const calcChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return res.status(200).json({
            contacts: {
                total: contactsTotal.count || 0,
                last30: contacts.count || 0,
                change: calcChange(contacts.count || 0, contactsPrev.count || 0),
            },
            newsletters: {
                total: newslettersTotal.count || 0,
                last30: newsletters.count || 0,
                change: calcChange(newsletters.count || 0, newslettersPrev.count || 0),
            },
            applications: {
                total: applicationsTotal.count || 0,
                last30: applications.count || 0,
                change: calcChange(applications.count || 0, applicationsPrev.count || 0),
            },
            users: {
                total: usersTotal.count || 0,
                last30: users.count || 0,
                change: calcChange(users.count || 0, usersPrev.count || 0),
            },
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return res.status(500).json({ error: 'Failed to fetch stats' });
    }
}

async function handleAdminSubmissions(req: VercelRequest, res: VercelResponse) {
    try {
        const type = (req.query.type as string) || 'contact';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        let tableName: string;
        let selectFields: string;

        switch (type) {
            case 'newsletter':
                tableName = 'newsletter_subscriptions';
                selectFields = 'id, email, page, created_at';
                break;
            case 'application':
                tableName = 'applications';
                selectFields = 'id, name, email, company, phone, country, industry, application_type, message, page, created_at';
                break;
            default:
                tableName = 'contact_submissions';
                selectFields = 'id, name, email, company, phone, message, page, created_at';
        }

        const { data, count, error } = await supabase
            .from(tableName)
            .select(selectFields, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Submissions query error:', error);
            return res.status(500).json({ error: 'Failed to fetch submissions' });
        }

        return res.status(200).json({
            data: data || [],
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit),
        });
    } catch (error: any) {
        console.error('Admin submissions error:', error);
        return res.status(500).json({ error: 'Failed to fetch submissions' });
    }
}
