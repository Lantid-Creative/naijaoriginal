
-- Admin notifications table
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'review',
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (true);

-- Trigger to auto-create notification on new review
CREATE OR REPLACE FUNCTION public.notify_admin_new_review()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  product_name text;
BEGIN
  SELECT name INTO product_name FROM public.products WHERE id = NEW.product_id;
  INSERT INTO public.admin_notifications (type, title, message, metadata)
  VALUES (
    'review',
    'New Review Submitted',
    'A new ' || NEW.rating || '-star review was submitted for "' || COALESCE(product_name, 'Unknown Product') || '" and needs approval.',
    jsonb_build_object('product_id', NEW.product_id, 'review_id', NEW.id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_review_notify_admin
  AFTER INSERT ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_review();
