import type { VercelRequest, VercelResponse } from '@vercel/node';
import { forecast } from '../_utils/forecast';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { origin, destination, horizon = 6 } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({ error: 'origin and destination are required' });
        }

        const forecastAvailable = await forecast.isHealthy();

        if (forecastAvailable) {
            const result = await forecast.freightForecast(origin, destination, horizon);

            // Transform snake_case to camelCase for frontend
            return res.status(200).json({
                success: true,
                data: {
                    trend: result.trend,
                    confidence: result.confidence,
                    historicalData: result.historical_data,
                    forecastData: result.forecast_data.map(p => ({
                        date: p.date,
                        price: p.price,
                        lower: p.lower,
                        upper: p.upper,
                    })),
                    optimizedRoutes: result.optimized_routes.map(r => ({
                        id: r.id,
                        carrier: r.carrier,
                        transitTime: r.transit_time,
                        price: r.price,
                        carbonFootprint: r.carbon_footprint,
                        reliability: r.reliability,
                        tags: r.tags,
                    })),
                    modelUsed: result.model_used,
                    insight: result.insight,
                },
                source: 'timesfm',
            });
        }

        // Fallback: use Gemini for a rough estimate
        const prompt = `You are a freight logistics expert. Estimate freight container shipping costs (20ft TEU) from ${origin} to ${destination} for the next ${horizon} months.
Return a JSON object with:
{
  "trend": "up"|"down"|"stable",
  "confidence": number (0-100),
  "historicalData": [{"date":"YYYY-MM","price":number}] (last 6 months, realistic values),
  "forecastData": [{"date":"YYYY-MM","price":number}] (next ${horizon} months),
  "optimizedRoutes": [{"id":"r1","carrier":"name","transitTime":days,"price":number,"carbonFootprint":kgCO2,"reliability":0-100,"tags":["tag"]}] (top 3 carriers),
  "insight": "brief market analysis"
}
Use realistic 2026 market data.`;

        const aiResponse = await gemini.generateText(prompt);
        const parsed = gemini.extractJSON(aiResponse);

        if (!parsed) {
            return res.status(500).json({ error: 'Failed to generate forecast' });
        }

        return res.status(200).json({
            success: true,
            data: parsed,
            source: 'gemini-fallback',
        });

    } catch (error: any) {
        console.error('Forecast Error:', error);
        return res.status(500).json({ error: 'Forecast failed' });
    }
}
