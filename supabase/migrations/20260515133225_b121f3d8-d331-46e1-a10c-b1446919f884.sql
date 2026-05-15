DROP POLICY IF EXISTS "Users can add to cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;

CREATE POLICY "Cart insert (user or guest)" ON public.cart_items
FOR INSERT TO public
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid() AND session_id IS NULL)
  OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Cart select (user or guest)" ON public.cart_items
FOR SELECT TO public
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Cart update (user or guest)" ON public.cart_items
FOR UPDATE TO public
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Cart delete (user or guest)" ON public.cart_items
FOR DELETE TO public
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);