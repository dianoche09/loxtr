import type { VercelRequest, VercelResponse } from '@vercel/node';
import { forecast } from '../_utils/forecast';
import { gemini } from '../_utils/gemini';
import { getInterpretedMarketData, frankfurter } from '../_utils/marketdata';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const action = req.query.action as string | undefined;

    try {
        if (action === 'tariff') return await handleTariffForecast(req, res);
        if (action === 'market-pulse') return await handleMarketPulse(req, res);
        return await handleFreightForecast(req, res);
    } catch (error: any) {
        console.error(`Predict [${action || 'freight'}] Error:`, error);
        return res.status(500).json({ error: 'Prediction failed' });
    }
}

async function handleFreightForecast(req: VercelRequest, res: VercelResponse) {
    const { origin, destination, horizon = 6, commodityType, containerSize } = req.body;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'origin and destination are required' });
    }

    const forecastAvailable = await forecast.isHealthy();

    if (forecastAvailable) {
        const result = await forecast.freightForecast(origin, destination, horizon);

        return res.status(200).json({
            success: true,
            data: {
                trend: result.trend,
                confidence: result.confidence,
                historicalData: result.historical_data,
                forecastData: result.forecast_data.map((p: any) => ({
                    date: p.date,
                    price: p.price,
                    lower: p.lower,
                    upper: p.upper,
                })),
                optimizedRoutes: result.optimized_routes.map((r: any) => ({
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

    const commodityCtx = commodityType ? ` for ${commodityType} cargo` : '';
    const containerCtx = containerSize ? ` in a ${containerSize} container` : '';

    const prompt = `You are a freight logistics expert. Estimate freight container shipping costs${commodityCtx}${containerCtx} from ${origin} to ${destination} for the next ${horizon} months.
Return ONLY valid JSON with this exact structure:
{
  "trend": "up"|"down"|"stable",
  "confidence": number (0-100),
  "historicalData": [{"date":"YYYY-MM","price":number}] (last 6 months, realistic 2026 values),
  "forecastData": [{"date":"YYYY-MM","price":number,"lower":number,"upper":number}] (next ${horizon} months with confidence bands),
  "optimizedRoutes": [{"id":"r1","carrier":"name","transitTime":days,"price":number,"carbonFootprint":kgCO2,"reliability":0-100,"tags":["tag"]}] (top 3 carriers),
  "insight": "brief market analysis (2-3 sentences)",
  "priceRisk": "LOW"|"MODERATE"|"HIGH",
  "spaceAvailability": "LOW"|"MODERATE"|"HIGH",
  "portIntel": [{"port":"port name","status":"congested"|"normal"|"optimal","detail":"brief status detail"}]
}
Use realistic 2026 market data. Include both origin and destination ports in portIntel.`;

    const aiResponse = await gemini.generateText(prompt);
    const parsed = gemini.extractJSON(aiResponse);

    if (!parsed) {
        return res.status(500).json({ error: 'Failed to generate forecast' });
    }

    // Fetch live exchange rates for currency conversion on route prices
    const fxData = await frankfurter.getLatestRates('USD');
    const currencyRates = Object.keys(fxData.rates).length > 0
        ? { date: fxData.date, EUR: fxData.rates.EUR, TRY: fxData.rates.TRY, CNY: fxData.rates.CNY, GBP: fxData.rates.GBP }
        : null;

    return res.status(200).json({
        success: true,
        data: { ...parsed, currencyRates },
        source: 'gemini-fallback',
    });
}

async function handleTariffForecast(req: VercelRequest, res: VercelResponse) {
    const { hsCode, originCountry, destinationCountry, horizon = 12 } = req.body;

    if (!hsCode || !originCountry || !destinationCountry) {
        return res.status(400).json({ error: 'hsCode, originCountry, and destinationCountry are required' });
    }

    const forecastAvailable = await forecast.isHealthy();

    if (forecastAvailable) {
        try {
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
                source: 'timesfm',
            });
        } catch {
            // Fall through to Gemini
        }
    }

    const prompt = `You are an international trade tariff expert. Analyze import tariff rates for HS Code ${hsCode} from ${originCountry} to ${destinationCountry} for the next ${horizon} months.
Return ONLY valid JSON with this exact structure:
{
  "hsCode": "${hsCode}",
  "productName": "product category name for this HS code",
  "trend": "up"|"down"|"stable",
  "confidence": number (0-100),
  "currentRate": number (current tariff rate as percentage, e.g. 5.2),
  "forecastData": [{"date":"YYYY-MM","price":number}] (next ${horizon} months, price = tariff rate %),
  "tradeAgreements": ["relevant trade agreement names between these countries"],
  "riskFactors": ["potential risk factors affecting this tariff"],
  "insight": "brief tariff analysis (2-3 sentences)"
}
Use realistic 2026 data. Consider WTO schedules, bilateral agreements, and recent trade policy changes.`;

    const aiResponse = await gemini.generateText(prompt);
    const parsed = gemini.extractJSON(aiResponse);

    if (!parsed) {
        return res.status(500).json({ error: 'Failed to generate tariff forecast' });
    }

    return res.status(200).json({
        success: true,
        data: parsed,
        source: 'gemini-fallback',
    });
}

async function handleMarketPulse(req: VercelRequest, res: VercelResponse) {
    const { region } = req.body || {};
    const regionCtx = region && region !== 'Global' ? ` Focus on the ${region} region.` : '';

    // Fetch interpreted market data in parallel with Gemini analysis
    const [marketData, geminiResult] = await Promise.all([
        getInterpretedMarketData(),
        (async () => {
            const prompt = `You are a global freight market analyst. Provide a comprehensive market pulse overview for the current period (April 2026).${regionCtx}
Return ONLY valid JSON with this exact structure:
{
  "topRoutes": [{"origin":"port/country","destination":"port/country","avgPrice":number,"trend":"up"|"down"|"stable","changePercent":number}] (top 6 busiest routes),
  "volatilityIndex": {"value":number (0-100),"label":"LOW"|"MODERATE"|"HIGH","change":number (vs last month)},
  "tradeAlerts": [{"severity":"info"|"warning"|"critical","title":"short title","description":"brief description","date":"YYYY-MM-DD"}] (3-5 current alerts),
  "commodityTrends": [{"name":"commodity name","trend":"up"|"down"|"stable","priceChange":number (percentage)}] (top 6 commodities),
  "freightIndex": {"value":number,"change":number,"unit":"USD/TEU"},
  "summary": "2-3 paragraph market overview"
}
Use realistic 2026 market data reflecting current geopolitical and economic conditions.`;

            const aiResponse = await gemini.generateText(prompt);
            return gemini.extractJSON(aiResponse);
        })(),
    ]);

    if (!geminiResult) {
        return res.status(500).json({ error: 'Failed to generate market pulse' });
    }

    return res.status(200).json({
        success: true,
        data: {
            ...geminiResult,
            marketInsights: marketData.insights,
            currencyConversion: marketData.currencyConversion,
        },
        source: 'gemini+live',
    });
}
