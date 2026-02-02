import { api } from './api';

export const adminAPI = {
    // User Management
    getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
        api.get('/admin/users', { params }), // Expecting a Supabase Edge Function or RLS-protected direct query wrapper

    // In a pure client-side Supabase app, we might query the table directly if RLS allows.
    // For this context, we'll simulate the endpoint call structure or direct table access if we were using supabase-js directly here.
    // Since 'api' is an axios instance, we assume we have backend endpoints OR we are mocking them.
    // Let's assume we want to use the existing 'api' wrapper for consistency.

    updateUserRole: (userId: string, role: 'user' | 'admin' | 'moderator') =>
        api.put(`/admin/users/${userId}/role`, { role }),

    updateUserPlan: (userId: string, planId: 'free' | 'pro' | 'enterprise') =>
        api.put(`/admin/users/${userId}/plan`, { planId }),

    banUser: (userId: string) => api.post(`/admin/users/${userId}/ban`),

    // Stats
    getStats: () => api.get('/admin/stats'),

    // Audit Logs
    getAuditLogs: (params?: { page?: number; limit?: number }) => api.get('/admin/audit-logs', { params }),

    // System Settings
    getSystemSettings: () => api.get('/admin/settings'),
    updateSystemSettings: (key: string, value: any) => api.put(`/admin/settings/${key}`, { value }),

    // Impersonation (Ghost Mode)
    // Returns a temporary access token for that user OR just data to populate context
    impersonateUser: (userId: string) => api.post(`/admin/users/${userId}/impersonate`),
};
