import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { product } = req.body;

        if (!product || product.length < 2) {
            return res.status(400).json({ error: 'Product name is required (min 2 chars)' });
        }

        const prompt = `You are a global trade intelligence expert. A user wants to export "${product}".

Suggest:
1. 5-8 buyer industries that would purchase this product (e.g. "Retail & E-Commerce", "Construction & Infrastructure")
2. 4-6 target countries with a brief reason why each is a good market

Return ONLY a JSON object:
{
  "industries": ["Industry 1", "Industry 2", ...],
  "markets": [
    {"country": "Germany", "reason": "Largest EU importer, strong demand for quality goods"},
    {"country": "USA", "reason": "High purchasing power, diverse market segments"}
  ]
}`;

        const aiResponse = await gemini.generateText(prompt);
        const parsed = gemini.extractJSON(aiResponse);

        if (!parsed) {
            return res.status(500).json({ error: 'Failed to parse AI suggestions' });
        }

        return res.status(200).json({
            success: true,
            data: {
                industries: parsed.industries || [],
                markets: parsed.markets || [],
            },
        });

    } catch (error: any) {
        console.error('Discovery Suggestions Error:', error);
        return res.status(500).json({ error: 'Failed to generate suggestions' });
    }
}
