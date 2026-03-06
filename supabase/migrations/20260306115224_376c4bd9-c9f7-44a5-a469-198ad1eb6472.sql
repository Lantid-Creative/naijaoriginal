
-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  is_active boolean NOT NULL DEFAULT true,
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  unsubscribed_at timestamp with time zone
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (is_admin());

-- Only admins can update subscribers
CREATE POLICY "Admins can manage subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (is_admin());

-- User notifications table for order confirmations, review status, etc.
CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (true);

-- Trigger: notify user when review is approved
CREATE OR REPLACE FUNCTION public.notify_user_review_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  product_name text;
BEGIN
  -- Only fire when is_approved changes to true
  IF NEW.is_approved = true AND (OLD.is_approved IS NULL OR OLD.is_approved = false) THEN
    SELECT name INTO product_name FROM public.products WHERE id = NEW.product_id;
    INSERT INTO public.user_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'review_approved',
      'Your Review is Live! 🎉',
      'Your review for "' || COALESCE(product_name, 'a product') || '" has been approved and is now visible to everyone.',
      jsonb_build_object('product_id', NEW.product_id, 'review_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_status_change
  AFTER UPDATE OF is_approved ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_review_status();

-- Trigger: notify user on order creation (order confirmation)
CREATE OR REPLACE FUNCTION public.notify_user_order_confirmation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'order_confirmation',
      'Order Confirmed! 🛒',
      'Your order #' || NEW.order_number || ' has been placed successfully. Total: ₦' || NEW.total::text || '. We go deliver am sharp!',
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'total', NEW.total)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_order_notify_user
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_order_confirmation();
