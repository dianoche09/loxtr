import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { website } = req.body;

        if (!website) {
            return res.status(400).json({ error: 'Website is required' });
        }

        const prompt = `Analyze this business website: ${website}. 
        (Note: Since I cannot browse live for this demo, assume a generic professional exporter bio based on the domain name).
        
        Generate a 3-sentence company bio, identify potential export products, and suggest a logo placeholder color.
        
        Return ONLY JSON:
        {
          "bio": "Company description...",
          "logo": "https://api.dicebear.com/7.x/initials/svg?seed=LOX",
          "products": ["Product A", "Product B"]
        }`;

        const aiResponse = await gemini.generateText(prompt);
        const data = gemini.extractJSON(aiResponse);

        return res.status(200).json({ success: true, data });

    } catch (error: any) {
        console.error('Generate Bio Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
