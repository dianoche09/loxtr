import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { products, originCountry = 'Turkey' } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ error: 'Products are required' });
        }

        const productDetails = products.map((p: any) => `${p.name} (HS: ${p.hsCode})`).join(', ');

        const prompt = `You are a Global Trade Strategist. 
        User is based in: ${originCountry}
        Exporting: ${productDetails}
        
        Task: Identify the TOP 3 highest potential export markets (countries).
        For each country, provide:
        - country: Full country name
        - score: Match score (0-100)
        - reasoning: 1-sentence why this is a good market considering the origin country's trade agreements and logistics.
        - breakdown: { tradeVolume: number (Score 1-10), competitionLevel: "Low"|"Medium"|"High", logisticsEase: "Easy"|"Medium"|"Hard" }
        - selected: true (for the top one) or false
        
        Return ONLY a JSON object: { recommendations: [...] }`;

        const aiResponse = await gemini.generateText(prompt);
        const data = gemini.extractJSON(aiResponse);

        return res.status(200).json({ success: true, data });

    } catch (error: any) {
        console.error('Strategy AI Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
