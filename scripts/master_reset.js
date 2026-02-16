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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function masterReset(email, newPassword) {
    console.log(`Master reset for ${email}...`);

    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) return console.error(listError);

    const user = usersData.users.find(u => u.email === email);
    if (!user) return console.error("User not found.");

    console.log(`Setting password and confirming email for ${user.id}...`);

    const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
            password: newPassword,
            email_confirm: true
        }
    );

    if (updateError) {
        console.error('Error:', updateError);
    } else {
        console.log(`SUCCESS!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log(`Please try logging in now at http://localhost:5173/login`);
    }
}

masterReset('test@loxtr.com', '12345678');
