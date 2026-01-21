
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS unavailable_weights float[] DEFAULT NULL;
