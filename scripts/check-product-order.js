const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductOrder() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('id, name, created_at')
            .order('created_at', { ascending: true });

        if (error) throw error;

        console.log(`Current products arranged by created_at ASC:`);
        products.forEach((p, index) => {
            console.log(`${index + 1}. ${p.name} (created_at: ${p.created_at})`);
        });

    } catch (err) {
        console.error("Script failed:", err);
    }
}

checkProductOrder();
