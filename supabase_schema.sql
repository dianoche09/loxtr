-- LOXTR Supabase Schema
-- Run this in Supabase SQL Editor


-- 1. USERS TABLE (for profiles after auth signup)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    phone TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- Profile Data
    profile JSONB DEFAULT '{}',
    portfolio JSONB DEFAULT '{}',
    strategy JSONB DEFAULT '{}',
    icp JSONB DEFAULT '{}',
    product_groups JSONB DEFAULT '[]',
    
    -- Subscription
    subscription JSONB DEFAULT '{"planId": "free", "usage": {"leadsUnlockedThisMonth": 0}, "limits": {"maxLeadsPerMonth": 50}}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own data
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. CONTACT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    page TEXT DEFAULT 'Unknown',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (via API)
DROP POLICY IF EXISTS "Service role can insert contacts" ON public.contact_submissions;
CREATE POLICY "Service role can insert contacts" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);


-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    industry TEXT,
    application_type TEXT DEFAULT 'general',
    message TEXT,
    page TEXT DEFAULT 'Unknown',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert
DROP POLICY IF EXISTS "Service role can insert applications" ON public.applications;
CREATE POLICY "Service role can insert applications" ON public.applications
    FOR INSERT WITH CHECK (true);


-- 4. NEWSLETTER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    page TEXT DEFAULT 'Unknown',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert
DROP POLICY IF EXISTS "Service role can insert newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Service role can insert newsletter" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);


-- 5. LEADS TABLE (for CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    country TEXT,
    city TEXT,
    industry TEXT,
    source TEXT DEFAULT 'manual',
    ai_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own leads
DROP POLICY IF EXISTS "Users can manage own leads" ON public.leads;
CREATE POLICY "Users can manage own leads" ON public.leads
    FOR ALL USING (auth.uid() = user_id);


-- 6. CAMPAIGNS TABLE (for CRM)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    target_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own campaigns
DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
    FOR ALL USING (auth.uid() = user_id);


-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 7. AUTOMATIC USER CREATION TRIGGER
-- This ensures a profile is created in public.users whenever a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, company, onboarding_completed, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'company',
        FALSE,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow updates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

