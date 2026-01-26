import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { supabase } from './_utils/supabase';

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

        // Store in Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([
                {
                    name,
                    email,
                    company,
                    phone,
                    country,
                    industry,
                    application_type: applicationType || 'general',
                    message,
                    page: page || 'Unknown'
                }
            ]);

        if (dbError) console.error('Supabase Error:', dbError);

        const createdAt = new Date().toISOString();

        // Determine recipient based on application type
        const recipients: Record<string, string> = {
            'partner': 'info@loxtr.com',
            'export': 'info@loxtr.com',
            'distribution': 'info@loxtr.com',
            'market-entry': 'info@loxtr.com',
        };
        const toEmail = recipients[applicationType] || 'info@loxtr.com';

        // Send email
        let emailError = null;
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not set. Skipping email notification.');
            emailError = 'API Key missing';
        } else {
            try {
                const { error } = await resend.emails.send({
                    from: 'LOXTR Applications <noreply@loxtr.com>',
                    to: [toEmail],
                    subject: `[${applicationType?.toUpperCase() || 'APPLICATION'}] ${company}`,
                    html: `
                <div style="font-family: sans-serif; background-color: #f5f5f7; padding: 40px 20px;">
                    <table style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border-spacing: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <tr style="background-color: #0a1128;">
                            <td style="padding: 20px; text-align: center;">
                                <h1 style="color: #ffcc00; margin: 0; font-size: 24px; letter-spacing: 2px;">LOXTR</h1>
                                <p style="color: #ffffff; margin: 5px 0 0; font-size: 12px; opacity: 0.6; text-transform: uppercase;">${applicationType || 'General'} Application Received</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px;">
                                <h2 style="color: #0a1128; margin-bottom: 20px; font-size: 18px; border-bottom: 2px solid #ffcc00; padding-bottom: 10px;">Contact Information</h2>
                                
                                <table style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Name:</strong></td>
                                        <td style="padding: 8px 0; color: #0a1128;">${name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                                        <td style="padding: 8px 0; color: #0a1128;"><a href="mailto:${email}" style="color: #007aff; text-decoration: none;">${email}</a></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Company:</strong></td>
                                        <td style="padding: 8px 0; color: #0a1128;">${company}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                                        <td style="padding: 8px 0; color: #0a1128;">${phone || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Country:</strong></td>
                                        <td style="padding: 8px 0; color: #0a1128;">${country || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Industry:</strong></td>
                                        <td style="padding: 8px 0; color: #0a1128;">${industry || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Source Page:</strong></td>
                                        <td style="padding: 8px 0; color: #0a1128;">${page || 'Unknown'}</td>
                                    </tr>
                                </table>

                                <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #ffcc00; border-radius: 4px;">
                                    <strong style="display: block; color: #666; font-size: 12px; margin-bottom: 10px; text-transform: uppercase;">Additional Details</strong>
                                    <p style="color: #0a1128; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message || 'No additional message.'}</p>
                                </div>
                            </td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 15px; text-align: center; color: #999; font-size: 11px;">
                                Submitted on: ${submission.createdAt}
                            </td>
                        </tr>
                    </table>
                </div>
              `,
                });
                if (error) emailError = error;
            } catch (err: any) {
                console.error('Resend Exception:', err);
                emailError = err.message || 'Resend exception';
            }
        }

        if (emailError) {
            console.error('Email notification failed:', emailError);
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
