import axios from 'axios';

const FORECAST_URL = process.env.FORECAST_SERVICE_URL || 'http://localhost:8200';
const FORECAST_KEY = process.env.FORECAST_API_KEY || '';

const client = axios.create({
    baseURL: FORECAST_URL,
    timeout: 120_000,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': FORECAST_KEY,
    },
});

export interface PricePoint {
    date: string;
    price: number;
    lower?: number;
    upper?: number;
}

export interface RouteOption {
    id: string;
    carrier: string;
    transit_time: number;
    price: number;
    carbon_footprint: number;
    reliability: number;
    tags: string[];
}

export interface ForecastResult {
    trend: string;
    confidence: number;
    historical_data: PricePoint[];
    forecast_data: PricePoint[];
    optimized_routes: RouteOption[];
    model_used: string;
    insight: string;
}

export interface TariffForecastResult {
    hs_code: string;
    trend: string;
    confidence: number;
    current_rate: number;
    forecast_data: PricePoint[];
    model_used: string;
    insight: string;
}

export const forecast = {
    async freightForecast(origin: string, destination: string, horizon = 6, historicalPrices?: PricePoint[]): Promise<ForecastResult> {
        const { data } = await client.post<ForecastResult>('/forecast/freight', {
            origin,
            destination,
            horizon,
            historical_prices: historicalPrices || null,
        });
        return data;
    },

    async tariffForecast(hsCode: string, originCountry: string, destCountry: string, horizon = 12): Promise<TariffForecastResult> {
        const { data } = await client.post<TariffForecastResult>('/forecast/tariff', {
            hs_code: hsCode,
            origin_country: originCountry,
            destination_country: destCountry,
            horizon,
        });
        return data;
    },

    async isHealthy(): Promise<boolean> {
        try {
            const { data } = await client.get('/health', { timeout: 5_000 });
            return data?.status === 'ok';
        } catch {
            return false;
        }
    },
};
