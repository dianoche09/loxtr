import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120_000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
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
    transitTime: number;
    price: number;
    carbonFootprint: number;
    reliability: number;
    tags: string[];
}

export interface PredictionResult {
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    historicalData: PricePoint[];
    forecastData: PricePoint[];
    optimizedRoutes: RouteOption[];
    modelUsed?: string;
    insight?: string;
}

export const fetchPredictionData = async (origin: string, destination: string): Promise<PredictionResult> => {
    try {
        const response = await api.post('/predict/freight', {
            origin,
            destination,
            horizon: 6,
        });

        const result = response.data;

        if (result.success && result.data) {
            return result.data as PredictionResult;
        }

        throw new Error('Invalid response');
    } catch (error: any) {
        // If API unavailable, log and throw so the dashboard shows error state
        console.error('Predict API error:', error?.response?.data || error.message);
        throw error;
    }
};

export interface TariffForecastResult {
    hsCode: string;
    trend: string;
    confidence: number;
    currentRate: number;
    forecastData: PricePoint[];
    modelUsed?: string;
    insight?: string;
}

export const fetchTariffForecast = async (
    hsCode: string,
    originCountry: string,
    destinationCountry: string,
    horizon = 12
): Promise<TariffForecastResult> => {
    const response = await api.post('/predict/tariff', {
        hsCode,
        originCountry,
        destinationCountry,
        horizon,
    });

    const result = response.data;
    if (result.success && result.data) {
        return result.data as TariffForecastResult;
    }

    throw new Error('Tariff forecast failed');
};
