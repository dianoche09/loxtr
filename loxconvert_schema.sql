-- LoxConvert History Table
-- Tracks usage and analytics for the AI Document Converter tool

CREATE TABLE IF NOT EXISTS public.lox_convert_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    file_name TEXT,
    items_count INT,
    hs_codes_suggested INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lox_convert_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own history
CREATE POLICY "Users can view own convert history" ON public.lox_convert_history
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service Role can insert (from Vercel Function)
CREATE POLICY "Service Role can insert convert history" ON public.lox_convert_history
    FOR INSERT WITH CHECK (true);
