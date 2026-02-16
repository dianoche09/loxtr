import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { companyName, industry, products, certificates, description } = req.body;

        const prompt = `You are a Global Branding Expert. 
        Company: ${companyName}
        Industry: ${industry}
        Products: ${products?.join(', ')}
        Certificates: ${certificates?.join(', ')}
        Bio: ${description}
        
        Task: Write a professional, punchy, 3-sentence company pitch for an international buyer.
        Focus on quality, reliability, and specific advantages.
        
        Return ONLY the text.`;

        const aiResponse = await gemini.generateText(prompt);

        return res.status(200).json({ success: true, data: aiResponse });

    } catch (error: any) {
        console.error('Value Prop Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
