
-- 1. Fix guest cart: Move guest cart to authenticated-only for server operations
-- Guest carts will be stored in localStorage on the client side instead
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
CREATE POLICY "Users can view own cart"
ON public.cart_items
FOR SELECT
USING (user_id IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
CREATE POLICY "Users can update own cart"
ON public.cart_items
FOR UPDATE
USING (user_id IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;
CREATE POLICY "Users can delete own cart items"
ON public.cart_items
FOR DELETE
USING (user_id IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can add to cart" ON public.cart_items;
CREATE POLICY "Users can add to cart"
ON public.cart_items
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. Fix order_items: restrict to authenticated users only
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Users can create order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
