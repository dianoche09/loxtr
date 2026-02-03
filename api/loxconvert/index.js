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

        // REST API Implementation
        // Brute-force try all known aliases for Gemini 1.5 to find one that works
        // SMART REST API Implementation
        // We try combinations of Models AND API Versions because availability differs
        const attempts = [
            { model: "gemini-1.5-flash", version: "v1" },
            { model: "gemini-1.5-flash", version: "v1beta" },
            { model: "gemini-2.0-flash", version: "v1" },
            { model: "gemini-1.5-pro", version: "v1" },
            { model: "gemini-2.0-flash-exp", version: "v1beta" }
        ];
        let jsonOutput = null;
        let lastError = null;

        for (const { model, version } of attempts) {
            try {
                console.log(`Trying via REST API: ${model} (${version})`);

                const payload = {
                    contents: [{
                        parts: [
                            {
                                text: `Analyze this logistics/trade document (packing list, invoice, etc.). 
    1. Extract all line items with precision.
    2. Conduct a "Customs Digital Audit" and "Market Intelligence" sweep.

    Return a STRICT JSON object with these fields:
    - "items": Array of items. Each item must have:
        * "description", "qty", "unit", "weight", "hs_code" (6-digit), "confidence", "logic".
        * "origin_country": ISO Code (e.g. DE, TR, CN).
        * "value": Estimate or extract the line value if available (number).
        * "taxes": { "duty_percent": number, "vat_percent": number, "additional_tax": number }.
    - "intelligence": 
        * "commodity_category", "risk_score", "regulatory_notes".
        * "incoterms": { "term": string, "is_valid": boolean, "advice": string }.
        * "market_data": { "total_market_size": string, "growth": string, "competitor_nations": [] }.
        * "cross_validation": { "is_consistent": boolean, "noted_inconsistencies": [] }.
        * "suggested_buyers": [].

    OUTPUT ONLY RAW JSON. NO MARKDOWN. NO BACKTICKS.` },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: fileBase64
                                }
                            }
                        ]
                    }]
                };

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
                console.warn(`Attempt ${model}/${version} failed:`, e.message);
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
                    items_count: jsonOutput.items?.length || 0,
                    hs_codes_suggested: (jsonOutput.items || []).filter(i => i.hs_code).length
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
