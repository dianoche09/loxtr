import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { postContent, authorName, keyword } = req.body;

    if (!postContent) {
        return res.status(400).json({ error: 'Post content is required' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Gemini prompts for a "Sales Engineer" persona
    const prompt = `
    Sen LOXTR firmasının kıdemli dış ticaret danışmanısın (Sales Engineer). 
    LinkedIn'de "${authorName || 'Biri'}" isimli kullanıcı "${keyword || 'dış ticaret'}" konusunda şu postu paylaştı: "${postContent}".
    
    Senin görevin:
    1. Bu kişinin dert yandığı manuel süreci veya ihtiyacı anladığını gösteren samimi bir giriş yap.
    2. Nazikçe docs.loxtr.com üzerinden ulaşılabilen "LoxConvert AI" aracımızı (packing list'i excel'e çevirme, HS kodu bulma vb.) öner. 
    
    Kurallar:
    - Çok kısa, samimi ve profesyonel ol (max 2 cümle).
    - Asla "satış yapmaya" çalışıyormuş gibi görünme, yardım etmeye odaklan.
    - Yorumun sonuna mutlaka docs.loxtr.com linkini bırak.
    - SADECE Türkçe yaz.
    - Markdown veya emojileri dozunda kullan.
    `;

    const attempts = [
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-2.0-flash-exp", version: "v1beta" }
    ];

    let suggestedComment = null;
    let lastError = null;

    for (const { model, version } of attempts) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 256,
                        }
                    })
                }
            );

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                suggestedComment = data.candidates[0].content.parts[0].text.trim();
                break;
            } else if (data.error) {
                lastError = `API Error ${data.error.code}: ${data.error.message}`;
            }
        } catch (err) {
            lastError = err.message;
        }
    }

    if (!suggestedComment) {
        return res.status(500).json({
            error: 'Failed to generate comment with AI',
            details: lastError
        });
    }

    return res.status(200).json({ suggestedComment });
}
