import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkSchema() {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns found in orders:', Object.keys(data[0]));
    } else {
        // If no data, we can't easily see columns via select * unfortunately without a query
        console.log('No orders found to inspect columns. Trying direct query...');
        // We can't do raw SQL via supabase-js easily unless we use an RPC
    }
}

checkSchema();
