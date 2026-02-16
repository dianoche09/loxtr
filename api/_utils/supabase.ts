import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error(`Supabase configuration missing! URL: ${supabaseUrl ? 'OK' : 'MISSING'}, Key: ${supabaseServiceKey ? 'OK' : 'MISSING'}`);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
