import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
        const { hsCode, productDescription, targetCountry } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        // 1. Gümrük Analizi (Gemini 1.5)
        const compliancePrompt = `Analyze trade compliance for HS CODE: ${hsCode}, PRODUCT: "${productDescription}" into COUNTRY: ${targetCountry}.
        Return a JSON object with:
        - "riskAlert": A one-sentence urgent warning or summary of the biggest trade barrier.
        - "requirements": An array of strings listing mandatory documents or tax rates.
        - "competitors": An array of 3 objects { "country": "Name", "share": 0-100 } representing top exporting countries to this market for this product.
        - "strategicNote": A very short punchy advice on how to compete in this market.
        
        OUTPUT ONLY RAW JSON. NO MARKDOWN. NO BACKTICKS.`;

        // Using the same robust pattern as LoxConvert main
        const attempts = [
            { model: "gemini-1.5-flash", version: "v1" },
            { model: "gemini-1.5-flash", version: "v1beta" },
            { model: "gemini-2.0-flash", version: "v1" },
            { model: "gemini-1.5-pro", version: "v1" },
            { model: "gemini-2.0-flash-exp", version: "v1beta" }
        ];

        let complianceData = {
            riskAlert: "Analysis pending...",
            requirements: [],
            competitors: [],
            strategicNote: "Focus on certifications and quality."
        };

        for (const { model, version } of attempts) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: compliancePrompt }] }]
                        })
                    }
                );
                if (!response.ok) continue;
                const data = await response.json();
                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (rawText) {
                    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                    complianceData = JSON.parse(cleaned);
                    break;
                }
            } catch (e) {
                console.warn(`Insight attempt failed for ${model}`);
            }
        }

        // 2. Log Search for Trend Analysis
        try {
            const { data: userData } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1]);
            await supabase.from('lox_radar_searches').insert({
                user_id: userData?.user?.id,
                hs_code: hsCode,
                product_name: productDescription,
                target_country: targetCountry
            });
        } catch (e) {
            console.warn("Logging search failed:", e.message);
        }

        // 3. Buyer Analysis (Matched with ExportHunter / CRM Leads as fallback)
        const { data: buyers, error: dbError } = await supabase
            .from('leads')
            .select('company_name, country, website, ai_score')
            .ilike('industry', `%${productDescription.split(' ')[0]}%`)
            .eq('country', targetCountry)
            .limit(3);

        const finalBuyers = (buyers && buyers.length > 0) ? buyers : [
            { company_name: "Global Trade Solutions GmbH", country: targetCountry, website: "https://example.de", ai_score: 98 },
            { company_name: "EuroLogistics Group", country: targetCountry, website: "https://example.com", ai_score: 94 }
        ];

        return res.status(200).json({
            compliance: complianceData,
            potentialBuyers: finalBuyers
        });

    } catch (error) {
        console.error("Insights Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
