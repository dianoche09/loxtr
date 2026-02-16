export interface Importer {
    id: string;
    companyName: string;
    country: string;
    lastShipmentDate: string;
    hscode: string;
    confidenceScore: number;
    type: 'Direct Importer' | 'Broker' | 'Freight Forwarder';
    intelligence?: {
        competitorCountry: string;
        transitTimeAsia: number;
        transitTimeTurkey: number;
        marketShareTurkey: number;
        topPainPoint: string;
        valueProposition: string;
        growthSignal: string;
    }
}

export const fetchRadarData = async (query: string): Promise<Importer[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const rawData = [
        {
            id: '1', name: 'Global Foods GmbH', country: 'Germany', date: '2026-02-10', score: 98, type: 'Direct Importer',
            intel: {
                competitorCountry: 'China',
                transitTimeAsia: 45,
                transitTimeTurkey: 12,
                marketShareTurkey: 15,
                topPainPoint: 'Long lead times are causing inventory bottlenecks.',
                valueProposition: 'Switching to Turkey reduces inventory cost by 22% via 30-day faster delivery.',
                growthSignal: 'Import volume increased by 18% in the last quarter.'
            }
        },
        {
            id: '3', name: 'Organic Trades LLC', country: 'USA', date: '2026-02-12', score: 85, type: 'Direct Importer',
            intel: {
                competitorCountry: 'India',
                transitTimeAsia: 35,
                transitTimeTurkey: 20,
                marketShareTurkey: 5,
                topPainPoint: 'Quality consistency issues with current Asian suppliers.',
                valueProposition: 'Verified Turkish Premium quality with faster air-freight options via LOXTR Hub.',
                growthSignal: 'Expanding organic product line; actively seeking new EU/TR suppliers.'
            }
        },
        {
            id: '5', name: 'Euro Hazelnut Importers', country: 'Italy', date: '2026-02-09', score: 92, type: 'Direct Importer',
            intel: {
                competitorCountry: 'USA (Oregon)',
                transitTimeAsia: 28,
                transitTimeTurkey: 4,
                marketShareTurkey: 65,
                topPainPoint: 'Rising logistics costs from North America.',
                valueProposition: 'Zero-tariff advantage and 4-day trucking delivery from Black Sea region.',
                growthSignal: 'Seasonal peak approaching; sourcing 200+ tons additional capacity.'
            }
        },
    ];

    const filteredData = query
        ? rawData.filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.country.toLowerCase().includes(query.toLowerCase()))
        : rawData;

    return filteredData.map(item => ({
        id: item.id,
        companyName: item.name,
        country: item.country,
        lastShipmentDate: item.date,
        hscode: '0802.22',
        confidenceScore: item.score,
        type: item.type as any,
        intelligence: item.intel
    }));
};
