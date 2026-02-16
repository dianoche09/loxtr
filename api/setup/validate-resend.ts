import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { apiKey } = req.body;
        if (!apiKey) return res.status(400).json({ error: 'API key is required' });

        const resend = new Resend(apiKey);
        const { data, error } = await resend.apiKeys.list();

        if (error) throw error;

        return res.status(200).json({ success: true, message: 'Resend API Key is valid' });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: 'Invalid Resend API Key' });
    }
}
