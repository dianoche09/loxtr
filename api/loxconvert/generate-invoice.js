import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { items, companyInfo, targetCountry } = req.body;

    const prompt = `Convert these packing list items into a professional commercial invoice structure: ${JSON.stringify(items)}.
    Target Market: ${targetCountry}.
    Return a JSON object with:
    - "invoiceNumber": A mock invoice number like "INV-XXXXXX"
    - "date": Current date string
    - "items": An array of objects each containing: "description", "hs_code", "qty", "unit", "weight", "unitPrice" (leave as 0), "totalPrice" (leave as 0).
    - "currency": Suggested currency based on ${targetCountry} (e.g., EUR, USD, GBP).
    - "paymentTerms": A default suggestion like "30 Days Net".
    
    OUTPUT ONLY RAW JSON. NO MARKDOWN.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const invoiceData = JSON.parse(cleaned);

        return res.status(200).json({
            ...invoiceData,
            seller: companyInfo || { name: "LOXTR User", address: "City, Country" }
        });
    } catch (error) {
        console.error("Invoice generation error:", error);
        return res.status(500).json({ error: "Failed to generate invoice structure." });
    }
}
