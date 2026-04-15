import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const action = req.query.action;

    if (action === 'generate-comment') return handleGenerateComment(req, res);
    if (action === 'generate-invoice') return handleGenerateInvoice(req, res);
    if (action === 'insights') return handleInsights(req, res);

    return res.status(400).json({ error: `Unknown action: ${action}` });
}

async function callGemini(prompt, maxTokens = 1024) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error('Gemini API key not configured');

    const attempts = [
        { model: "gemini-2.0-flash", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1beta" },
    ];

    for (const { model, version } of attempts) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
                    }),
                }
            );
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text.trim();
        } catch (e) {
            continue;
        }
    }
    throw new Error('All Gemini attempts failed');
}

function parseJSON(text) {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) return JSON.parse(cleaned.substring(start, end + 1));
    const aStart = cleaned.indexOf('[');
    const aEnd = cleaned.lastIndexOf(']');
    if (aStart !== -1 && aEnd !== -1) return JSON.parse(cleaned.substring(aStart, aEnd + 1));
    throw new Error('No JSON found');
}

async function handleGenerateComment(req, res) {
    const { postContent, authorName, keyword } = req.body;
    if (!postContent) return res.status(400).json({ error: 'Post content is required' });

    const prompt = `Sen LOXTR firmasinin kidemli dis ticaret danismansin (Sales Engineer).
LinkedIn'de "${authorName || 'Biri'}" isimli kullanici "${keyword || 'dis ticaret'}" konusunda su postu paylasti: "${postContent}".
Senin gorevin:
1. Bu kisinin dert yandigi sureci anladigini gosteren samimi bir giris yap.
2. Nazikce docs.loxtr.com uzerinden ulasılabilen "LoxConvert Dossier Mode" aracimizi oner.
Kurallar: Cok kisa (max 2-3 cumle), samimi ve profesyonel. Asla satis yapiyor gibi gorunme. Sonuna docs.loxtr.com linkini birak. SADECE Turkce yaz.`;

    try {
        const suggestedComment = await callGemini(prompt, 256);
        return res.status(200).json({ suggestedComment });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to generate comment' });
    }
}

async function handleGenerateInvoice(req, res) {
    const { items, companyInfo, targetCountry } = req.body;

    const prompt = `Convert these packing list items into a professional commercial invoice structure: ${JSON.stringify(items)}.
Target Market: ${targetCountry}.
Return a JSON object with:
- "invoiceNumber": A mock invoice number like "INV-XXXXXX"
- "date": Current date string
- "items": Array of objects with: "description", "hs_code", "qty", "unit", "weight", "unitPrice" (0), "totalPrice" (0)
- "currency": Suggested currency based on ${targetCountry}
- "paymentTerms": Default suggestion like "30 Days Net"
OUTPUT ONLY RAW JSON.`;

    try {
        const rawText = await callGemini(prompt);
        const invoiceData = parseJSON(rawText);
        return res.status(200).json({
            ...invoiceData,
            seller: companyInfo || { name: "LOXTR User", address: "City, Country" },
        });
    } catch (error) {
        console.error("Invoice generation error:", error);
        return res.status(500).json({ error: "Failed to generate invoice structure." });
    }
}

async function handleInsights(req, res) {
    const { hsCode, productDescription, targetCountry } = req.body;

    const compliancePrompt = `Analyze trade compliance for HS CODE: ${hsCode}, PRODUCT: "${productDescription}" into COUNTRY: ${targetCountry}.
Return a JSON object with:
- "riskAlert": One-sentence urgent warning or summary of biggest trade barrier.
- "requirements": Array of strings listing mandatory documents or tax rates.
- "competitors": Array of 3 objects { "country": "Name", "share": 0-100 } representing top exporting countries.
- "strategicNote": Short punchy advice on how to compete in this market.
OUTPUT ONLY RAW JSON. NO MARKDOWN.`;

    try {
        const rawText = await callGemini(compliancePrompt);
        const complianceData = parseJSON(rawText);

        try {
            const { data: userData } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1]);
            await supabase.from('lox_radar_searches').insert({
                user_id: userData?.user?.id,
                hs_code: hsCode,
                product_name: productDescription,
                target_country: targetCountry,
            });
        } catch (e) {
            console.warn("Logging search failed:", e.message);
        }

        const { data: buyers } = await supabase
            .from('leads')
            .select('company_name, country, website, ai_score')
            .ilike('industry', `%${productDescription.split(' ')[0]}%`)
            .eq('country', targetCountry)
            .limit(3);

        const finalBuyers = (buyers && buyers.length > 0) ? buyers : [
            { company_name: "Global Trade Solutions GmbH", country: targetCountry, website: "https://example.de", ai_score: 98 },
        ];

        return res.status(200).json({ compliance: complianceData, potentialBuyers: finalBuyers });
    } catch (error) {
        console.error("Insights Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
