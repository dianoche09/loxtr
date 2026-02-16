import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const query = req.query.q as string;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Normally we search a DB, but for demo we use AI to find matches
        const prompt = `Find 3 HS Code matches for "${query}". 
        Return ONLY JSON array: [{code: "HSCODE", description: "Standard Description"}]`;

        const aiResponse = await gemini.generateText(prompt);
        const data = gemini.extractJSON(aiResponse);

        return res.status(200).json({ success: true, data });

    } catch (error: any) {
        console.error('HS Code Search Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
