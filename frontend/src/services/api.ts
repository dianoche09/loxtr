/**
 * API Client
 * 
 * Centralized API service using fetch.
 * Uses Vercel Serverless Functions for form submissions.
 */

// For Vercel deployment, use relative paths for API routes
const API_BASE_URL: string = '/api';

class APIClient {
    baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    /**
     * Make API request
     */
    async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        // Ensure endpoint starts with /
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.baseURL}${cleanEndpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Language': this.getLanguage(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            // Handle rate limiting
            if (response.status === 429) {
                const error = await response.json();
                throw new Error(error.error || 'Rate limit exceeded');
            }

            // Handle errors
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.message || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint: string, params: Record<string, any> = {}): Promise<any> {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint: string, data: any = {}): Promise<any> {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     */
    async put(endpoint: string, data: any = {}): Promise<any> {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint: string): Promise<any> {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Get current language from path
     */
    getLanguage(): string {
        if (typeof window === 'undefined') return 'en';

        const path = window.location.pathname;
        if (path.startsWith('/tr/')) return 'tr';
        if (path.startsWith('/en/')) return 'en';
        return 'en';
    }

    /**
     * Get current page name for form tracking
     */
    getCurrentPage(): string {
        if (typeof window === 'undefined') return 'Unknown';
        return window.location.pathname || 'Homepage';
    }
}

// Create and export singleton instance
const api = new APIClient(API_BASE_URL);

export default api;

/**
 * Form submission APIs - use Vercel Serverless Functions
 */

export const contactAPI = {
    submit: (data: any) => api.post('/contact', {
        ...data,
        page: api.getCurrentPage()
    }),
};

export const applicationsAPI = {
    submit: (data: any) => api.post('/application', {
        ...data,
        page: api.getCurrentPage()
    }),
};

export const newsletterAPI = {
    subscribe: (email: string) => api.post('/newsletter', {
        email,
        page: api.getCurrentPage()
    }),
};

/**
 * Static data APIs - these don't need backend, data is in frontend
 */

export const geoAPI = {
    // Geo detection via browser - no backend needed
    detect: async () => {
        try {
            // Use browser's language as fallback
            const lang = navigator.language?.split('-')[0] || 'en';
            return {
                country_code: 'UNKNOWN',
                visitor_type: 'GLOBAL',
                default_language: lang === 'tr' ? 'tr' : 'en',
            };
        } catch {
            return {
                country_code: 'UNKNOWN',
                visitor_type: 'GLOBAL',
                default_language: 'en',
            };
        }
    },
};

// These are not used in current implementation - keeping for compatibility
export const brandsAPI = {
    list: async () => ({ results: [] }),
    detail: async () => null,
    featured: async () => ({ results: [] }),
};

export const productsAPI = {
    list: async () => ({ results: [] }),
    detail: async () => null,
};

export const categoriesAPI = {
    list: async () => ({ results: [] }),
};

export const searchAPI = {
    query: async () => [],
};
