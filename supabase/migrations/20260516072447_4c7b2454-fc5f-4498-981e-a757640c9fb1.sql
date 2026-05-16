CREATE OR REPLACE FUNCTION public.notify_admin_shipping_quote_needed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_name text;
  customer_email text;
  customer_phone text;
  customer_country text;
  preferred_day text;
  preferred_time text;
BEGIN
  customer_name := COALESCE(NEW.guest_name, NEW.shipping_address->>'full_name', 'Customer');
  customer_email := COALESCE(NEW.guest_email, 'Signed-in customer');
  customer_phone := COALESCE(NEW.shipping_address->>'phone', 'No phone supplied');
  customer_country := COALESCE(NEW.shipping_address->>'country', 'Unknown country');
  preferred_day := COALESCE(NEW.shipping_address->>'preferred_contact_day', 'not specified');
  preferred_time := COALESCE(NEW.shipping_address->>'preferred_contact_time', 'not specified');

  INSERT INTO public.admin_notifications (type, title, message, metadata)
  VALUES (
    'shipping_quote',
    'Shipping Quote Needed 🚚',
    'Order #' || NEW.order_number || ' needs a shipping quote. Contact ' || customer_name || ' by phone/WhatsApp: ' || customer_phone || '. Country: ' || customer_country || '. Preferred contact: ' || preferred_day || ' at ' || preferred_time || '. Item subtotal: ₦' || NEW.subtotal::text || '.',
    jsonb_build_object(
      'order_id', NEW.id,
      'order_number', NEW.order_number,
      'customer_name', customer_name,
      'customer_email', customer_email,
      'customer_phone', customer_phone,
      'country', customer_country,
      'preferred_contact_day', preferred_day,
      'preferred_contact_time', preferred_time,
      'subtotal', NEW.subtotal
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_order_shipping_quote ON public.orders;
CREATE TRIGGER on_new_order_shipping_quote
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_shipping_quote_needed();