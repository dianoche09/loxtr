-- ADMIN PANEL SCHEMA UPDATE
-- Run this in your Supabase SQL Editor to enable Admin capabilities

-- 1. ADD ROLE TO USERS TABLE
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- 2. AUDIT LOGS TABLE (For Security & tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL, -- e.g., 'UPDATE_USER_PLAN', 'DELETE_LEAD'
    target_resource TEXT NOT NULL, -- e.g., 'users', 'leads'
    target_id TEXT, 
    details JSONB DEFAULT '{}', -- Store 'old_value' and 'new_value'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Policy: Admins and System can insert logs
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);


-- 3. SYSTEM SETTINGS TABLE (Maintenance Mode, Global Alerts)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Default Settings
INSERT INTO public.system_settings (key, value) VALUES 
('maintenance_mode', '{"enabled": false, "message": "We are upgrading our systems."}'),
('global_alert', '{"enabled": false, "type": "info", "message": "Welcome to the new dashboard!"}')
ON CONFLICT (key) DO NOTHING;

-- Policy: Everyone can read settings (needed for app login checks)
CREATE POLICY "Everyone can read system settings" ON public.system_settings
    FOR SELECT USING (true);

-- Policy: Only Admins can update settings
CREATE POLICY "Admins can update system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );


-- 4. UPDATE RLS FOR USERS TABLE (Allow Admins to manage everyone)
-- Note: You might need to drop existing restrictive policies if they conflict, 
-- but adding a permissive OR condition usually works if structured correctly.

CREATE POLICY "Admins can select all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- 5. FUNCTION TO MAKE FIRST USER ADMIN (Optional helper)
-- Usage: SELECT make_admin('your_email@loxtr.com');
CREATE OR REPLACE FUNCTION make_admin(target_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET role = 'admin' 
    WHERE email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
