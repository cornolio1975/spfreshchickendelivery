const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl ? 'Found' : 'MISSING');
console.log('Key:', supabaseKey ? 'Found' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('business_settings')
            .select('*')
            .maybeSingle();

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Connection Successful!');
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('Network/Unexpected Error:', err);
    }
}

testConnection();
