import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCompare } from "@/contexts/CompareContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { X, ShoppingCart, ArrowRight, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  sizes: string[];
  colors: string[];
  stock: number;
  is_limited_edition: boolean;
  product_images: { image_url: string; display_order: number }[];
  product_categories: { name: string } | null;
}

const Compare = () => {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (compareIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, compare_at_price, description, sizes, colors, stock, is_limited_edition, product_images(image_url, display_order), product_categories:category_id(name)")
        .in("id", compareIds);
      setProducts(data as any || []);
      setLoading(false);
    };
    fetchProducts();
  }, [compareIds]);

  const getImage = (p: CompareProduct) => {
    const sorted = [...(p.product_images || [])].sort((a, b) => a.display_order - b.display_order);
    return sorted[0]?.image_url || "/placeholder.svg";
  };

  if (compareIds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 text-center py-20">
          <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-accent text-3xl font-black text-foreground mb-4">Nothing dey here to compare</h1>
          <p className="font-body text-muted-foreground mb-6">Add products from the shop make you compare dem side by side.</p>
          <Link to="/shop">
            <Button className="font-body font-semibold gap-2">
              Go Shop <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
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
          <div className="py-8 md:py-12 flex items-center justify-between">
            <div>
              <h1 className="font-accent text-3xl md:text-4xl font-black text-foreground mb-2">Compare Products</h1>
              <p className="font-body text-muted-foreground text-sm">{products.length} product{products.length !== 1 ? "s" : ""} selected</p>
            </div>
            <Button variant="outline" onClick={clearCompare} className="font-body text-sm">Clear All</Button>
          </div>

          {loading ? (
            <div className="animate-pulse h-96 bg-muted rounded-2xl" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left font-accent text-xs uppercase tracking-wider text-muted-foreground p-3 w-32">Feature</th>
                    {products.map((p) => (
                      <th key={p.id} className="p-3 text-center min-w-[200px]">
                        <div className="relative bg-card rounded-2xl border border-border p-4">
                          <button onClick={() => removeFromCompare(p.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                          <Link to={`/product/${p.slug}`}>
                            <img src={getImage(p)} alt={p.name} className="w-full aspect-square object-cover rounded-xl mb-3" />
                            <h3 className="font-accent text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-2">{p.name}</h3>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="font-accent text-xs uppercase tracking-wider text-muted-foreground p-3">Price</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <span className="font-accent font-bold text-foreground">{formatNaira(p.price)}</span>
                        {p.compare_at_price && <span className="block font-body text-xs text-muted-foreground line-through">{formatNaira(p.compare_at_price)}</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="font-accent text-xs uppercase tracking-wider text-muted-foreground p-3">Category</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center font-body text-sm text-foreground">
                        {(p.product_categories as any)?.name || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="font-accent text-xs uppercase tracking-wider text-muted-foreground p-3">Sizes</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center font-body text-sm text-foreground">
                        {p.sizes?.length ? p.sizes.join(", ") : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="font-accent text-xs uppercase tracking-wider text-muted-foreground p-3">Colors</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center font-body text-sm text-foreground">
                        {p.colors?.length ? p.colors.join(", ") : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="font-accent text-xs uppercase tracking-wider text-muted-foreground p-3">Stock</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center font-body text-sm">
                        <span className={p.stock > 0 ? "text-primary" : "text-destructive"}>{p.stock > 0 ? `${p.stock} dey` : "E don finish"}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="font-accent text-xs uppercase tracking-wider text-muted-foreground p-3">Edition</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center font-body text-sm text-foreground">
                        {p.is_limited_edition ? "Limited Edition 🔥" : "Standard"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="font-accent text-xs uppercase tracking-wider text-muted-foreground p-3">Action</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await addToCart(p.id);
                            toast({ title: "E don enter cart! 🛒" });
                          }}
                          disabled={p.stock === 0}
                          className="font-body text-xs gap-1"
                        >
                          <ShoppingCart className="w-3 h-3" /> Add to Cart
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Compare;
