-- Add order_no for strict sequential ordering
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_no SERIAL;

-- Link to shop
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES public.shops(id);

-- Payment status/method tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';

-- Ensure RLS allows public to insert (for guest checkout) if not already
-- Existing policy: "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);
-- We might need to allow unauthenticated inserts if we want guest checkout, but for now let's assume `user_id` is null for guests?
-- If user_id is null, `auth.uid() = user_id` will fail if auth.uid() is not null... wait. 
-- If user is unauthenticated, auth.uid() is null. So `null = null` is null (falsy) in SQL.
-- So we need a policy for anon users to insert orders.

CREATE POLICY "Allow anon to create orders" ON public.orders
FOR INSERT WITH CHECK (auth.role() = 'anon');
