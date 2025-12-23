ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS weight_options float[] DEFAULT NULL;
