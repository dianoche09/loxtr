import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { companyName, product, tone, language, sender } = req.body;

        if (!product || !sender) {
            return res.status(400).json({ error: 'Missing product or sender info' });
        }

        const prompt = `Write a professional B2B cold email.
        Target: ${companyName || 'Potential Client'}
        Product: ${product}
        Tone: ${tone || 'professional'}
        Language: ${language || 'English'}
        Sender: ${sender.name} from ${sender.company}
        Return JSON with {subject, body}.`;

        const aiResponse = await gemini.generateText(prompt);
        const email = gemini.extractJSON(aiResponse);

        if (!email) throw new Error('Failed to parse AI response');

        return res.status(200).json({ success: true, data: email });

    } catch (error: any) {
        console.error('Email Gen Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
