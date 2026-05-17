DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

CREATE POLICY "Signed-in customers can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND guest_email IS NULL
  AND guest_name IS NULL
);

CREATE OR REPLACE FUNCTION public.can_create_order_items(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE id = _order_id
      AND (
        public.is_admin()
        OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
      )
  )
$$;

DROP POLICY IF EXISTS "Customers can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Signed-in customers can create order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (public.can_create_order_items(order_id));