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
        const { fileBase64, fileName, mimeType, userId, mode = 'extract', dossierData } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        // 1. QUICK VALIDATION MODE (CROSS-CHECK)
        if (mode === 'validate') {
            const results = validateShipmentData(dossierData);
            return res.status(200).json(results);
        }

        // 2. AI PROCESSING MODES
        const attempts = [
            { model: "gemini-2.0-flash", version: "v1" },
            { model: "gemini-1.5-flash", version: "v1" },
            { model: "gemini-1.5-pro", version: "v1" }
        ];

        let prompt = "";
        if (mode === 'classify') {
            prompt = `Identify the document type for this logistics file. 
            Output strictly JSON: { "doc_type": "invoice" | "packing_list" | "bl" | "co" | "specification" | "other" }`;
        } else {
            prompt = `Analyze this logistics/trade document. 
            1. Classify the document type.
            2. Extract all line items and macro stats.
            3. Identify "Shipment Identity" markers (Invoice No, BL No, Reference).
            4. Determine the DESTINATION country for customs simulation.

            Return a STRICT JSON object:
            - "doc_metadata": { "type": string, "reference_no": string, "issue_date": string, "destination_country": string }.
            - "items": Array of items. Each item:
                * "description", "qty", "unit", "weight", "hs_code", "confidence", "logic".
                * "origin_country": ISO Code.
                * "value": number.
                * "taxes": { "duty_percent": number, "vat_percent": number }.
            - "intelligence": 
                * "commodity_category", "risk_score", "regulatory_notes".
                * "incoterms": { "term": string, "is_valid": boolean, "advice": string }.
                * "validation_hooks": { "total_qty": number, "total_weight": number, "total_value": number, "currency": string }.
                * "suggested_buyers": [].

            OUTPUT ONLY RAW JSON.`;
        }

        let jsonOutput = null;
        let lastError = null;

        for (const { model, version } of attempts) {
            try {
                const payload = {
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType, data: fileBase64 } }
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

                if (!response.ok) throw new Error(`API Error ${response.status}`);
                const data = await response.json();
                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!rawText) throw new Error("No content generated");

                const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                jsonOutput = JSON.parse(cleanedText);
                break;
            } catch (e) {
                lastError = e;
            }
        }

        if (!jsonOutput) {
            throw new Error(`AI analysis failed: ${lastError?.message}`);
        }

        return res.status(200).json(jsonOutput);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// CROSS-CHECK ENGINE
function validateShipmentData(dossier) {
    if (!dossier || dossier.length === 0) return null;

    const invoices = dossier.filter(d => d.doc_metadata?.type?.toLowerCase().includes('invoice') || d.doc_metadata?.type === 'invoice');
    const plists = dossier.filter(d => d.doc_metadata?.type?.toLowerCase().includes('packing') || d.doc_metadata?.type === 'packing_list');
    const bls = dossier.filter(d => d.doc_metadata?.type?.toLowerCase().includes('bl') || d.doc_metadata?.type === 'bl' || d.doc_metadata?.type?.toLowerCase().includes('bill'));

    const alerts = [];
    let isConsistent = true;

    // 1. Invoice vs Packing List Quantity Check
    if (invoices.length > 0 && plists.length > 0) {
        const invQty = invoices.reduce((sum, d) => sum + (d.intelligence?.validation_hooks?.total_qty || 0), 0);
        const plQty = plists.reduce((sum, d) => sum + (d.intelligence?.validation_hooks?.total_qty || 0), 0);

        if (Math.abs(invQty - plQty) > 0.01) {
            alerts.push({
                type: 'error',
                message: `Quantity mismatch: Invoice (${invQty}) vs Packing List (${plQty})`,
                field: 'qty'
            });
            isConsistent = false;
        }
    }

    // 2. Packing List vs BL Weight Check
    if (plists.length > 0 && bls.length > 0) {
        const plWeight = plists.reduce((sum, d) => sum + (d.intelligence?.validation_hooks?.total_weight || 0), 0);
        const blWeight = bls.reduce((sum, d) => sum + (d.intelligence?.validation_hooks?.total_weight || 0), 0);

        if (Math.abs(plWeight - blWeight) > 0.5) {
            alerts.push({
                type: 'warning',
                message: `Weight discrepancy: PL (${plWeight}kg) vs BL (${blWeight}kg)`,
                field: 'weight'
            });
        }
    }

    // 3. Missing Documents Check
    const types = dossier.map(d => d.doc_metadata?.type?.toLowerCase() || '');
    const hasInvoice = types.some(t => t.includes('invoice'));
    const hasPL = types.some(t => t.includes('packing'));
    const hasBL = types.some(t => t.includes('bl') || t.includes('bill'));

    if (!hasInvoice) alerts.push({ type: 'missing', message: 'Missing Document: Commercial Invoice required.' });
    if (!hasPL) alerts.push({ type: 'missing', message: 'Missing Document: Packing List recommended for customs.' });
    if (!hasBL) alerts.push({ type: 'missing', message: 'Missing Document: Transport Document (BL/AWB) not detected.' });

    return {
        isConsistent,
        alerts,
        summary: {
            total_value: invoices.reduce((sum, d) => sum + (d.intelligence?.validation_hooks?.total_value || 0), 0),
            currency: invoices[0]?.intelligence?.validation_hooks?.currency || 'USD',
            doc_count: dossier.length
        }
    };
}
