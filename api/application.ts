import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        const {
            name,
            email,
            company,
            phone,
            country,
            industry,
            applicationType, // 'partner', 'export', 'distribution'
            message,
            page
        } = req.body;

        // Validate required fields
        if (!name || !email || !company) {
            return res.status(400).json({ error: 'Name, email and company are required' });
        }

        const submission = {
            id: Date.now(),
            type: 'application',
            applicationType: applicationType || 'general',
            name,
            email,
            company,
            phone,
            country,
            industry,
            message,
            page: page || 'Unknown',
            createdAt: new Date().toISOString(),
        };

        // Determine recipient based on application type
        const recipients: Record<string, string> = {
            'partner': 'partnerships@loxtr.com',
            'export': 'export@loxtr.com',
            'distribution': 'dealers@loxtr.com',
            'market-entry': 'entry@loxtr.com',
        };
        const toEmail = recipients[applicationType] || 'info@loxtr.com';

        // Send email
        const { error } = await resend.emails.send({
            from: 'LOXTR Applications <noreply@loxtr.com>',
            to: ['info@loxtr.com', toEmail].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
            subject: `[${applicationType?.toUpperCase() || 'APPLICATION'} - ${page || 'Website'}] New application from ${company}`,
            html: `
        <h2>New Application Submission</h2>
        <p><strong>Application Type:</strong> ${applicationType || 'General'}</p>
        <p><strong>Page:</strong> ${page || 'Unknown'}</p>
        <hr/>
        <h3>Contact Information</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Country:</strong> ${country || 'Not provided'}</p>
        <p><strong>Industry:</strong> ${industry || 'Not provided'}</p>
        <hr/>
        <p><strong>Additional Message:</strong></p>
        <p>${message || 'No additional message'}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">Submitted at: ${submission.createdAt}</p>
      `,
        });

        if (error) {
            console.error('Email error:', error);
            return res.status(200).json({
                success: true,
                message: 'Application submitted but email notification failed',
                id: submission.id
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Application submitted successfully',
            id: submission.id
        });

    } catch (error) {
        console.error('Application form error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
