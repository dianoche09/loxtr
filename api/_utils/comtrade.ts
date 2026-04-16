import axios from 'axios';

const COMTRADE_BASE = 'https://comtradeapi.un.org/public/v1/preview';

interface TradeFlow {
    reporterCode: number;
    reporterDesc: string;
    partnerCode: number;
    partnerDesc: string;
    flowCode: string;
    flowDesc: string;
    cmdCode: string;
    cmdDesc: string;
    period: number;
    primaryValue: number;
    netWgt: number;
    qty: number;
    qtyUnitAbbr: string;
}

interface MarketOverview {
    totalImportValue: number;
    totalExportValue: number;
    topSuppliers: Array<{
        country: string;
        value: number;
        share: number;
        netWeight: number;
    }>;
    turkeyPosition: {
        rank: number;
        value: number;
        share: number;
        trend: string;
    } | null;
    period: number;
    hsCode: string;
    reporter: string;
}

// ISO3 country name → UN Comtrade reporter code mapping (most common trade partners)
const COUNTRY_CODES: Record<string, number> = {
    'Germany': 276, 'France': 251, 'Italy': 381, 'Spain': 724,
    'United Kingdom': 826, 'UK': 826, 'Netherlands': 528, 'Belgium': 56,
    'Poland': 616, 'Austria': 40, 'Sweden': 752, 'Denmark': 208,
    'Finland': 246, 'Norway': 578, 'Switzerland': 756, 'Portugal': 620,
    'Greece': 300, 'Czech Republic': 203, 'Romania': 642, 'Hungary': 348,
    'USA': 842, 'United States': 842, 'Canada': 124, 'Mexico': 484,
    'Brazil': 76, 'Argentina': 32, 'China': 156, 'Japan': 392,
    'South Korea': 410, 'India': 356, 'Turkey': 792, 'Russia': 643,
    'Australia': 36, 'New Zealand': 554, 'South Africa': 710,
    'Saudi Arabia': 682, 'UAE': 784, 'United Arab Emirates': 784,
    'Egypt': 818, 'Nigeria': 566, 'Kenya': 404, 'Morocco': 504,
    'Israel': 376, 'Iraq': 368, 'Iran': 364, 'Pakistan': 586,
    'Indonesia': 360, 'Thailand': 764, 'Vietnam': 704, 'Malaysia': 458,
    'Singapore': 702, 'Philippines': 608, 'Colombia': 170, 'Chile': 152,
    'Peru': 604, 'Ukraine': 804, 'Ireland': 372, 'Croatia': 191,
    'Bulgaria': 100, 'Slovakia': 703, 'Slovenia': 705, 'Lithuania': 440,
    'Latvia': 428, 'Estonia': 233, 'Luxembourg': 442, 'Malta': 470,
    'Cyprus': 196, 'Iceland': 352, 'Albania': 8, 'Serbia': 688,
    'Bosnia': 70, 'Montenegro': 499, 'North Macedonia': 807,
    'Tunisia': 788, 'Algeria': 12, 'Libya': 434, 'Jordan': 400,
    'Lebanon': 422, 'Kuwait': 414, 'Qatar': 634, 'Bahrain': 48,
    'Oman': 512, 'Bangladesh': 50, 'Sri Lanka': 144,
    'Taiwan': 158, 'Hong Kong': 344,
};

const TURKEY_CODE = 792;

function getCountryCode(name: string): number | null {
    // Direct match
    if (COUNTRY_CODES[name]) return COUNTRY_CODES[name];
    // Case-insensitive search
    const lower = name.toLowerCase();
    for (const [key, code] of Object.entries(COUNTRY_CODES)) {
        if (key.toLowerCase() === lower) return code;
    }
    return null;
}

export const comtrade = {
    /**
     * Get import data for a specific country and HS code
     * Uses the free preview endpoint (no API key needed, limited results)
     */
    async getImports(params: {
        reporterCountry: string;
        hsCode: string;
        year?: number;
    }): Promise<TradeFlow[]> {
        const reporterCode = getCountryCode(params.reporterCountry);
        if (!reporterCode) return [];

        const year = params.year || new Date().getFullYear() - 1;
        // Use 4-digit HS code for broader results
        const hsCode = params.hsCode.substring(0, 4);

        try {
            const { data } = await axios.get(COMTRADE_BASE + '/C/A/HS', {
                params: {
                    reporterCode,
                    period: year,
                    cmdCode: hsCode,
                    flowCode: 'M', // M = imports
                    partnerCode: 0, // 0 = World (all partners)
                    partner2Code: 0,
                    motCode: 0,
                    customsCode: 'C00',
                },
                timeout: 15_000,
            });

            return (data?.data || []) as TradeFlow[];
        } catch (error: any) {
            // Try previous year if current year has no data
            if (year === new Date().getFullYear() - 1) {
                try {
                    const { data } = await axios.get(COMTRADE_BASE + '/C/A/HS', {
                        params: {
                            reporterCode,
                            period: year - 1,
                            cmdCode: hsCode,
                            flowCode: 'M',
                            partnerCode: 0,
                            partner2Code: 0,
                            motCode: 0,
                            customsCode: 'C00',
                        },
                        timeout: 15_000,
                    });
                    return (data?.data || []) as TradeFlow[];
                } catch {
                    return [];
                }
            }
            console.error('Comtrade API error:', error.message);
            return [];
        }
    },

    /**
     * Build a market overview: total import value, top suppliers, Turkey's position
     */
    async getMarketOverview(params: {
        reporterCountry: string;
        hsCode: string;
    }): Promise<MarketOverview | null> {
        const flows = await this.getImports(params);

        if (!flows || flows.length === 0) return null;

        // Separate world total from individual partners
        const worldFlow = flows.find(f => f.partnerCode === 0 || f.partnerDesc === 'World');
        const partnerFlows = flows
            .filter(f => f.partnerCode !== 0 && f.partnerDesc !== 'World')
            .sort((a, b) => (b.primaryValue || 0) - (a.primaryValue || 0));

        const totalImportValue = worldFlow?.primaryValue || partnerFlows.reduce((sum, f) => sum + (f.primaryValue || 0), 0);

        // Top 10 suppliers with market share
        const topSuppliers = partnerFlows.slice(0, 10).map(f => ({
            country: f.partnerDesc,
            value: f.primaryValue || 0,
            share: totalImportValue > 0 ? Math.round(((f.primaryValue || 0) / totalImportValue) * 1000) / 10 : 0,
            netWeight: f.netWgt || 0,
        }));

        // Find Turkey's position
        const turkeyFlow = partnerFlows.find(f => f.partnerCode === TURKEY_CODE);
        const turkeyRank = turkeyFlow
            ? partnerFlows.findIndex(f => f.partnerCode === TURKEY_CODE) + 1
            : null;

        const turkeyPosition = turkeyFlow ? {
            rank: turkeyRank || 0,
            value: turkeyFlow.primaryValue || 0,
            share: totalImportValue > 0 ? Math.round(((turkeyFlow.primaryValue || 0) / totalImportValue) * 1000) / 10 : 0,
            trend: 'stable', // Will be enriched with multi-year comparison later
        } : null;

        return {
            totalImportValue,
            totalExportValue: 0,
            topSuppliers,
            turkeyPosition,
            period: flows[0]?.period || new Date().getFullYear() - 1,
            hsCode: params.hsCode,
            reporter: params.reporterCountry,
        };
    },

    /**
     * Get market overview for multiple target countries at once
     */
    async getMultiMarketOverview(params: {
        targetMarkets: string[];
        hsCode: string;
    }): Promise<MarketOverview[]> {
        const results = await Promise.allSettled(
            params.targetMarkets.map(country =>
                this.getMarketOverview({ reporterCountry: country, hsCode: params.hsCode })
            )
        );

        return results
            .filter((r): r is PromiseFulfilledResult<MarketOverview | null> => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value!);
    },

    getCountryCode,
};
