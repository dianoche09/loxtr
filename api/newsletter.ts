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
        const { email, page } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Store in Supabase
        const { error: dbError } = await supabase
            .from('newsletter_subscriptions')
            .insert([{ email, page: page || 'Unknown' }]);

        if (dbError && dbError.code !== '23505') { // Ignore unique constraint error
            console.error('Supabase Error:', dbError);
        }

        // Send notification email
        let emailError = null;
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not set. Skipping email notification.');
            emailError = 'API Key missing';
        } else {
            try {
                const { error } = await resend.emails.send({
                    from: 'LOXTR Newsletter <noreply@loxtr.com>',
                    to: ['info@loxtr.com'],
                    subject: `[Newsletter] New subscriber: ${email}`,
                    html: `
                <div style="font-family: sans-serif; background-color: #f5f5f7; padding: 40px 20px;">
                    <table style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border-spacing: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <tr style="background-color: #0a1128;">
                            <td style="padding: 20px; text-align: center;">
                                <h1 style="color: #ffcc00; margin: 0; font-size: 24px; letter-spacing: 2px;">LOXTR</h1>
                                <p style="color: #ffffff; margin: 5px 0 0; font-size: 12px; opacity: 0.6; text-transform: uppercase;">Newsletter Subscription</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px;">
                                <h2 style="color: #0a1128; margin-bottom: 20px; font-size: 18px; border-bottom: 2px solid #ffcc00; padding-bottom: 10px;">New Subscriber Details</h2>
                                
                                <table style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px 0; color: #666; width: 140px;"><strong>Email:</strong></td>
                                        <td style="padding: 10px 0; color: #0a1128;"><a href="mailto:${email}" style="color: #007aff; text-decoration: none;">${email}</a></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; color: #666;"><strong>Source Page:</strong></td>
                                        <td style="padding: 10px 0; color: #0a1128;">${page || 'Unknown'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; color: #666;"><strong>Timestamp:</strong></td>
                                        <td style="padding: 10px 0; color: #0a1128;">${new Date().toISOString()}</td>
                                    </tr>
                                </table>

                                <div style="margin-top: 30px; text-align: center;">
                                    <p style="color: #666; font-size: 14px;">This email has been added to your subscriber list.</p>
                                </div>
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
