const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("Error: .env.local not found.");
    process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    console.log("I cannot run admin tasks without the Service Role Key.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const defaultProducts = [
    {
        name: "Ayam Segar (Broiler)",
        category: "whole",
        price: 11.00,
        unit: "kg",
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800",
        description: "Freshly slaughtered daily. Cleaned and ready to cook.",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        weight_options: [1.8, 2.2, 2.6],
        in_stock: true,
        id: "p1" // Using fixed IDs might fail if not uuid, but let's try standard insert first without ID if possible, or remove ID.
        // Actually, db is uuid. We should not send 'p1'.
    },
    {
        name: "Ayam Kampung Segar (Jantan)",
        category: "whole",
        price: 28.00,
        unit: "bird (approx 1.3kg)",
        image: "/ayam-kampung-jantan.jpg",
        description: "Premium free-range chicken (Male). Firmer texture.",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        in_stock: true
    },
    {
        name: "Ayam Kampung Segar (Betina)",
        category: "whole",
        price: 26.00,
        unit: "bird",
        image: "/ayam-kampung-betina.jpg",
        description: "Fresh Kampung Chicken (Female).",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        in_stock: true
    },
    {
        name: "Ayam Tua Segar (Ayam Telor)",
        category: "whole",
        price: 18.00,
        unit: "bird",
        image: "/ayam-tua.jpg",
        description: "Fresh Old Chicken (Layer Hen). Perfect for soup.",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        in_stock: true
    }
];

async function run() {
    console.log("--- Starting Auto-Fix Script ---");

    // 1. Update Profiles to Admin
    console.log("1. Granting Admin privileges to all profiles...");
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy filter to update all rows

    if (profileError) {
        console.error("   Failed to update profiles:", profileError.message);
    } else {
        console.log("   Success: All users are now admins.");
    }

    // 2. Seed Products
    console.log("\n2. Seeding Products...");

    // Check if table exists/is accessible
    const { error: checkError } = await supabase.from('products').select('id').limit(1);
    if (checkError) {
        console.error("   Cannot access products table:", checkError.message);
        return;
    }

    // Clear existing
    console.log("   Clearing existing products...");
    const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error("   Failed to clear products:", deleteError.message);
    }

    // Insert new
    // Sanitize products (remove IDs if they are p1, p2 etc, let DB generate UUIDs)
    const productsToInsert = defaultProducts.map(p => {
        const { id, ...rest } = p;
        return rest;
    });

    console.log("   Inserting " + productsToInsert.length + " products...");
    const { error: insertError } = await supabase.from('products').insert(productsToInsert);

    if (insertError) {
        console.error("   Failed to insert products:", insertError.message);
        if (insertError.message.includes("column \"weight_options\" does not exist")) {
            console.error("\n   CRITICAL: The database is missing the 'weight_options' column.");
            console.error("   You MUST run the SQL command: ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_options float[] DEFAULT NULL;");
        }
    } else {
        console.log("   Success: Products seeded.");
    }

    console.log("\n--- Finished ---");
}

run();
