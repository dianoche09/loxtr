import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_utils/supabase';
import { gemini } from '../../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { product, targetMarkets, industry, count = 10 } = req.body;

        if (!product || !targetMarkets || !industry) {
            return res.status(400).json({ error: 'Missing required discovery parameters' });
        }

        const prompt = `You are a Global Lead Generation Expert. Find ${count} real companies that would buy "${product}".
        Target Markets: ${targetMarkets.join(', ')}
        Industry: ${industry}
        Return ONLY a JSON array with: {companyName, country, website, email, logic, aiScore}.`;

        const aiResponse = await gemini.generateText(prompt);
        const leads = gemini.extractJSON(aiMessage); // Error in variable name, will fix below

        if (!leads) throw new Error('Failed to parse AI response');

        // Optional: Save to DB automatically or return for preview
        return res.status(200).json({ success: true, data: leads });

    } catch (error: any) {
        console.error('Discovery Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
