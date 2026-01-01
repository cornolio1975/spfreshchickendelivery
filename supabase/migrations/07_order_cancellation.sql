-- Allow customers to cancel their own orders if they are still pending
DROP POLICY IF EXISTS "Users can cancel their own pending orders" ON public.orders;

CREATE POLICY "Users can cancel their own pending orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'cancelled'
);
