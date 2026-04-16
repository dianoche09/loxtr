import axios from 'axios';

const WITS_BASE = 'https://wits.worldbank.org/API/V1';

interface TariffInfo {
    reporter: string;
    partner: string;
    product: string;
    hsCode: string;
    year: number;
    simpleAverage: number;
    weightedAverage: number;
    mfnRate: number;
    preferentialRate: number | null;
    tradeAgreement: string | null;
}

// ISO3 codes for WITS API
const COUNTRY_ISO3: Record<string, string> = {
    'Germany': 'DEU', 'France': 'FRA', 'Italy': 'ITA', 'Spain': 'ESP',
    'United Kingdom': 'GBR', 'UK': 'GBR', 'Netherlands': 'NLD', 'Belgium': 'BEL',
    'Poland': 'POL', 'Austria': 'AUT', 'Sweden': 'SWE', 'Denmark': 'DNK',
    'Finland': 'FIN', 'Norway': 'NOR', 'Switzerland': 'CHE', 'Portugal': 'PRT',
    'Greece': 'GRC', 'Czech Republic': 'CZE', 'Romania': 'ROU', 'Hungary': 'HUN',
    'USA': 'USA', 'United States': 'USA', 'Canada': 'CAN', 'Mexico': 'MEX',
    'Brazil': 'BRA', 'Argentina': 'ARG', 'China': 'CHN', 'Japan': 'JPN',
    'South Korea': 'KOR', 'India': 'IND', 'Turkey': 'TUR', 'Russia': 'RUS',
    'Australia': 'AUS', 'New Zealand': 'NZL', 'South Africa': 'ZAF',
    'Saudi Arabia': 'SAU', 'UAE': 'ARE', 'United Arab Emirates': 'ARE',
    'Egypt': 'EGY', 'Nigeria': 'NGA', 'Kenya': 'KEN', 'Morocco': 'MAR',
    'Israel': 'ISR', 'Iraq': 'IRQ', 'Iran': 'IRN', 'Pakistan': 'PAK',
    'Indonesia': 'IDN', 'Thailand': 'THA', 'Vietnam': 'VNM', 'Malaysia': 'MYS',
    'Singapore': 'SGP', 'Philippines': 'PHL', 'Colombia': 'COL', 'Chile': 'CHL',
};

// Known trade agreements with Turkey
const TURKEY_AGREEMENTS: Record<string, string> = {
    'DEU': 'EU-Turkey Customs Union (0% industrial goods)',
    'FRA': 'EU-Turkey Customs Union (0% industrial goods)',
    'ITA': 'EU-Turkey Customs Union (0% industrial goods)',
    'ESP': 'EU-Turkey Customs Union (0% industrial goods)',
    'GBR': 'UK-Turkey FTA (2021)',
    'NLD': 'EU-Turkey Customs Union (0% industrial goods)',
    'BEL': 'EU-Turkey Customs Union (0% industrial goods)',
    'POL': 'EU-Turkey Customs Union (0% industrial goods)',
    'AUT': 'EU-Turkey Customs Union (0% industrial goods)',
    'SWE': 'EU-Turkey Customs Union (0% industrial goods)',
    'DNK': 'EU-Turkey Customs Union (0% industrial goods)',
    'FIN': 'EU-Turkey Customs Union (0% industrial goods)',
    'NOR': 'EFTA-Turkey FTA',
    'CHE': 'EFTA-Turkey FTA',
    'PRT': 'EU-Turkey Customs Union (0% industrial goods)',
    'GRC': 'EU-Turkey Customs Union (0% industrial goods)',
    'CZE': 'EU-Turkey Customs Union (0% industrial goods)',
    'ROU': 'EU-Turkey Customs Union (0% industrial goods)',
    'HUN': 'EU-Turkey Customs Union (0% industrial goods)',
    'KOR': 'Turkey-South Korea FTA (2013)',
    'MYS': 'Turkey-Malaysia FTA (2015)',
    'SGP': 'Turkey-Singapore FTA (2017)',
    'CHL': 'Turkey-Chile FTA (2011)',
    'EGY': 'Turkey-Egypt FTA (2007)',
    'MAR': 'Turkey-Morocco FTA (2006)',
    'ISR': 'Turkey-Israel FTA (1997)',
};

function getISO3(country: string): string | null {
    if (COUNTRY_ISO3[country]) return COUNTRY_ISO3[country];
    const lower = country.toLowerCase();
    for (const [key, code] of Object.entries(COUNTRY_ISO3)) {
        if (key.toLowerCase() === lower) return code;
    }
    return null;
}

export const wits = {
    /**
     * Get tariff rates for a specific HS code between two countries
     * WITS API returns XML by default, we parse it
     */
    async getTariffRate(params: {
        reporterCountry: string;
        partnerCountry?: string;
        hsCode: string;
        year?: number;
    }): Promise<TariffInfo | null> {
        const reporterIso = getISO3(params.reporterCountry);
        if (!reporterIso) return null;

        const partnerIso = params.partnerCountry ? getISO3(params.partnerCountry) : 'TUR';
        const year = params.year || new Date().getFullYear() - 1;
        const hsCode = params.hsCode.substring(0, 6);

        try {
            // WITS tariff endpoint
            const url = `${WITS_BASE}/SDMX/V21/datasource/tradestats-tariff/reporter/${reporterIso}/year/${year}/partner/${partnerIso}/product/${hsCode}`;

            const { data } = await axios.get(url, {
                timeout: 15_000,
                headers: { 'Accept': 'application/json' },
            });

            // Parse WITS response (complex SDMX format)
            const observations = data?.dataSets?.[0]?.observations || {};
            const mfnRate = extractRate(observations, 'MFN');
            const prefRate = extractRate(observations, 'PRF');

            const tradeAgreement = TURKEY_AGREEMENTS[reporterIso] || null;

            return {
                reporter: params.reporterCountry,
                partner: params.partnerCountry || 'Turkey',
                product: '',
                hsCode: params.hsCode,
                year,
                simpleAverage: mfnRate,
                weightedAverage: mfnRate,
                mfnRate,
                preferentialRate: prefRate || (tradeAgreement?.includes('0%') ? 0 : null),
                tradeAgreement,
            };
        } catch (error: any) {
            // WITS API can be unreliable — fallback to known agreements
            const tradeAgreement = TURKEY_AGREEMENTS[reporterIso || ''] || null;

            return {
                reporter: params.reporterCountry,
                partner: params.partnerCountry || 'Turkey',
                product: '',
                hsCode: params.hsCode,
                year,
                simpleAverage: 0,
                weightedAverage: 0,
                mfnRate: 0,
                preferentialRate: tradeAgreement?.includes('0%') ? 0 : null,
                tradeAgreement,
            };
        }
    },

    /**
     * Get tariff info for multiple target markets at once
     */
    async getMultiMarketTariffs(params: {
        targetMarkets: string[];
        hsCode: string;
        partnerCountry?: string;
    }): Promise<TariffInfo[]> {
        const results = await Promise.allSettled(
            params.targetMarkets.map(country =>
                this.getTariffRate({
                    reporterCountry: country,
                    partnerCountry: params.partnerCountry || 'Turkey',
                    hsCode: params.hsCode,
                })
            )
        );

        return results
            .filter((r): r is PromiseFulfilledResult<TariffInfo | null> => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value!);
    },

    /**
     * Get known trade agreement between Turkey and a country
     */
    getTradeAgreement(country: string): string | null {
        const iso = getISO3(country);
        if (!iso) return null;
        return TURKEY_AGREEMENTS[iso] || null;
    },

    getISO3,
};

// Helper to extract rate from WITS SDMX observations
function extractRate(observations: any, type: string): number {
    try {
        for (const key of Object.keys(observations)) {
            const val = observations[key];
            if (Array.isArray(val) && val.length > 0) {
                const rate = parseFloat(val[0]);
                if (!isNaN(rate)) return rate;
            }
        }
    } catch {
        // WITS response format varies
    }
    return 0;
}
