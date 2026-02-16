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

async function inspectSchema() {
    console.log("Inspecting users table structure...");

    // Querying information_schema is restricted, but we can try a select head
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
        console.error("Column check error:", error);
    } else {
        console.log("Found columns:", Object.keys(data[0] || {}));
    }
}

inspectSchema();
