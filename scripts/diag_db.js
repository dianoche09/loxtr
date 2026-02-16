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

async function checkDatabase() {
    const email = 'test@loxtr.com';
    console.log(`Checking DB for ${email}...`);

    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);

    if (!user) return console.log("Auth user missing.");

    console.log(`User ID: ${user.id}`);

    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);

    if (error) {
        console.error('DATABASE ERROR (500 potential source):', error);
    } else {
        console.log('Profile found:', profile);
        if (profile.length === 0) {
            console.log("Profile missing. Creating it...");
            const { error: insErr } = await supabase.from('users').insert({
                id: user.id,
                email: user.email,
                name: 'Test Account',
                role: 'user',
                onboarding_completed: true
            });
            if (insErr) console.error("Insert failed:", insErr);
            else console.log("Insert success.");
        }
    }
}

checkDatabase();
