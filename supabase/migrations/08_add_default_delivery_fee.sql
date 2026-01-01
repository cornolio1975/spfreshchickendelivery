ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS default_delivery_fee NUMERIC DEFAULT 15.00;
