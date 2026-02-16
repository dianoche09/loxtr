import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { products, targetCountries } = req.body;

        const productDetails = products?.map((p: any) => `${p.name} (HS: ${p.hsCode})`).join(', ') || 'General Products';
        const countries = targetCountries?.join(', ') || 'Global';

        const prompt = `You are a B2B Sales Expert. 
        Exporting: ${productDetails}
        Target Markets: ${countries}
        
        Task: Define the Ideal Customer Profile (ICP).
        Suggest 3 target industries and 3 decision-maker job titles.
        
        Return ONLY JSON: 
        { 
          "targetIndustries": [{"name": "Industry Name", "selected": true}],
          "decisionMakers": [{"title": "Job Title", "selected": true}]
        }`;

        const aiResponse = await gemini.generateText(prompt);
        const data = gemini.extractJSON(aiResponse);

        return res.status(200).json({ success: true, data });

    } catch (error: any) {
        console.error('ICP AI Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
