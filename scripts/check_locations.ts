import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkLocations() {
    console.log('--- Checking Business Settings ---');
    const { data: settings, error: sError } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
    if (sError) console.error('Settings Error:', sError);
    else console.log('Settings:', { lat: settings?.lat, lng: settings?.lng, address: settings?.address });

    console.log('\n--- Checking Shops ---');
    const { data: shops, error: shError } = await supabase.from('shops').select('*');
    if (shError) console.error('Shops Error:', shError);
    else {
        shops.forEach(s => {
            console.log(`Shop: ${s.name}`, { lat: s.lat, lng: s.lng, address: s.address });
        });
    }
}

checkLocations();
