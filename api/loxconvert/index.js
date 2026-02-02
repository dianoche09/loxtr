import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Note: In serverless functions, these env vars must be set in Vercel project settings
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { fileBase64, fileName, mimeType, userId } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        // DAILY LIMIT CHECK
        if (userId) {
            const today = new Date().toISOString().split('T')[0];
            const { count, error } = await supabase
                .from('lox_convert_history')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', today);

            if (count !== null && count >= 5) {
                return res.status(403).json({ error: "Daily limit reached (5/5). Please upgrade to Pro for unlimited access." });
            }
        }

        // REST API Implementation to bypass SDK version issues
        const modelsToTry = ["gemini-1.5-flash", "gemini-pro"];
        let jsonOutput = null;
        let lastError = null;

        for (const model of modelsToTry) {
            try {
                console.log(`Trying via REST API: ${model}`);

                const payload = {
                    contents: [{
                        parts: [
                            {
                                text: `Analyze this logistics/trade document (packing list, invoice, etc.). 
    Extract the items listed in the table or list. 
    Return a STRICT JSON array where each object has these fields:
    - "description": The item description (keep original language, but ensure clarity).
    - "qty": Quantity as a number.
    - "unit": Unit of measure (pcs, kg, m3, etc.).
    - "weight": Total weight if available (number), else null.
    - "hs_code": The HS Code / GTIP if listed. If NOT listed, suggest the most likely 6-digit HS Code based on the description.

    OUTPUT ONLY RAW JSON. NO MARKDOWN. NO BACKTICKS.` },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: fileBase64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        response_mime_type: "application/json"
                    }
                };

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    }
                );

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`API Error ${response.status}: ${errText}`);
                }

                const data = await response.json();

                // Parse response
                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!rawText) throw new Error("No content generated");

                const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                jsonOutput = JSON.parse(cleanedText);

                // If success, break
                break;

            } catch (e) {
                console.warn(`Model ${model} failed:`, e.message);
                lastError = e;
            }
        }

        if (!jsonOutput) {
            throw new Error(`All AI models failed. Last error: ${lastError?.message}`);
        }

        // Insert history into Supabase
        if (userId) {
            try {
                await supabase.from('lox_convert_history').insert({
                    user_id: userId,
                    file_name: fileName,
                    items_count: jsonOutput.length,
                    hs_codes_suggested: jsonOutput.filter(i => i.hs_code).length
                });
            } catch (dbError) {
                console.error("Supabase Log Error:", dbError);
            }
        }

        return res.status(200).json(jsonOutput);
    } catch (error) {
        console.error("LoxConvert Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
