import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_utils/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            console.warn('No token provided in auth header');
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const { data: authData, error: authError } = await supabase.auth.getUser(token);

        if (authError || !authData?.user) {
            console.error('Supabase Auth Error:', authError?.message || 'User not found');
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const user = authData.user;

        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Database Fetch User Error:', error);
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ success: true, data: { user: data } });
        }

        if (req.method === 'PUT') {
            const updateData = { ...req.body };

            // Map camelCase to snake_case if necessary for DB
            if (updateData.onboardingCompleted !== undefined) {
                updateData.onboarding_completed = updateData.onboardingCompleted;
                delete updateData.onboardingCompleted;
            }

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                console.error('Database Update Profile Error:', error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ success: true, data });
        }

    } catch (error: any) {
        console.error('Auth/Me Critical Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
