-- Botun bulduğu ham postlar ve durumları
CREATE TABLE IF NOT EXISTS public.bot_outreach_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_name TEXT, -- Postu paylaşan kişi
    post_url TEXT UNIQUE, -- Aynı postu iki kez taramamak için
    content_snippet TEXT, -- Postun kısa özeti
    detected_keyword TEXT, -- Hangi kelimeyle yakaladık? (#gümrük vb.)
    status TEXT DEFAULT 'pending', -- 'pending' (beklemede), 'approved' (onaylandı), 'rejected' (reddedildi), 'completed' (paylaşıldı)
    ai_suggested_comment TEXT, -- Gemini'nin bu posta özel hazırladığı yorum
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Botun çalışma ayarları (Admin'den kontrol edilecek)
CREATE TABLE IF NOT EXISTS public.bot_settings (
    id INT PRIMARY KEY DEFAULT 1, -- Tek satırlık ayar dosyası
    is_active BOOLEAN DEFAULT false, -- Bot çalışsın mı?
    target_keywords TEXT[] DEFAULT ARRAY['#ihracat', '#packinglist', '#dis_ticaret', '#gumruk'], -- Hedef kelimeler
    daily_limit INT DEFAULT 20, -- Günlük max yorum/mesaj sayısı
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO public.bot_settings (id, is_active, target_keywords, daily_limit)
VALUES (1, false, ARRAY['#ihracat', '#packinglist', '#dis_ticaret', '#gumruk'], 20)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.bot_outreach_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for Admin access (assuming internal use for now, can be restricted more)
DROP POLICY IF EXISTS "Enable all access for admins" ON public.bot_outreach_leads;
CREATE POLICY "Enable all access for admins" ON public.bot_outreach_leads FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for admins" ON public.bot_settings;
CREATE POLICY "Enable all access for admins" ON public.bot_settings FOR ALL USING (true);
