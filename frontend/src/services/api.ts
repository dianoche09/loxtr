/**
 * API Client
 * 
 * Centralized API service using fetch.
 * Handles authentication, error handling, and request formatting.
 */

const API_BASE_URL: string = (import.meta as any).env.VITE_API_BASE_URL || 'https://www.loxtr.com/api/v1';

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
}

// Create and export singleton instance
const api = new APIClient(API_BASE_URL);

export default api;

/**
 * Convenience exports for specific endpoints
 */

export const geoAPI = {
    detect: () => api.get('/geo/detect/'),
};

export const brandsAPI = {
    list: (params?: Record<string, any>) => api.get('/brands/', params),
    detail: (id: string | number) => api.get(`/brands/${id}/`),
    featured: () => api.get('/brands/featured/'),
};

export const productsAPI = {
    list: (params?: Record<string, any>) => api.get('/products/', params),
    detail: (id: string | number) => api.get(`/products/${id}/`),
};

export const categoriesAPI = {
    list: () => api.get('/categories/'),
};

export const applicationsAPI = {
    submit: (data: any) => api.post('/applications/submit/', data),
};

export const contactAPI = {
    submit: (data: any) => api.post('/contact/submit/', data),
};

export const searchAPI = {
    query: (q: string, params?: Record<string, any>) => api.get('/search/', { q, ...params }),
};
