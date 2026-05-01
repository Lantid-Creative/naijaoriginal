import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  price: number;
  comparePrice?: number | null;
  stock: number;
  adding: boolean;
  onAdd: () => void;
}

/**
 * Mobile-only sticky CTA bar. Appears after the user scrolls past the
 * primary add-to-cart button so they always have a one-tap purchase action.
 */
const StickyMobileAddToCart = ({ price, comparePrice, stock, adding, onAdd }: Props) => {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after 600px of scroll (past hero info on mobile)
      setShow(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 min-w-0">
              <div className="font-accent text-base font-bold text-foreground leading-tight">
                {formatNaira(price)}
              </div>
              {comparePrice && comparePrice > price && (
                <div className="font-body text-[11px] text-muted-foreground line-through leading-tight">
                  {formatNaira(comparePrice)}
                </div>
              )}
            </div>
            <Button
              onClick={onAdd}
              disabled={adding || stock === 0}
              className="flex-1 h-12 font-accent font-semibold gap-2 rounded-xl"
            >
              <ShoppingCart className="w-4 h-4" />
              {stock === 0 ? t("pd.outOfStock") : adding ? t("pd.adding") : t("pd.addToCart")}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMobileAddToCart;
