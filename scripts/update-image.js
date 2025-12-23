require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateImage() {
    const { data, error } = await supabase
        .from('products')
        .update({ image: '/ayam-kampung-betina-v2.jpg' })
        .eq('name', 'Ayam Kampung Segar (Betina)');

    if (error) {
        console.error('Error updating product image:', error);
    } else {
        console.log('Successfully updated image path in database.');
    }
}

updateImage();
