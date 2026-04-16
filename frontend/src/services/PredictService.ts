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

// --- Shared Types ---

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

export interface PortIntel {
    port: string;
    status: 'congested' | 'normal' | 'optimal';
    detail: string;
}

// --- Freight Forecast ---

export type ContainerSize = '20ft' | '40ft' | '40ft HC';

export const COMMODITY_TYPES = [
    'General Cargo',
    'Electronics',
    'Textiles & Apparel',
    'Chemicals',
    'Food & Agriculture',
    'Machinery',
    'Automotive Parts',
    'Raw Materials',
    'Pharmaceuticals',
    'Consumer Goods',
] as const;

export type CommodityType = typeof COMMODITY_TYPES[number];

export interface PredictionResult {
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    historicalData: PricePoint[];
    forecastData: PricePoint[];
    optimizedRoutes: RouteOption[];
    modelUsed?: string;
    insight?: string;
    priceRisk?: 'LOW' | 'MODERATE' | 'HIGH';
    spaceAvailability?: 'LOW' | 'MODERATE' | 'HIGH';
    portIntel?: PortIntel[];
}

export interface FreightQueryParams {
    origin: string;
    destination: string;
    horizon?: number;
    commodityType?: CommodityType;
    containerSize?: ContainerSize;
}

export const fetchPredictionData = async (params: FreightQueryParams): Promise<PredictionResult> => {
    const response = await api.post('/predict/freight', {
        origin: params.origin,
        destination: params.destination,
        horizon: params.horizon || 6,
        commodityType: params.commodityType,
        containerSize: params.containerSize,
    });

    const result = response.data;
    if (result.success && result.data) {
        return result.data as PredictionResult;
    }

    throw new Error('Invalid response');
};

// --- Tariff Forecast ---

export interface TariffForecastResult {
    hsCode: string;
    productName?: string;
    trend: string;
    confidence: number;
    currentRate: number;
    forecastData: PricePoint[];
    tradeAgreements?: string[];
    riskFactors?: string[];
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

// --- Market Pulse ---

export interface MarketRoute {
    origin: string;
    destination: string;
    avgPrice: number;
    trend: 'up' | 'down' | 'stable';
    changePercent: number;
}

export interface TradeAlert {
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    date: string;
}

export interface CommodityTrend {
    name: string;
    trend: 'up' | 'down' | 'stable';
    priceChange: number;
}

export interface RealTimeData {
    brentCrude: { current: number; change: number; data: { date: string; price: number }[] } | null;
    supplyChainPressure: { current: number; data: { date: string; value: number }[] } | null;
    dollarIndex: { current: number; change: number } | null;
    exchangeRates: { base: string; date: string; rates: Record<string, number> } | null;
}

export interface MarketPulseResult {
    topRoutes: MarketRoute[];
    volatilityIndex: {
        value: number;
        label: 'LOW' | 'MODERATE' | 'HIGH';
        change: number;
    };
    tradeAlerts: TradeAlert[];
    commodityTrends: CommodityTrend[];
    freightIndex: {
        value: number;
        change: number;
        unit: string;
    };
    summary: string;
    realTimeData?: RealTimeData;
}

export type MarketRegion = 'Global' | 'Asia-Pacific' | 'Europe' | 'Americas' | 'Middle East & Africa';

export const MARKET_REGIONS: MarketRegion[] = [
    'Global',
    'Asia-Pacific',
    'Europe',
    'Americas',
    'Middle East & Africa',
];

export const fetchMarketPulse = async (region?: MarketRegion): Promise<MarketPulseResult> => {
    const response = await api.post('/predict/market-pulse', {
        region: region || 'Global',
    });

    const result = response.data;
    if (result.success && result.data) {
        return result.data as MarketPulseResult;
    }

    throw new Error('Market pulse failed');
};

// --- Prediction History (localStorage) ---

export interface PredictionHistoryEntry {
    id: string;
    type: 'freight' | 'tariff' | 'market-pulse';
    query: Record<string, string>;
    timestamp: number;
    summary: string;
}

const HISTORY_KEY = 'loxtr_predict_history';
const MAX_HISTORY = 5;

export const getPredictionHistory = (): PredictionHistoryEntry[] => {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const savePredictionHistory = (entry: Omit<PredictionHistoryEntry, 'id' | 'timestamp'>): void => {
    const history = getPredictionHistory();
    const newEntry: PredictionHistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
    };
    const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

// --- HS Code Reference Data ---

export const COMMON_HS_CODES = [
    { code: '0201', label: 'Bovine Meat (Fresh)' },
    { code: '0901', label: 'Coffee' },
    { code: '1001', label: 'Wheat' },
    { code: '2709', label: 'Crude Petroleum' },
    { code: '2710', label: 'Petroleum Products' },
    { code: '3004', label: 'Medicaments (Packaged)' },
    { code: '3901', label: 'Polymers of Ethylene' },
    { code: '4011', label: 'Rubber Tires' },
    { code: '5209', label: 'Cotton Fabrics' },
    { code: '6109', label: 'T-Shirts & Vests' },
    { code: '6204', label: 'Women\'s Suits & Dresses' },
    { code: '7207', label: 'Semi-Finished Iron/Steel' },
    { code: '7210', label: 'Flat-Rolled Iron/Steel' },
    { code: '8471', label: 'Computers & Peripherals' },
    { code: '8517', label: 'Telephones & Smartphones' },
    { code: '8528', label: 'Monitors & Projectors' },
    { code: '8703', label: 'Motor Vehicles (Passenger)' },
    { code: '8708', label: 'Vehicle Parts & Accessories' },
    { code: '8901', label: 'Cruise Ships & Cargo Vessels' },
    { code: '9403', label: 'Furniture' },
    { code: '9503', label: 'Toys & Games' },
    { code: '9504', label: 'Gaming Consoles' },
] as const;

export const TRADE_COUNTRIES = [
    'Turkey', 'Germany', 'United States', 'China', 'United Kingdom',
    'France', 'Italy', 'Spain', 'Netherlands', 'Japan',
    'South Korea', 'India', 'Brazil', 'Russia', 'Canada',
    'Australia', 'Mexico', 'Saudi Arabia', 'UAE', 'Egypt',
    'South Africa', 'Indonesia', 'Vietnam', 'Thailand', 'Poland',
] as const;
