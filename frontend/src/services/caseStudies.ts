
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface CaseStudy {
    id: number;
    slug: string;
    title_en: string;
    title_tr: string;
    client_company: string;
    client_industry: string;
    client_country: string;
    client_logo: string | null;
    case_type: 'market_entry' | 'export';
    challenge_en: string;
    challenge_tr: string;
    solution_en: string;
    solution_tr: string;
    result_en: string;
    result_tr: string;
    metrics: Record<string, any>;
    testimonial_text_en?: string;
    testimonial_text_tr?: string;
    testimonial_author?: string;
    testimonial_role?: string;
    featured_image: string | null;
    gallery_images: string[];
    is_featured: boolean;
    meta_title_en?: string;
    meta_description_en?: string;
    meta_title_tr?: string;
    meta_description_tr?: string;
    created_at: string;
}

export const caseStudiesService = {
    async getCaseStudies(params?: { type?: string; featured?: boolean; industry?: string }): Promise<CaseStudy[]> {
        const url = new URL(`${API_URL}/case-studies/`);
        if (params) {
            Object.keys(params).forEach(key =>
                url.searchParams.append(key, String(params[key as keyof typeof params]))
            );
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Failed to fetch case studies: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results || data;
    },

    async getCaseStudyBySlug(slug: string): Promise<CaseStudy> {
        const response = await fetch(`${API_URL}/case-studies/${slug}/`);
        if (!response.ok) {
            throw new Error(`Failed to fetch case study: ${response.statusText}`);
        }
        return response.json();
    }
};
