import type { VercelRequest, VercelResponse } from '@vercel/node';
import { forecast } from '../_utils/forecast';
import { gemini } from '../_utils/gemini';
import { getInterpretedMarketData, frankfurter, eia, fred, FRED_SERIES } from '../_utils/marketdata';

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
    const { origin, destination, horizon = 6, commodityType, containerSize, departureDate } = req.body;

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
    const containerCtx = containerSize || '20ft';
    const departureDateStr = departureDate || new Date().toISOString().slice(0, 10);
    const departureMonth = new Date(departureDateStr).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Fetch real market context to ground Gemini's estimates
    const [brentData, dollarData, fxData] = await Promise.all([
        eia.getBrentCrudePrice(),
        fred.getSeries(FRED_SERIES.DOLLAR_INDEX, 5),
        frankfurter.getLatestRates('USD'),
    ]);

    const brentPrice = brentData.length > 0 ? brentData[0].price : null;
    const dollarIdx = dollarData.length > 0 ? dollarData[0].value : null;
    const eurRate = fxData.rates?.EUR || null;
    const tryRate = fxData.rates?.TRY || null;

    const realDataCtx = [
        brentPrice ? `Current Brent crude oil: $${brentPrice.toFixed(2)}/barrel` : null,
        dollarIdx ? `US Dollar Index: ${dollarIdx.toFixed(1)}` : null,
        eurRate ? `EUR/USD: ${eurRate.toFixed(4)}` : null,
        tryRate ? `USD/TRY: ${tryRate.toFixed(2)}` : null,
    ].filter(Boolean).join('. ');

    // Known real carriers on major routes
    const carrierContext = `
Use ONLY real shipping carriers. Common ones by route:
- Asia-Europe: Maersk, MSC, CMA CGM, COSCO, Hapag-Lloyd, Evergreen, ONE, HMM, Yang Ming, ZIM
- Transatlantic: Maersk, MSC, Hapag-Lloyd, CMA CGM, ZIM
- Intra-Asia: COSCO, Evergreen, ONE, Yang Ming, PIL, SITC, TS Lines
- Turkey routes: MSC, Maersk, CMA CGM, Hapag-Lloyd, ZIM, Arkas, COSCO, Turkon
- Americas: MSC, Maersk, Hapag-Lloyd, CMA CGM, Evergreen, ONE, ZIM

Realistic 2026 container freight rates (${containerCtx} TEU, approximate):
- Asia to Europe: $1,500-3,500
- Asia to US West Coast: $2,000-4,500
- Asia to US East Coast: $3,000-6,000
- Europe to US: $1,800-3,200
- Turkey to Europe: $800-1,800
- Turkey to US: $2,500-4,500
- Intra-Asia: $300-1,200
- Intra-Europe: $500-1,500

Transit times (approximate days):
- Asia to Europe: 28-35 days
- Asia to US West Coast: 14-20 days
- Asia to US East Coast: 25-35 days
- Turkey to Europe: 5-12 days
- Turkey to US: 18-28 days`;

    const prompt = `You are a freight logistics pricing expert. Estimate container shipping costs${commodityCtx} in a ${containerCtx} container from ${origin} to ${destination}.

SHIPMENT DETAILS:
- Planned departure: ${departureMonth} (${departureDateStr})
- Forecast period: ${horizon} months starting from departure date
- Container: ${containerCtx}${commodityCtx ? `\n- Cargo: ${commodityType}` : ''}

REAL MARKET CONDITIONS (use these to calibrate your estimates):
${realDataCtx}
${carrierContext}

IMPORTANT RULES:
- Prices MUST be realistic for this specific route, container size, AND departure season
- ${departureMonth} seasonality: adjust prices based on whether this is peak season (Aug-Oct), shoulder season (Mar-May, Nov), or low season (Jan-Feb, Jun-Jul)
- Use ONLY real carrier names that actually operate on this route
- Transit times must match real vessel schedules
- Carbon footprint: roughly 0.5-1.2 kg CO2 per TEU-km (calculate based on distance)
- Historical data should show realistic seasonal patterns (peak: Aug-Oct, low: Jan-Mar)
- Confidence bands (lower/upper) should be 10-15% from center price

Return ONLY valid JSON:
{
  "trend": "up"|"down"|"stable",
  "confidence": number (60-85, be honest about uncertainty),
  "historicalData": [{"date":"YYYY-MM","price":number}] (6 months before ${departureDateStr}),
  "forecastData": [{"date":"YYYY-MM","price":number,"lower":number,"upper":number}] (${horizon} months starting from ${departureDateStr}),
  "optimizedRoutes": [{"id":"r1","carrier":"real carrier name","transitTime":realistic_days,"price":number,"carbonFootprint":realistic_kgCO2,"reliability":0-100,"tags":["direct"|"transship"|"fastest"|"cheapest"|"eco"]}] (top 3 real carriers for this route, prices for ${departureMonth} departure),
  "insight": "2-3 sentence analysis referencing departure timing (${departureMonth}), seasonal pricing, oil price impact, and route-specific conditions",
  "priceRisk": "LOW"|"MODERATE"|"HIGH",
  "spaceAvailability": "LOW"|"MODERATE"|"HIGH",
  "portIntel": [{"port":"${origin}","status":"congested"|"normal"|"optimal","detail":"specific port condition"},{"port":"${destination}","status":"congested"|"normal"|"optimal","detail":"specific port condition"}]
}`;

    const aiResponse = await gemini.generateText(prompt);
    const parsed = gemini.extractJSON(aiResponse);

    if (!parsed) {
        return res.status(500).json({ error: 'Failed to generate forecast' });
    }

    // Reuse exchange rates already fetched above
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
