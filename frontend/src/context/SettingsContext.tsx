import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settings';
import type { SiteSettings } from '../services/settings';

interface SettingsContextType {
    settings: SiteSettings | null;
    loading: boolean;
    error: string | null;
}

const DEFAULT_SETTINGS: SiteSettings = {
    company_name: "LOXTR",
    tagline: "Locate • Obtain • Xport",
    company_email: "info@loxtr.com",
    company_phone: "+90 5XX XXX XX XX",
    whatsapp_number: "905XXXXXXXXX",
    office_address_en: "Istanbul, Turkey",
    office_address_tr: "İstanbul, Türkiye",
    working_hours_en: "Mon-Fri: 09:00 - 18:00",
    working_hours_tr: "Pzt-Cum: 09:00 - 18:00",
    enable_newsletter: true,
    enable_whatsapp_button: true,
    enable_live_chat: false,
    maintenance_mode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                setSettings(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch settings, using defaults:', err);
                setSettings(DEFAULT_SETTINGS);
                setError('Using offline settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, error }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
