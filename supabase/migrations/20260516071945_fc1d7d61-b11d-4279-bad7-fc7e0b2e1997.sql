DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Customers can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  )
  OR
  (
    auth.uid() IS NULL
    AND user_id IS NULL
    AND guest_email IS NOT NULL
    AND guest_name IS NOT NULL
    AND shipping_address IS NOT NULL
  )
);

CREATE POLICY "Customers can create order items"
ON public.order_items
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (
        (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
        OR
        (auth.uid() IS NULL AND orders.user_id IS NULL AND orders.guest_email IS NOT NULL)
        OR
        public.is_admin()
      )
  )
);