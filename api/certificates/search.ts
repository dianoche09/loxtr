import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const industry = req.query.industry as string;

        if (!industry) {
            return res.status(200).json({ success: true, data: [] });
        }

        const prompt = `Suggest 3 most important international certificates or standards for companies in the "${industry}" industry.
        Return ONLY JSON array of strings: ["Cert1", "Cert2", "Cert3"]`;

        const aiResponse = await gemini.generateText(prompt);
        const data = gemini.extractJSON(aiResponse);

        return res.status(200).json({ success: true, data });

    } catch (error: any) {
        console.error('Certificates Search Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
