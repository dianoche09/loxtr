import axios from 'axios';

// --- EIA (U.S. Energy Information Administration) ---
// Brent Crude Oil spot price — correlates with fuel surcharge
const EIA_API_KEY = process.env.EIA_API_KEY || '';
const EIA_BASE = 'https://api.eia.gov/v2';

export interface OilPrice {
    date: string;
    price: number;
    change?: number;
}

export const eia = {
    async getBrentCrudePrice(): Promise<OilPrice[]> {
        try {
            const { data } = await axios.get(`${EIA_BASE}/petroleum/pri/spt/data/`, {
                params: {
                    api_key: EIA_API_KEY,
                    frequency: 'daily',
                    'data[0]': 'value',
                    'facets[series][]': 'RBRTE',
                    sort: [{ column: 'period', direction: 'desc' }],
                    length: 30,
                },
                timeout: 10_000,
            });

            const records = data?.response?.data || [];
            return records.map((r: any, idx: number, arr: any[]) => ({
                date: r.period,
                price: parseFloat(r.value),
                change: idx < arr.length - 1
                    ? parseFloat(r.value) - parseFloat(arr[idx + 1]?.value || r.value)
                    : 0,
            }));
        } catch (error) {
            console.error('EIA API error:', error);
            return [];
        }
    },

    async getWTICrudePrice(): Promise<OilPrice[]> {
        try {
            const { data } = await axios.get(`${EIA_BASE}/petroleum/pri/spt/data/`, {
                params: {
                    api_key: EIA_API_KEY,
                    frequency: 'daily',
                    'data[0]': 'value',
                    'facets[series][]': 'RWTC',
                    sort: [{ column: 'period', direction: 'desc' }],
                    length: 30,
                },
                timeout: 10_000,
            });

            const records = data?.response?.data || [];
            return records.map((r: any) => ({
                date: r.period,
                price: parseFloat(r.value),
            }));
        } catch (error) {
            console.error('EIA WTI API error:', error);
            return [];
        }
    },
};

// --- FRED (Federal Reserve Economic Data) ---
// Commodity indices, economic indicators
const FRED_API_KEY = process.env.FRED_API_KEY || '';
const FRED_BASE = 'https://api.stlouisfed.org/fred';

export interface FredObservation {
    date: string;
    value: number;
}

// Key FRED series for freight/trade:
// DCOILBRENTEU — Brent crude (daily)
// PPIACO — Producer Price Index All Commodities
// DTWEXBGS — Trade Weighted Dollar Index
// GACDFSA066MSFRBPHI — Global Supply Chain Pressure Index
export const FRED_SERIES = {
    BRENT_CRUDE: 'DCOILBRENTEU',
    PPI_COMMODITIES: 'PPIACO',
    DOLLAR_INDEX: 'DTWEXBGS',
    SUPPLY_CHAIN_PRESSURE: 'GSCPI',
} as const;

export const fred = {
    async getSeries(seriesId: string, limit = 30): Promise<FredObservation[]> {
        try {
            const { data } = await axios.get(`${FRED_BASE}/series/observations`, {
                params: {
                    series_id: seriesId,
                    api_key: FRED_API_KEY,
                    file_type: 'json',
                    sort_order: 'desc',
                    limit,
                },
                timeout: 10_000,
            });

            return (data?.observations || [])
                .filter((o: any) => o.value !== '.')
                .map((o: any) => ({
                    date: o.date,
                    value: parseFloat(o.value),
                }));
        } catch (error) {
            console.error(`FRED API error [${seriesId}]:`, error);
            return [];
        }
    },

    async getSupplyChainPressure(): Promise<FredObservation[]> {
        return fred.getSeries(FRED_SERIES.SUPPLY_CHAIN_PRESSURE, 12);
    },

    async getDollarIndex(): Promise<FredObservation[]> {
        return fred.getSeries(FRED_SERIES.DOLLAR_INDEX, 30);
    },

    async getPPI(): Promise<FredObservation[]> {
        return fred.getSeries(FRED_SERIES.PPI_COMMODITIES, 12);
    },
};

// --- Frankfurter (ECB Exchange Rates) ---
// No API key needed
const FRANKFURTER_BASE = 'https://api.frankfurter.app';

export interface ExchangeRates {
    base: string;
    date: string;
    rates: Record<string, number>;
}

export interface HistoricalRate {
    date: string;
    rates: Record<string, number>;
}

const FREIGHT_CURRENCIES = ['EUR', 'TRY', 'CNY', 'GBP', 'JPY', 'KRW', 'INR', 'BRL'];

export const frankfurter = {
    async getLatestRates(base = 'USD'): Promise<ExchangeRates> {
        try {
            const { data } = await axios.get(`${FRANKFURTER_BASE}/latest`, {
                params: {
                    from: base,
                    to: FREIGHT_CURRENCIES.join(','),
                },
                timeout: 5_000,
            });
            return data;
        } catch (error) {
            console.error('Frankfurter API error:', error);
            return { base, date: new Date().toISOString().slice(0, 10), rates: {} };
        }
    },

    async getHistoricalRates(base = 'USD', days = 30): Promise<HistoricalRate[]> {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            const { data } = await axios.get(
                `${FRANKFURTER_BASE}/${startDate.toISOString().slice(0, 10)}..${endDate.toISOString().slice(0, 10)}`,
                {
                    params: {
                        from: base,
                        to: 'EUR,TRY,CNY',
                    },
                    timeout: 10_000,
                }
            );

            return Object.entries(data.rates || {}).map(([date, rates]) => ({
                date,
                rates: rates as Record<string, number>,
            }));
        } catch (error) {
            console.error('Frankfurter historical error:', error);
            return [];
        }
    },
};

// --- Interpreted Market Insights ---
// Converts raw data into user-friendly insights

export interface MarketInsight {
    id: string;
    label: string;
    level: 'low' | 'moderate' | 'high';
    impact: string;
    detail: string;
}

export interface CurrencyConversion {
    base: string;
    date: string;
    rates: { currency: string; rate: number; label: string }[];
}

export interface InterpretedMarketData {
    insights: MarketInsight[];
    currencyConversion: CurrencyConversion | null;
}

function interpretBrentCrude(data: OilPrice[]): MarketInsight | null {
    if (data.length < 2) return null;
    const current = data[0].price;
    const prev = data[1].price;
    const changePct = ((current - prev) / prev) * 100;

    let level: 'low' | 'moderate' | 'high';
    let impact: string;
    let detail: string;

    if (changePct > 3) {
        level = 'high';
        impact = `Fuel surcharges likely to increase by ${(changePct * 0.4).toFixed(1)}%`;
        detail = `Oil price jumped ${changePct.toFixed(1)}% to $${current.toFixed(0)}/barrel. Expect higher bunker fuel costs reflected in freight rates within 2-4 weeks.`;
    } else if (changePct > 0.5) {
        level = 'moderate';
        impact = `Minor fuel surcharge pressure (+${(changePct * 0.4).toFixed(1)}%)`;
        detail = `Oil at $${current.toFixed(0)}/barrel, up ${changePct.toFixed(1)}%. Fuel costs trending slightly higher but within normal range.`;
    } else if (changePct < -3) {
        level = 'low';
        impact = `Fuel surcharges may decrease by ${(Math.abs(changePct) * 0.4).toFixed(1)}%`;
        detail = `Oil dropped ${Math.abs(changePct).toFixed(1)}% to $${current.toFixed(0)}/barrel. Potential freight cost savings ahead.`;
    } else {
        level = 'low';
        impact = 'Fuel costs stable — no surcharge impact expected';
        detail = `Oil steady at $${current.toFixed(0)}/barrel (${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%). No significant fuel surcharge changes expected.`;
    }

    return { id: 'fuel-surcharge', label: 'Fuel Surcharge Risk', level, impact, detail };
}

function interpretSupplyChain(data: FredObservation[]): MarketInsight | null {
    if (data.length === 0) return null;
    const current = data[0].value;

    let level: 'low' | 'moderate' | 'high';
    let impact: string;
    let detail: string;

    if (current > 1.5) {
        level = 'high';
        impact = 'Significant delays and capacity constraints expected';
        detail = `Supply chain pressure index at ${current.toFixed(2)} — well above normal. Expect congestion, longer transit times, and premium pricing on major routes.`;
    } else if (current > 0.5) {
        level = 'moderate';
        impact = 'Some routes may experience minor delays';
        detail = `Supply chain pressure at ${current.toFixed(2)} — slightly elevated. Localized congestion possible on high-demand corridors.`;
    } else if (current < -0.5) {
        level = 'low';
        impact = 'Excess capacity — favorable conditions for shippers';
        detail = `Supply chain pressure at ${current.toFixed(2)} — below average. Carriers have excess capacity, good time to negotiate rates.`;
    } else {
        level = 'low';
        impact = 'Supply chain operating normally';
        detail = `Supply chain pressure index at ${current.toFixed(2)} — within normal range. No significant disruptions detected.`;
    }

    return { id: 'supply-chain', label: 'Supply Chain Status', level, impact, detail };
}

function interpretDollarIndex(current: number, changePct: number): MarketInsight | null {
    let level: 'low' | 'moderate' | 'high';
    let impact: string;
    let detail: string;

    if (changePct > 1) {
        level = 'moderate';
        impact = `Stronger USD makes imports cheaper for US buyers, costlier for others`;
        detail = `Dollar index up ${changePct.toFixed(1)}% to ${current.toFixed(1)}. EUR and TRY-denominated freight becomes relatively cheaper in USD terms.`;
    } else if (changePct < -1) {
        level = 'moderate';
        impact = `Weaker USD benefits non-US exporters`;
        detail = `Dollar index down ${Math.abs(changePct).toFixed(1)}% to ${current.toFixed(1)}. Good for Turkey/EU exporters — your goods become more competitive in USD markets.`;
    } else {
        level = 'low';
        impact = 'Currency markets stable — no significant freight cost impact';
        detail = `Dollar index at ${current.toFixed(1)} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%). Exchange rate impact on freight costs is minimal.`;
    }

    return { id: 'currency-impact', label: 'Currency Impact', level, impact, detail };
}

export async function getInterpretedMarketData(): Promise<InterpretedMarketData> {
    const [brentData, scpData, dollarData, fxData] = await Promise.all([
        eia.getBrentCrudePrice(),
        fred.getSupplyChainPressure(),
        fred.getDollarIndex(),
        frankfurter.getLatestRates(),
    ]);

    const insights: MarketInsight[] = [];

    // Fuel surcharge insight
    const fuelInsight = interpretBrentCrude(brentData);
    if (fuelInsight) insights.push(fuelInsight);

    // Supply chain status
    const scInsight = interpretSupplyChain(scpData);
    if (scInsight) insights.push(scInsight);

    // Currency impact
    if (dollarData.length > 1) {
        const changePct = ((dollarData[0].value - dollarData[1].value) / dollarData[1].value) * 100;
        const currencyInsight = interpretDollarIndex(dollarData[0].value, changePct);
        if (currencyInsight) insights.push(currencyInsight);
    }

    // Currency conversion
    let currencyConversion: CurrencyConversion | null = null;
    if (Object.keys(fxData.rates).length > 0) {
        currencyConversion = {
            base: fxData.base,
            date: fxData.date,
            rates: [
                { currency: 'EUR', rate: fxData.rates.EUR, label: 'Euro' },
                { currency: 'TRY', rate: fxData.rates.TRY, label: 'Turkish Lira' },
                { currency: 'CNY', rate: fxData.rates.CNY, label: 'Chinese Yuan' },
                { currency: 'GBP', rate: fxData.rates.GBP, label: 'British Pound' },
            ].filter(r => r.rate),
        };
    }

    return { insights, currencyConversion };
}
