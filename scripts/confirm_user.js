const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env because dotenv is not installed
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function confirmUser(email) {
    console.log(`Searching for user with email: ${email}...`);

    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
        console.error(`User with email ${email} not found.`);
        return;
    }

    console.log(`Found user ID: ${user.id}. Confirming email...`);

    const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
    );

    if (error) {
        console.error('Error confirming user:', error);
    } else {
        console.log(`Success! User ${email} has been confirmed.`);

        // Ensure profile exists in public.users
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code === 'PGRST116') {
            console.log('Profile missing in public.users, creating one...');
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.email.split('@')[0],
                    onboarding_completed: true,
                    role: 'user'
                });

            if (insertError) console.error('Error creating profile:', insertError);
            else console.log('Profile created successfully.');
        } else {
            console.log('Profile already exists.');
        }
    }
}

const emailToConfirm = process.argv[2] || 'test@loxtr.com';
confirmUser(emailToConfirm);
