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

// --- Aggregated Market Snapshot ---
// Combines all sources into a single market overview
export interface MarketSnapshot {
    brentCrude: { current: number; change: number; data: OilPrice[] } | null;
    supplyChainPressure: { current: number; data: FredObservation[] } | null;
    dollarIndex: { current: number; change: number } | null;
    exchangeRates: ExchangeRates | null;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
    const [brentData, scpData, dollarData, fxData] = await Promise.all([
        eia.getBrentCrudePrice(),
        fred.getSupplyChainPressure(),
        fred.getDollarIndex(),
        frankfurter.getLatestRates(),
    ]);

    return {
        brentCrude: brentData.length > 0
            ? {
                current: brentData[0].price,
                change: brentData.length > 1
                    ? Number(((brentData[0].price - brentData[1].price) / brentData[1].price * 100).toFixed(2))
                    : 0,
                data: brentData.slice(0, 14),
            }
            : null,
        supplyChainPressure: scpData.length > 0
            ? { current: scpData[0].value, data: scpData }
            : null,
        dollarIndex: dollarData.length > 1
            ? {
                current: dollarData[0].value,
                change: Number(((dollarData[0].value - dollarData[1].value) / dollarData[1].value * 100).toFixed(2)),
            }
            : null,
        exchangeRates: Object.keys(fxData.rates).length > 0 ? fxData : null,
    };
}
