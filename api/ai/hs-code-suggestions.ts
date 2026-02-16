import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { product } = req.body;

        if (!product) {
            return res.status(400).json({ error: 'Product name or HS code is required' });
        }

        const prompt = `You are a Global Trade Expert. 
        Task: Provide HS Code and Description for the following query.
        Query: "${product}"
        
        Rules:
        1. If specific product name is given, find its 6-digit HS Code.
        2. If HS Code is given, find its standard trade description.
        3. Suggest 3 related or precise matches.
        
        Return ONLY a JSON array of objects: [{code: "1234.56", description: "Product Name"}]`;

        const aiResponse = await gemini.generateText(prompt);
        const data = gemini.extractJSON(aiResponse);

        return res.status(200).json({ success: true, data });

    } catch (error: any) {
        console.error('HS Code AI Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
