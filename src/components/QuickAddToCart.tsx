import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface QuickAddToCartProps {
  productId: string;
  productName: string;
}

const QuickAddToCart = ({ productId, productName }: QuickAddToCartProps) => {
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(productId);
    toast({ title: "E don enter cart! 🛒", description: `${productName} don enter your cart.` });
    setAdding(false);
  };

  return (
    <button
      onClick={handleQuickAdd}
      disabled={adding}
      className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      title="Quick add to cart"
    >
      <ShoppingCart className={`w-3.5 h-3.5 ${adding ? "animate-pulse" : ""}`} />
    </button>
  );
};

export default QuickAddToCart;
