-- 1. DROP all existing insert policies to prevent overlap errors
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anon can create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon to create orders" ON public.orders;

-- 2. CREATE a single unified policy that allows both guests and logged-in users to place orders
-- We allow insertion as long as the data is valid. 
-- SELECT/VIEW access remains restricted to the order owner or admins.
CREATE POLICY "Enable insert for all" 
ON public.orders 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 3. Ensure the sequence for order_no is accessible to all roles
-- (Usually handled by Supabase, but good to reinforce if encountering permission errors)
GRANT USAGE, SELECT ON SEQUENCE public.orders_order_no_seq TO anon, authenticated;
