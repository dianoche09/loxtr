

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

export const settingsService = {
    async getSettings(): Promise<SiteSettings> {
        const response = await fetch(`${API_URL}/settings/`);
        if (!response.ok) {
            throw new Error(`Failed to fetch settings: ${response.statusText}`);
        }
        return response.json();
    }
};
