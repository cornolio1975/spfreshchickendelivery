-- Enable RLS (just in case)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 1. Policies for ADMINS
-- Drop existing potential admin policies to clean up
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete all orders" ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete all orders"
ON public.orders FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2. Policies for AUTHENTICATED USERS (Non-Admin)
-- Allow creating orders
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow viewing their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- 3. Policies for ANONYMOUS USERS (Guests)
-- Allow creating orders (already added in 02, but reinforcing/fixing if needed)
-- Note: anonymous users cannot view orders once created unless we have a token system, but they can INSERT.
DROP POLICY IF EXISTS "Anon can create orders" ON public.orders;
CREATE POLICY "Anon can create orders"
ON public.orders FOR INSERT
TO anon
WITH CHECK (true); 
-- Changed to 'true' to allow simple insertion without strict checks for now, 
-- or limit to 'auth.role() = 'anon''. 'true' is simpler for debugging.
