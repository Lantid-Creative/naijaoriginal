CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'NO-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || UPPER(SUBSTR(NEW.id::text, 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

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
        OR (auth.uid() IS NULL AND user_id IS NULL AND guest_email IS NOT NULL)
      )
  )
$$;

DROP POLICY IF EXISTS "Customers can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Customers can create order items"
ON public.order_items
FOR INSERT
TO public
WITH CHECK (public.can_create_order_items(order_id));