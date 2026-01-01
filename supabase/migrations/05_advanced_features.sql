-- Add scheduling columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'immediate';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;

-- Add status column to shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';

-- Update existing shops to 'open' if they were active, or 'closed' if not (optional, but good for data integrity)
UPDATE public.shops SET status = 'open' WHERE is_active = true;
UPDATE public.shops SET status = 'closed' WHERE is_active = false;
