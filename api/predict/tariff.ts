import type { VercelRequest, VercelResponse } from '@vercel/node';
import { forecast } from '../_utils/forecast';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { hsCode, originCountry, destinationCountry, horizon = 12 } = req.body;

        if (!hsCode || !originCountry || !destinationCountry) {
            return res.status(400).json({ error: 'hsCode, originCountry, destinationCountry required' });
        }

        const forecastAvailable = await forecast.isHealthy();

        if (!forecastAvailable) {
            return res.status(503).json({ error: 'Forecast service unavailable' });
        }

        const result = await forecast.tariffForecast(hsCode, originCountry, destinationCountry, horizon);

        return res.status(200).json({
            success: true,
            data: {
                hsCode: result.hs_code,
                trend: result.trend,
                confidence: result.confidence,
                currentRate: result.current_rate,
                forecastData: result.forecast_data,
                modelUsed: result.model_used,
                insight: result.insight,
            },
        });

    } catch (error: any) {
        console.error('Tariff Forecast Error:', error);
        return res.status(500).json({ error: 'Tariff forecast failed' });
    }
}
