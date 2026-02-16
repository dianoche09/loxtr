import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from './_utils/gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { action } = req.query;

    try {
        if (action === 'hs-suggestions') {
            const { product } = req.body;
            const query = (req.query.q as string) || product;
            const prompt = `Provide 3 HS Code and Description matches for "${query}". 
            Return ONLY JSON array of items: [{code: "1234.56", description: "Product Name"}]`;

            const aiResponse = await gemini.generateText(prompt);
            let extracted = gemini.extractJSON(aiResponse);

            if (!Array.isArray(extracted)) {
                if (extracted.recommendations) extracted = extracted.recommendations;
                else if (extracted.codes) extracted = extracted.codes;
                else if (extracted.results) extracted = extracted.results;
                else extracted = [];
            }

            return res.status(200).json({ success: true, data: extracted });
        }

        if (action === 'strategy') {
            const { products, originCountry = 'Turkey' } = req.body;
            const productDetails = products.map((p: any) => `${p.name} (HS: ${p.hsCode})`).join(', ');
            const prompt = `Analyze market for ${productDetails} from ${originCountry}. Suggest top 3 countries with score, reasoning, and breakdown. Return ONLY JSON: { "recommendations": [...] }`;
            const aiResponse = await gemini.generateText(prompt);
            return res.status(200).json({ success: true, data: gemini.extractJSON(aiResponse) });
        }

        if (action === 'icp') {
            const { products, targetCountries } = req.body;
            const prompt = `Define ICP for ${products?.map((p: any) => p.name).join(', ')} in ${targetCountries?.join(', ')}. Suggest 3 industries and 3 roles. Return ONLY JSON: { "targetIndustries": [], "decisionMakers": [] }`;
            const aiResponse = await gemini.generateText(prompt);
            return res.status(200).json({ success: true, data: gemini.extractJSON(aiResponse) });
        }

        if (action === 'certificates') {
            const { industry } = req.query;
            const prompt = `Suggest 3 international certificates for the "${industry}" industry. Return ONLY JSON array of strings.`;
            const aiResponse = await gemini.generateText(prompt);
            return res.status(200).json({ success: true, data: gemini.extractJSON(aiResponse) });
        }

        if (action === 'bio') {
            const { website } = req.body;
            const prompt = `Generate company bio, products, and logo for website: ${website}. 
            The 'products' field MUST be a simple array of strings.
            Return ONLY JSON: { "bio": "...", "logo": "...", "products": ["Product Name A", "Product Name B"] }`;

            const aiResponse = await gemini.generateText(prompt);
            let extracted = gemini.extractJSON(aiResponse);

            if (extracted.products && Array.isArray(extracted.products)) {
                extracted.products = extracted.products.map((p: any) => typeof p === 'object' ? (p.name || p.title || JSON.stringify(p)) : String(p));
            }

            return res.status(200).json({ success: true, data: extracted });
        }

        if (action === 'value-prop') {
            const { companyName, industry, products } = req.body;
            const prompt = `Write a 3-sentence profession pitch for ${companyName} in ${industry} exporting ${products?.join(', ')}. Return ONLY the text.`;
            const aiResponse = await gemini.generateText(prompt);
            return res.status(200).json({ success: true, data: aiResponse });
        }

        if (action === 'validate-gemini') {
            const { apiKey } = req.body;
            const genAI = new GoogleGenerativeAI(apiKey);
            await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("test");
            return res.status(200).json({ success: true });
        }

        if (action === 'validate-resend') {
            const { apiKey } = req.body;
            const resend = new Resend(apiKey);
            await resend.apiKeys.list();
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error(`Onboarding Action Error [${action}]:`, error);
        return res.status(500).json({ error: error.message });
    }
}
