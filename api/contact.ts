import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory store (will reset on cold start - for production use Vercel KV)
const submissions: any[] = [];

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
        const { name, email, company, phone, message, page } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email and message are required' });
        }

        // Store submission
        const submission = {
            id: Date.now(),
            type: 'contact',
            name,
            email,
            company,
            phone,
            message,
            page: page || 'Unknown',
            createdAt: new Date().toISOString(),
        };
        submissions.push(submission);

        // Send email
        const { data, error } = await resend.emails.send({
            from: 'LOXTR Contact <noreply@loxtr.com>',
            to: ['gurkankuzu@yahoo.com'],
            subject: `[Contact Form - ${page || 'Website'}] New message from ${name}`,
            html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Page:</strong> ${page || 'Unknown'}</p>
        <hr/>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">Submitted at: ${submission.createdAt}</p>
      `,
        });

        if (error) {
            console.error('Email error:', error);
            // Still return success - form data is stored
            return res.status(200).json({
                success: true,
                message: 'Form submitted but email notification failed',
                id: submission.id
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Form submitted successfully',
            id: submission.id
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
