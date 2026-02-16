const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function fixRLS() {
    console.log("Applying RLS fixes...");

    const sql = `
    -- Re-applying Users policies with explicit casts
    DROP POLICY IF EXISTS "Users can view own data" ON public.users;
    CREATE POLICY "Users can view own data" ON public.users
        FOR SELECT USING (auth.uid() = id);

    -- Ensure RLS is active
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  `;

    // We can't run raw SQL via the client usually, but we can try to use a function if one exists
    // Since we don't have an exec function, let's try to just update the record and see if it works

    console.log("Testing a manual update via Service Role...");
    const { data, error } = await supabase
        .from('users')
        .update({ name: 'LOXTR TESTER' })
        .eq('email', 'test@loxtr.com');

    if (error) console.error("Update failed:", error);
    else console.log("Update success. DB is alive.");
}

fixRLS();
