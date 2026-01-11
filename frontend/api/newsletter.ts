import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple subscriber list (for production use Vercel KV or database)
const subscribers: Set<string> = new Set();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, page } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Check if already subscribed (basic check)
        if (subscribers.has(email)) {
            return res.status(200).json({
                success: true,
                message: 'Already subscribed'
            });
        }

        subscribers.add(email);

        // Send notification email
        const { error } = await resend.emails.send({
            from: 'LOXTR Newsletter <noreply@loxtr.com>',
            to: ['info@loxtr.com'],
            subject: `[Newsletter - ${page || 'Website'}] New subscriber: ${email}`,
            html: `
        <h2>New Newsletter Subscription</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Page:</strong> ${page || 'Unknown'}</p>
        <p><strong>Subscribed at:</strong> ${new Date().toISOString()}</p>
      `,
        });

        if (error) {
            console.error('Email error:', error);
        }

        return res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter'
        });

    } catch (error) {
        console.error('Newsletter error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
