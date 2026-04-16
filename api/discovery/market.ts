import type { VercelRequest, VercelResponse } from '@vercel/node';
import { comtrade } from '../_utils/comtrade';
import { wits } from '../_utils/wits';
import { gemini } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { product, hsCode, targetMarkets } = req.body;

        if (!product || !targetMarkets || !Array.isArray(targetMarkets) || targetMarkets.length === 0) {
            return res.status(400).json({ error: 'product and targetMarkets[] are required' });
        }

        // Step 1: If no HS code provided, ask Gemini for best match
        let resolvedHsCode = hsCode;
        if (!resolvedHsCode) {
            resolvedHsCode = await resolveHsCode(product);
        }

        // Step 2: Fetch trade data + tariff data in parallel
        const [tradeData, tariffData] = await Promise.all([
            resolvedHsCode
                ? comtrade.getMultiMarketOverview({ targetMarkets, hsCode: resolvedHsCode })
                : Promise.resolve([]),
            resolvedHsCode
                ? wits.getMultiMarketTariffs({ targetMarkets, hsCode: resolvedHsCode })
                : Promise.resolve([]),
        ]);

        // Step 3: Build market intelligence summary with Gemini
        const marketIntel = await buildMarketIntelligence({
            product,
            hsCode: resolvedHsCode,
            targetMarkets,
            tradeData,
            tariffData,
        });

        return res.status(200).json({
            success: true,
            data: {
                product,
                hsCode: resolvedHsCode,
                markets: targetMarkets.map(market => {
                    const trade = tradeData.find(t => t.reporter === market);
                    const tariff = tariffData.find(t => t.reporter === market);

                    return {
                        country: market,
                        trade: trade ? {
                            totalImportValue: trade.totalImportValue,
                            topSuppliers: trade.topSuppliers.slice(0, 5),
                            turkeyPosition: trade.turkeyPosition,
                            period: trade.period,
                        } : null,
                        tariff: tariff ? {
                            mfnRate: tariff.mfnRate,
                            preferentialRate: tariff.preferentialRate,
                            tradeAgreement: tariff.tradeAgreement,
                        } : null,
                    };
                }),
                intelligence: marketIntel,
            },
        });

    } catch (error: any) {
        console.error('Market Overview Error:', error);
        return res.status(500).json({
            error: 'Market analysis failed',
            message: error.message || 'Unknown error',
        });
    }
}

async function resolveHsCode(product: string): Promise<string> {
    const prompt = `You are an international trade expert. What is the most likely HS code (6-digit Harmonized System) for "${product}"?

Return ONLY a JSON object:
{"hsCode": "150910", "description": "Extra virgin olive oil", "chapter": "15 - Animal or vegetable fats"}

Rules: Use the most specific 6-digit code. No markdown.`;

    try {
        const response = await gemini.generateText(prompt);
        const parsed = gemini.extractJSON(response);
        return parsed?.hsCode || '';
    } catch {
        return '';
    }
}

async function buildMarketIntelligence(params: {
    product: string;
    hsCode: string;
    targetMarkets: string[];
    tradeData: any[];
    tariffData: any[];
}): Promise<any> {
    // Build context from real data
    const dataContext = params.targetMarkets.map(market => {
        const trade = params.tradeData.find((t: any) => t.reporter === market);
        const tariff = params.tariffData.find((t: any) => t.reporter === market);

        let ctx = `${market}: `;
        if (trade) {
            ctx += `Total imports $${formatValue(trade.totalImportValue)}. `;
            ctx += `Top suppliers: ${trade.topSuppliers.slice(0, 3).map((s: any) => `${s.country} (${s.share}%)`).join(', ')}. `;
            if (trade.turkeyPosition) {
                ctx += `Turkey rank #${trade.turkeyPosition.rank} with ${trade.turkeyPosition.share}% share ($${formatValue(trade.turkeyPosition.value)}). `;
            } else {
                ctx += `Turkey not in top importers — OPPORTUNITY. `;
            }
        } else {
            ctx += 'No trade data available. ';
        }
        if (tariff?.tradeAgreement) {
            ctx += `Trade agreement: ${tariff.tradeAgreement}. `;
        }
        if (tariff?.mfnRate) {
            ctx += `MFN tariff: ${tariff.mfnRate}%. `;
        }
        return ctx;
    }).join('\n');

    const prompt = `You are a Turkish export intelligence analyst. Based on REAL trade data below, provide strategic insights for a Turkish exporter of "${params.product}" (HS: ${params.hsCode}).

REAL TRADE DATA:
${dataContext}

Provide analysis in this JSON format:
{
  "summary": "2-3 sentence executive summary of the opportunity",
  "opportunityScore": 85,
  "bestMarket": "Country name",
  "bestMarketReason": "Why this is the #1 market",
  "competitiveGaps": ["Gap 1 where Turkey can win", "Gap 2"],
  "risks": ["Risk 1", "Risk 2"],
  "recommendedStrategy": "1-2 sentence go-to-market recommendation",
  "turkeyAdvantages": ["Advantage 1", "Advantage 2"]
}

Rules:
- opportunityScore: 0-100 based on real data (market size, Turkey position, tariff advantage)
- Be specific — reference actual numbers from the data
- competitiveGaps: where current top suppliers are weak and Turkey can compete
- All text in English. No markdown.`;

    try {
        const response = await gemini.generateText(prompt);
        return gemini.extractJSON(response);
    } catch {
        return null;
    }
}

function formatValue(value: number): string {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
}
