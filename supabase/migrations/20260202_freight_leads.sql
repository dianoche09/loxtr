-- Freight Leads Table for LoxConvert Automation
CREATE TABLE IF NOT EXISTS public.freight_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id), -- References public.users which mirrors auth.users
    items TEXT,
    total_qty INT,
    total_weight DECIMAL,
    source_file TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'quoted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.freight_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert (lead generation)
CREATE POLICY "Enable insert for everyone" ON public.freight_leads
FOR INSERT WITH CHECK (true);

-- Allow admins or the user themselves to view (optional, adjust based on your needs)
CREATE POLICY "Users can view their own leads" ON public.freight_leads
FOR SELECT USING (auth.uid() = user_id);
