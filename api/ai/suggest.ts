import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { context, query, product, originCountry, industry } = req.body;

        if (!context) {
            return res.status(400).json({ error: 'context is required' });
        }

        let prompt = '';

        if (context === 'industry') {
            prompt = `Suggest 6-8 buyer industries for the product "${query || product}".
Return ONLY a JSON array of strings: ["Industry 1", "Industry 2", ...]`;
        } else if (context === 'market') {
            prompt = `Suggest 5-6 target export markets for "${query || product}" from ${originCountry || 'Turkey'} in the ${industry || 'general'} sector.
Return ONLY a JSON array: [{"country": "Name", "reason": "Brief reason"}]`;
        } else if (context === 'buyer_profile') {
            prompt = `Describe the ideal buyer profile for "${query || product}" in ${industry || 'general'} industry.
Return ONLY a JSON object: {"title": "Buyer Title", "description": "Profile description", "painPoints": ["point1"], "decisionFactors": ["factor1"]}`;
        } else {
            prompt = `Provide smart suggestions for: "${query}". Context: ${context}. Return a JSON object with relevant suggestions.`;
        }

        const aiResponse = await gemini.generateText(prompt);
        const parsed = gemini.extractJSON(aiResponse);

        if (!parsed) {
            return res.status(500).json({ error: 'Failed to parse suggestions' });
        }

        return res.status(200).json({ success: true, data: parsed });

    } catch (error: any) {
        console.error('AI Suggest Error:', error);
        return res.status(500).json({ error: 'Suggestion failed' });
    }
}
