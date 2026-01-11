/**
 * Geo Context Provider
 * 
 * Provides geo-location data to all components.
 * Fetches data from API on mount.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface GeoData {
    countryCode: string | null;
    visitorType: string | null;
    defaultLanguage: string;
    loading: boolean;
    error: string | null;
}

interface GeoContextType extends GeoData {
    isGlobal: boolean;
    isLocal: boolean;
    isTurkish: boolean;
}

const GeoContext = createContext<GeoContextType | undefined>(undefined);

export const useGeo = () => {
    const context = useContext(GeoContext);
    if (!context) {
        throw new Error('useGeo must be used within GeoProvider');
    }
    return context;
};

export const GeoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [geoData, setGeoData] = useState<GeoData>({
        countryCode: null,
        visitorType: null,
        defaultLanguage: 'en',
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchGeoData = async () => {
            try {
                const response = await api.get('/geo/detect/');

                setGeoData({
                    countryCode: response.country_code || 'US',
                    visitorType: response.visitor_type || 'GLOBAL',
                    defaultLanguage: response.default_language || 'en',
                    loading: false,
                    error: null,
                });

                console.log('🌍 Geo detected:', response);
            } catch (error: any) {
                console.warn('⚠️ Geo-detection unavailable, using defaults:', error.message);

                // Fallback to defaults based on browser language if possible
                const isTr = navigator.language?.startsWith('tr');

                setGeoData({
                    countryCode: isTr ? 'TR' : 'US',
                    visitorType: isTr ? 'LOCAL' : 'GLOBAL',
                    defaultLanguage: isTr ? 'tr' : 'en',
                    loading: false,
                    error: 'Geo-detection offline',
                });
            }
        };

        fetchGeoData();
    }, []);

    const isGlobal = geoData.visitorType === 'GLOBAL';
    const isLocal = geoData.visitorType === 'LOCAL';
    const isTurkish = geoData.countryCode === 'TR';

    return (
        <GeoContext.Provider
            value={{
                ...geoData,
                isGlobal,
                isLocal,
                isTurkish,
            }}
        >
            {children}
        </GeoContext.Provider>
    );
};
