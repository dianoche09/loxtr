import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend
dotenv.config({ path: '../backend/.env' });

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey || apiKey === 're_123456789') {
    console.error('❌ RESEND_API_KEY is missing or set to a placeholder (re_123456789).');
    process.exit(1);
}

const resend = new Resend(apiKey);

async function testEmail() {
    console.log('--- Testing Resend API ---');
    console.log('API Key:', apiKey.substring(0, 5) + '...');

    try {
        const { data, error } = await resend.emails.send({
            from: 'LOXTR Test <onboarding@resend.dev>',
            to: ['gurkankuzu@yahoo.com'],
            subject: 'Test Email - Resend Integration',
            html: '<p>This is a test email to verify Resend integration on LOXTR.</p>'
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
        } else {
            console.log('✅ Email sent successfully!');
            console.log('Response:', data);
        }
    } catch (err) {
        console.error('❌ Failed to connect to Resend:', err);
    }
}

testEmail();
