import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { apiKey } = req.body;
        if (!apiKey) return res.status(400).json({ error: 'API key is required' });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Simple validation call
        await model.generateContent("test");

        return res.status(200).json({ success: true, message: 'Gemini API Key is valid' });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: 'Invalid Gemini API Key' });
    }
}
