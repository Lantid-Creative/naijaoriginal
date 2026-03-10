
CREATE OR REPLACE FUNCTION public.notify_admin_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.stock <= 5 AND (OLD.stock IS NULL OR OLD.stock > 5) AND NEW.is_active = true THEN
    INSERT INTO public.admin_notifications (type, title, message, metadata)
    VALUES (
      'inventory',
      CASE WHEN NEW.stock = 0 THEN 'Product Out of Stock! 🚨' ELSE 'Low Stock Alert ⚠️' END,
      CASE WHEN NEW.stock = 0 
        THEN '"' || NEW.name || '" is now OUT OF STOCK. Restock immediately!'
        ELSE '"' || NEW.name || '" has only ' || NEW.stock || ' units left. Consider restocking.'
      END,
      jsonb_build_object('product_id', NEW.id, 'product_name', NEW.name, 'stock', NEW.stock)
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_product_stock_change
  AFTER UPDATE OF stock ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_low_stock();
