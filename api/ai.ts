import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Route based on query param: /api/ai?action=discover-suggestions
    const action = req.query.action as string;

    try {
        if (action === 'discover-suggestions') {
            return await handleDiscoverSuggestions(req, res);
        } else if (action === 'suggest') {
            return await handleSuggest(req, res);
        } else if (action === 'generate-email') {
            return await handleGenerateEmail(req, res);
        }

        return res.status(400).json({ error: `Unknown action: ${action}` });

    } catch (error: any) {
        console.error(`AI ${action} Error:`, error);
        return res.status(500).json({ error: 'AI operation failed' });
    }
}

async function handleDiscoverSuggestions(req: VercelRequest, res: VercelResponse) {
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
  "industries": ["Industry 1", "Industry 2"],
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
}

async function handleSuggest(req: VercelRequest, res: VercelResponse) {
    const { context, query, product, originCountry, industry } = req.body;

    if (!context) {
        return res.status(400).json({ error: 'context is required' });
    }

    let prompt = '';

    if (context === 'industry') {
        prompt = `Suggest 6-8 buyer industries for the product "${query || product}".
Return ONLY a JSON array of strings: ["Industry 1", "Industry 2"]`;
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
}

async function handleGenerateEmail(req: VercelRequest, res: VercelResponse) {
    const { companyName, product, tone, language, sender } = req.body;

    if (!product) {
        return res.status(400).json({ error: 'Missing product info' });
    }

    const senderLine = sender?.name
        ? `Sender: ${sender.name} from ${sender.company}`
        : 'Sender: A Turkish export company';

    const prompt = `Write a professional B2B cold email.
Target: ${companyName || 'Potential Client'}
Product: ${product}
Tone: ${tone || 'professional'}
Language: ${language || 'English'}
${senderLine}
Return ONLY JSON with {subject, body}. No markdown.`;

    const aiResponse = await gemini.generateText(prompt);
    const email = gemini.extractJSON(aiResponse);

    if (!email) throw new Error('Failed to parse AI response');

    return res.status(200).json({ success: true, data: email });
}
