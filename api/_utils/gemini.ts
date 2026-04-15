import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const gemini = {
    generateText: async (prompt: string, userKey?: string) => {
        const activeModel = userKey
            ? new GoogleGenerativeAI(userKey).getGenerativeModel({ model: 'gemini-2.0-flash' })
            : model;
        const result = await activeModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 8192 },
        });
        return result.response.text();
    },

    extractJSON: (text: string) => {
        try {
            const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();

            // Try direct parse first
            try { return JSON.parse(cleaned); } catch {}

            // Try extracting object
            const objStart = cleaned.indexOf('{');
            const objEnd = cleaned.lastIndexOf('}');
            if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
                try { return JSON.parse(cleaned.substring(objStart, objEnd + 1)); } catch {}
            }

            // Try extracting array
            const arrStart = cleaned.indexOf('[');
            const arrEnd = cleaned.lastIndexOf(']');
            if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
                try { return JSON.parse(cleaned.substring(arrStart, arrEnd + 1)); } catch {}
            }

            // Truncated array recovery: find last complete object and close the array
            if (arrStart !== -1) {
                let truncated = cleaned.substring(arrStart);
                const lastBrace = truncated.lastIndexOf('}');
                if (lastBrace !== -1) {
                    truncated = truncated.substring(0, lastBrace + 1) + ']';
                    try { return JSON.parse(truncated); } catch {}
                }
            }

            throw new Error('No JSON found');
        } catch (e) {
            console.error('JSON Extraction Error:', e);
            return null;
        }
    }
};
