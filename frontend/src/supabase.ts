import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Create a dummy client if keys are placeholders to avoid top-level crashes
const isPlaceholder = supabaseUrl.includes('placeholder') || !supabaseUrl.startsWith('http');

export const supabase = createClient(
    isPlaceholder ? 'https://placeholder.supabase.co' : supabaseUrl,
    isPlaceholder ? 'placeholder' : supabaseAnonKey
);
