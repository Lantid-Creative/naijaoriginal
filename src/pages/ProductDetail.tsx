import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Minus, Plus, ShoppingCart, ArrowLeft, Sparkles, Heart, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { formatNaira } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  pidgin_tagline: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sizes: string[];
  colors: string[];
  is_limited_edition: boolean;
  edition_total: number | null;
  category_id: string | null;
  product_images: { id: string; image_url: string; alt_text: string | null; display_order: number }[];
  product_categories: { name: string; slug: string } | null;
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_categories:category_id(name, slug)")
        .eq("slug", slug!)
        .single();
      if (data) {
        setProduct(data as any);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    await addToCart(product.id, selectedSize, selectedColor, quantity);
    toast({ title: "E don enter cart! 🛒", description: `${product.name} don enter your cart.` });
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 animate-pulse">
            <div className="aspect-square bg-muted rounded-2xl" />
            <div className="space-y-4 py-8">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-6 bg-muted rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 md:px-6 text-center py-20">
          <h1 className="font-accent text-3xl font-black text-foreground mb-4">Product No Dey Here</h1>
          <Link to="/shop" className="text-primary hover:underline font-body">← Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = [...(product.product_images || [])].sort((a, b) => a.display_order - b.display_order);
  const mainImage = images[selectedImage]?.image_url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4 md:py-6 flex items-center gap-2 font-body text-sm text-muted-foreground"
          >
            <Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Shop
            </Link>
            <span>/</span>
            {product.product_categories && (
              <>
                <span>{(product.product_categories as any).name}</span>
                <span>/</span>
              </>
            )}
            <span className="text-foreground">{product.name}</span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden border border-border mb-3 md:mb-4 bg-muted">
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        i === selectedImage ? "border-primary" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <img src={img.image_url} alt={img.alt_text || product.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="py-2 md:py-4"
            >
              {product.is_limited_edition && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-accent text-xs font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3 h-3" /> Limited Edition — {product.edition_total} pieces only
                </span>
              )}

              <h1 className="font-accent text-2xl md:text-4xl font-black text-foreground mb-2">{product.name}</h1>

              {product.pidgin_tagline && (
                <p className="font-body text-muted-foreground italic mb-4 text-sm md:text-base">"{product.pidgin_tagline}"</p>
              )}

              <div className="flex items-center gap-3 mb-6">
                <span className="font-accent text-2xl md:text-3xl font-bold text-foreground">{formatNaira(product.price)}</span>
                {product.compare_at_price && (
                  <span className="font-body text-base md:text-lg text-muted-foreground line-through">{formatNaira(product.compare_at_price)}</span>
                )}
                {product.compare_at_price && (
                  <span className="px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive font-accent text-xs font-bold">
                    {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                  </span>
                )}
              </div>

              <p className="font-body text-muted-foreground mb-6 md:mb-8 leading-relaxed text-sm md:text-base">{product.description}</p>

              {/* Size */}
              {product.sizes.length > 0 && (
                <div className="mb-5 md:mb-6">
                  <label className="font-accent text-sm font-semibold text-foreground block mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl font-body text-sm border transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color */}
              {product.colors.length > 0 && (
                <div className="mb-5 md:mb-6">
                  <label className="font-accent text-sm font-semibold text-foreground block mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-xl font-body text-sm border transition-all ${
                          selectedColor === color
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6 md:mb-8">
                <label className="font-accent text-sm font-semibold text-foreground block mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-body text-lg font-semibold text-foreground w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="font-accent text-xs text-muted-foreground">{product.stock} dey stock</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="flex-1 py-6 text-base font-accent font-semibold gap-2 rounded-xl"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock === 0 ? "E Don Finish" : adding ? "Dey Add..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="py-6 rounded-xl"
                  onClick={() => {
                    if (!user) { toast({ title: "Sign in first make you save items", variant: "destructive" }); return; }
                    toggleWishlist(product.id);
                  }}
                >
                  <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="py-6 rounded-xl"
                  onClick={() => {
                    if (isInCompare(product.id)) {
                      removeFromCompare(product.id);
                    } else {
                      addToCompare(product.id);
                      toast({ title: "E don enter compare list!" });
                    }
                  }}
                >
                  <Scale className="w-5 h-5" />
                </Button>
              </div>

              <div className="mt-5 md:mt-6 flex items-center gap-2 text-muted-foreground font-body text-sm">
                <ShieldCheck className="w-5 h-5 text-primary" />
                QR Authenticated — Every piece na verified original 🔐
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
