const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
    {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        name: "Ayam Segar (Broiler)",
        category: "whole",
        price: 16.50,
        unit: "bird (approx 1.5kg)",
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800",
        description: "Freshly slaughtered daily. Cleaned and ready to cook.",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        in_stock: true
    },
    {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0852",
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
        id: "d290f1ee-6c54-4b01-90e6-d701748f0853",
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
        id: "d290f1ee-6c54-4b01-90e6-d701748f0854",
        name: "Ayam Tua Segar (Ayam Telor)",
        category: "whole",
        price: 18.00,
        unit: "bird",
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=800",
        description: "Fresh Old Chicken (Layer Hen). Perfect for soup.",
        options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
        in_stock: true
    }
];

async function seedProducts() {
    console.log('Seeding products...');

    // Clear existing products first (optional, be careful in production)
    const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error('Error clearing products:', deleteError);
    } else {
        console.log('Cleared existing products.');
    }

    const { data, error } = await supabase
        .from('products')
        .upsert(products);

    if (error) {
        console.error('Error seeding products:', error);
    } else {
        console.log('Successfully seeded 4 products!');
    }
}

seedProducts();
