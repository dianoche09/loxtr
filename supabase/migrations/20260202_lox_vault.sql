-- LOX AI RADAR & SMART VAULT SCHEMA

-- 1. Search History for Trend Analysis
CREATE TABLE IF NOT EXISTS public.lox_radar_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    hs_code TEXT,
    product_name TEXT,
    target_country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Digital Folders (Logistic Wallets)
CREATE TABLE IF NOT EXISTS public.lox_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active', -- active, archived
    metadata JSONB DEFAULT '{}', -- total_weight, item_count, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Saved Documents Mapping
CREATE TABLE IF NOT EXISTS public.lox_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    folder_id UUID REFERENCES public.lox_folders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    doc_type TEXT NOT NULL, -- packing_list, invoice, etc.
    content JSONB NOT NULL, -- The extracted items array
    file_name TEXT,
    qr_code_id TEXT UNIQUE, -- For LoxQR integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.lox_radar_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lox_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lox_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own searches" ON public.lox_radar_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own searches" ON public.lox_radar_searches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own folders" ON public.lox_folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own documents" ON public.lox_documents FOR ALL USING (auth.uid() = user_id);
