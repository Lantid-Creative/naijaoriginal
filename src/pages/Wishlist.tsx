import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  product_images: { image_url: string; display_order: number }[];
}

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, compare_at_price, product_images(image_url, display_order)")
        .in("id", wishlistIds);
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, [wishlistIds]);

  const getImage = (p: WishlistProduct) => {
    const sorted = [...(p.product_images || [])].sort((a, b) => a.display_order - b.display_order);
    return sorted[0]?.image_url || "/placeholder.svg";
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    await addToCart(product.id);
    toast({ title: "Added to cart! 🛒", description: `${product.name} don enter your cart.` });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 text-center py-20">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-accent text-3xl font-black text-foreground mb-4">Sign in to view wishlist</h1>
          <Link to="/auth" className="text-primary hover:underline font-body">Sign In →</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="py-8 md:py-12">
            <h1 className="font-accent text-3xl md:text-4xl font-black text-foreground mb-2">My Wishlist ❤️</h1>
            <p className="font-body text-muted-foreground text-sm">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border animate-pulse">
                  <div className="aspect-square bg-muted rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-accent text-xl font-bold text-foreground mb-2">Your wishlist is empty</h3>
              <p className="font-body text-muted-foreground mb-6">Start saving items you love!</p>
              <Link to="/shop">
                <Button className="font-body font-semibold gap-2">
                  Browse Shop <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden group"
                >
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img src={getImage(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  </Link>
                  <div className="p-3 md:p-4">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-accent text-sm font-bold text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-accent font-bold text-sm text-foreground">${product.price.toFixed(2)}</span>
                      {product.compare_at_price && (
                        <span className="font-body text-xs text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAddToCart(product)} className="flex-1 font-body text-xs gap-1">
                        <ShoppingCart className="w-3 h-3" /> Add to Cart
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleWishlist(product.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
