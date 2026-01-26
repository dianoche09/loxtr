import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const gemini = {
    generateText: async (prompt: string, userKey?: string) => {
        const activeModel = userKey ? new GoogleGenerativeAI(userKey).getGenerativeModel({ model: 'gemini-2.0-flash' }) : model;
        const result = await activeModel.generateContent(prompt);
        return result.response.text();
    },

    extractJSON: (text: string) => {
        try {
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start === -1 || end === -1) {
                const arrayStart = cleaned.indexOf('[');
                const arrayEnd = cleaned.lastIndexOf(']');
                if (arrayStart !== -1 && arrayEnd !== -1) {
                    return JSON.parse(cleaned.substring(arrayStart, arrayEnd + 1));
                }
                throw new Error('No JSON found');
            }
            return JSON.parse(cleaned.substring(start, end + 1));
        } catch (e) {
            console.error('JSON Extraction Error:', e);
            return null;
        }
    }
};
