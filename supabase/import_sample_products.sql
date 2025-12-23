-- Import sample products into Supabase
-- Run this in Supabase SQL Editor to populate your products table

INSERT INTO public.products (name, category, price, unit, image, description, options, in_stock)
VALUES
    (
        'Whole Fresh Chicken',
        'whole',
        18.50,
        'kg',
        'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800',
        'Premium quality whole chicken, freshly sourced daily',
        ARRAY['12 cuts', '18 cuts', 'Whole'],
        true
    ),
    (
        'Chicken Breast',
        'parts',
        24.00,
        'kg',
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800',
        'Boneless, skinless chicken breast - perfect for grilling',
        NULL,
        true
    ),
    (
        'Chicken Drumstick',
        'parts',
        16.00,
        'kg',
        'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
        'Juicy chicken drumsticks, great for frying or baking',
        NULL,
        true
    ),
    (
        'Chicken Wings',
        'parts',
        20.00,
        'kg',
        'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800',
        'Fresh chicken wings, ideal for BBQ and parties',
        NULL,
        true
    ),
    (
        'Chicken Thigh',
        'parts',
        18.00,
        'kg',
        'https://images.unsplash.com/photo-1630409346730-a0f0c4a2e7c7?w=800',
        'Tender chicken thighs with skin',
        ARRAY['Boneless', 'With bone'],
        true
    ),
    (
        'Fresh Kampung Eggs',
        'eggs',
        12.00,
        'tray (30 pcs)',
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800',
        'Free-range kampung eggs, rich in nutrients',
        NULL,
        true
    ),
    (
        'Grade A Eggs',
        'eggs',
        9.50,
        'tray (30 pcs)',
        'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800',
        'Premium grade A eggs, perfect for all cooking needs',
        NULL,
        true
    ),
    (
        'Frozen Chicken Nuggets',
        'frozen',
        15.00,
        'kg',
        'https://images.unsplash.com/photo-1562967914-608f82629710?w=800',
        'Crispy chicken nuggets, ready to fry',
        NULL,
        true
    ),
    (
        'Frozen Chicken Sausage',
        'frozen',
        18.00,
        'kg',
        'https://images.unsplash.com/photo-1612892483236-52d32a0e0ac1?w=800',
        'Premium chicken sausages, great for breakfast',
        NULL,
        true
    ),
    (
        'Minced Chicken',
        'parts',
        16.50,
        'kg',
        'https://images.unsplash.com/photo-1607623488235-e2e5c9a3d0f8?w=800',
        'Fresh minced chicken meat, perfect for meatballs and burgers',
        NULL,
        true
    )
ON CONFLICT DO NOTHING;
