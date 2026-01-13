-- Add in_stock column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true;

-- Update existing products to be in stock
UPDATE public.products SET in_stock = true WHERE in_stock IS NULL;
