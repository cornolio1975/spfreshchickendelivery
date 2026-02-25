const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ORDERED_PRODUCTS = [
    "Ayam Segar (Broiler)",
    "Ayam Kampung Segar (Jantan)",
    "Ayam Kampung Segar (Betina)",
    "Ayam Tua Segar (Ayam Telor)",
    "Ayam Kampung Dara (800-1.1kg)",
    "AUSTRALIAN LAMB",
    "AUSTRALIAN GOAT",
    "LOCAL MUTTON"
];

async function updateProductOrder() {
    try {
        console.log("Fetching products...");
        const { data: products, error } = await supabase
            .from('products')
            .select('id, name');

        if (error) throw error;

        console.log(`Found ${products.length} products total.`);

        // We'll set the timestamps starting from a fixed date and add 1 minute for each item
        // so they sort correctly by created_at ASC
        const baseDate = new Date('2024-01-01T00:00:00Z');

        for (let i = 0; i < ORDERED_PRODUCTS.length; i++) {
            const targetName = ORDERED_PRODUCTS[i];

            // Find the product in the DB that matches this name (case-insensitive just in case)
            const product = products.find(p => p.name.toLowerCase().trim() === targetName.toLowerCase().trim());

            if (product) {
                // Calculate a new time for this item. e.g. baseDate + i minutes.
                const newDate = new Date(baseDate.getTime() + (i * 60000));
                console.log(`Updating '${product.name}' (ID: ${product.id}) sorting time to ${newDate.toISOString()}`);

                const { error: updateError } = await supabase
                    .from('products')
                    .update({ created_at: newDate.toISOString() })
                    .eq('id', product.id);

                if (updateError) {
                    console.error(`Error updating ${targetName}:`, updateError);
                }
            } else {
                console.log(`⚠️ Warning: Product '${targetName}' not found in the database.`);
            }
        }

        console.log("Finished updating order.");
    } catch (err) {
        console.error("Script failed:", err);
    }
}

updateProductOrder();
