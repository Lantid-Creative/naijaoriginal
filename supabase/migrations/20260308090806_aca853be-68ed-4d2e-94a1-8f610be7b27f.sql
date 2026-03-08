
-- 1. Fix user_notifications INSERT: prevent anyone from injecting notifications for other users
DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "Authenticated users insert own notifications"
ON public.user_notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Fix admin_notifications INSERT: restrict to admins only (triggers bypass RLS via SECURITY DEFINER)
DROP POLICY IF EXISTS "System can insert notifications" ON public.admin_notifications;
CREATE POLICY "Only admins can insert admin notifications"
ON public.admin_notifications
FOR INSERT
WITH CHECK (is_admin());

-- 3. Fix guest cart policies: tighten to prevent cross-session access
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
CREATE POLICY "Users can view own cart"
ON public.cart_items
FOR SELECT
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (user_id IS NULL AND session_id IS NOT NULL AND auth.uid() IS NULL)
);

DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
CREATE POLICY "Users can update own cart"
ON public.cart_items
FOR UPDATE
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (user_id IS NULL AND session_id IS NOT NULL AND auth.uid() IS NULL)
);

DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;
CREATE POLICY "Users can delete own cart items"
ON public.cart_items
FOR DELETE
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (user_id IS NULL AND session_id IS NOT NULL AND auth.uid() IS NULL)
);
