/**
 * Settings Service
 * 
 * Since we're using Vercel Serverless (no backend database),
 * settings are returned from local defaults.
 */

export interface SiteSettings {
    company_name: string;
    tagline: string;
    company_email: string;
    company_phone: string;
    whatsapp_number: string;
    linkedin_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    twitter_url?: string;
    facebook_url?: string;
    office_address_en: string;
    office_address_tr: string;
    working_hours_en: string;
    working_hours_tr: string;
    enable_newsletter: boolean;
    enable_whatsapp_button: boolean;
    enable_live_chat: boolean;
    maintenance_mode: boolean;
}

// No backend call - return static settings instantly
const DEFAULT_SETTINGS: SiteSettings = {
    company_name: "LOXTR",
    tagline: "Locate • Obtain • Xport",
    company_email: "info@loxtr.com",
    company_phone: "+90 530 763 5710",
    whatsapp_number: "905307635710",
    office_address_en: "Next Level Loft Office, No:3, Cankaya, Ankara, Turkey",
    office_address_tr: "Next Level Loft Ofis, No:3, Çankaya, Ankara, Türkiye",
    working_hours_en: "Mon-Fri: 09:00 - 18:00",
    working_hours_tr: "Pzt-Cum: 09:00 - 18:00",
    enable_newsletter: true,
    enable_whatsapp_button: true,
    enable_live_chat: false,
    maintenance_mode: false,
    linkedin_url: "https://linkedin.com/company/loxtrcom",
    instagram_url: "https://instagram.com/loxtrcom",
    youtube_url: "https://youtube.com/@loxtrcom"
};

export const settingsService = {
    async getSettings(): Promise<SiteSettings> {
        // Return defaults immediately - no backend needed
        return DEFAULT_SETTINGS;
    }
};
