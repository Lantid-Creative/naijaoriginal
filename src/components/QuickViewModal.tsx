import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Sparkles, ExternalLink, Truck } from "lucide-react";
import { addDays, format } from "date-fns";

interface QuickViewModalProps {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ productId, open, onClose }: QuickViewModalProps) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!productId || !open) return;
    setLoading(true);
    setSelectedImage(0);
    setQuantity(1);
    supabase
      .from("products")
      .select("*, product_images(*), product_categories:category_id(name)")
      .eq("id", productId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProduct(data);
          if (data.sizes?.length) setSelectedSize(data.sizes[0]);
          if (data.colors?.length) setSelectedColor(data.colors[0]);
        }
        setLoading(false);
      });
  }, [productId, open]);

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    await addToCart(product.id, selectedSize, selectedColor, quantity);
    toast({ title: "E don enter cart! 🛒", description: `${product.name} added.` });
    setAdding(false);
  };

  const images = product
    ? [...(product.product_images || [])].sort((a: any, b: any) => a.display_order - b.display_order)
    : [];
  const mainImage = images[selectedImage]?.image_url || "/placeholder.svg";

  const now = new Date();
  const standardDate = format(addDays(now, 14), "MMM d");
  const fastDate = format(addDays(now, 5), "MMM d");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{product?.name || "Product Quick View"}</DialogTitle>
        {loading || !product ? (
          <div className="p-8 flex items-center justify-center min-h-[300px]">
            <div className="animate-pulse space-y-3 w-full">
              <div className="h-48 bg-muted rounded-xl" />
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="bg-muted">
              <div className="aspect-square overflow-hidden">
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-1.5 p-2 overflow-x-auto">
                  {images.slice(0, 5).map((img: any, i: number) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                        i === selectedImage ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-5 flex flex-col">
              {product.is_limited_edition && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-accent text-[10px] font-bold uppercase w-fit mb-2">
                  <Sparkles className="w-3 h-3" /> Limited
                </span>
              )}

              <h2 className="font-accent text-lg font-black text-foreground mb-1">{product.name}</h2>

              {product.pidgin_tagline && (
                <p className="font-body text-xs text-muted-foreground italic mb-2">"{product.pidgin_tagline}"</p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className="font-accent text-xl font-bold text-foreground">{formatNaira(product.price)}</span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="font-body text-sm text-muted-foreground line-through">{formatNaira(product.compare_at_price)}</span>
                )}
              </div>

              {product.description && (
                <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-3">{product.description}</p>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="mb-3">
                  <label className="font-accent text-xs font-semibold text-foreground block mb-1.5">Size</label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 rounded-lg font-body text-xs border transition-all ${
                          selectedSize === s ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="mb-3">
                  <label className="font-accent text-xs font-semibold text-foreground block mb-1.5">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1 rounded-lg font-body text-xs border transition-all ${
                          selectedColor === c ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-body text-sm font-semibold w-8 text-center text-foreground">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Button onClick={handleAdd} disabled={adding || product.stock === 0} className="flex-1 font-accent text-sm gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
                </Button>
              </div>

              {/* Delivery estimate */}
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Truck className="w-3.5 h-3.5" />
                <span className="font-body text-[11px]">
                  Standard by {standardDate} • Fast by {fastDate}
                </span>
              </div>

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 font-accent text-xs text-primary hover:underline mt-auto"
              >
                View full details <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
