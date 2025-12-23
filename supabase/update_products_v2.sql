-- Update script to sync products with the new requirements
-- Removes old products and inserts the 3 specific products

-- 1. Disable triggers if any (optional, but good practice if you have complex triggers)
-- ALTER TABLE public.products DISABLE TRIGGER ALL;

-- 2. Clear existing products (or you could soft delete if you prefer)
TRUNCATE TABLE public.products;

-- 3. Insert new products
INSERT INTO public.products (id, name, category, price, unit, image, description, options, in_stock)
VALUES
    (
        'p1',
        'Ayam Segar (Broiler)',
        'whole',
        16.50,
        'bird (approx 1.5kg)',
        'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800',
        'Freshly slaughtered daily. Cleaned and ready to cook.',
        ARRAY['Whole', 'Butterfly cut', 'Cut 8', 'Cut 12', 'Cut 16', 'Cincang(65)'],
        true
    ),
    (
        'p2',
        'Ayam Kampung Segar (Jantan)',
        'whole',
        28.00,
        'bird (approx 1.3kg)',
        'ayam-kampung-jantan.jpg',
        'Premium free-range chicken (Male). Firmer texture.',
        ARRAY['Whole', 'Butterfly cut', 'Cut 8', 'Cut 12', 'Cut 16', 'Cincang(65)'],
        true
    ),
    (
        'p3',
        'Ayam Kampung Segar (Betina)',
        'whole',
        26.00,
        'bird',
        'ayam-kampung-betina.jpg',
        'Fresh Kampung Chicken (Female).',
        ARRAY['Whole', 'Butterfly cut', 'Cut 8', 'Cut 12', 'Cut 16', 'Cincang(65)'],
        true
    ),
    (
        'p4',
        'Ayam Tua Segar (Ayam Telor)',
        'whole',
        18.00,
        'bird',
        'ayam-tua.jpg',
        'Fresh Old Chicken (Layer Hen). Perfect for soup.',
        ARRAY['Whole', 'Butterfly cut', 'Cut 8', 'Cut 12', 'Cut 16', 'Cincang(65)'],
        true
    );

-- Enable triggers back
-- ALTER TABLE public.products ENABLE TRIGGER ALL;
