import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { motion } from "framer-motion";
import { Clock, ChevronRight, Sparkles } from "lucide-react";

interface TimelineProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  series_number: number;
  series_year: number;
  series_name: string;
  product_images: { image_url: string; display_order: number }[];
}

interface ProductEvolutionTimelineProps {
  productLine: string | null;
  currentProductId: string;
}

const ProductEvolutionTimeline = ({ productLine, currentProductId }: ProductEvolutionTimelineProps) => {
  const [products, setProducts] = useState<TimelineProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productLine) { setLoading(false); return; }

    const fetchTimeline = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, series_number, series_year, series_name, product_images(image_url, display_order)")
        .eq("product_line", productLine)
        .eq("is_active", true)
        .order("series_number", { ascending: true });

      setProducts((data as any) || []);
      setLoading(false);
    };
    fetchTimeline();
  }, [productLine]);

  // Don't show if only 1 product in the line
  if (loading || products.length <= 1) return null;

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-accent text-lg md:text-xl font-bold text-foreground">Product Evolution</h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-12 left-0 right-0 h-0.5 bg-border hidden md:block" />

        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product, i) => {
            const isCurrent = product.id === currentProductId;
            const images = [...(product.product_images || [])].sort((a, b) => a.display_order - b.display_order);
            const image = images[0]?.image_url || "/placeholder.svg";

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-40 md:w-48"
              >
                {/* Series dot on timeline */}
                <div className="hidden md:flex items-center justify-center mb-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                      isCurrent
                        ? "border-primary bg-primary"
                        : "border-border bg-background"
                    }`}
                  >
                    {isCurrent && <Sparkles className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </div>

                <Link
                  to={isCurrent ? "#" : `/product/${product.slug}`}
                  className={`block rounded-xl border overflow-hidden transition-all ${
                    isCurrent
                      ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  <div className="aspect-square overflow-hidden bg-muted relative">
                    <img src={image} alt={product.name} className="w-full h-full object-cover" />
                    <div
                      className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md font-accent text-[10px] font-bold ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/80 text-background"
                      }`}
                    >
                      S{product.series_number}
                    </div>
                    {isCurrent && (
                      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-primary text-primary-foreground font-accent text-[10px] font-bold">
                        Current
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="font-accent text-xs font-bold text-foreground line-clamp-1">{product.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{product.series_year} · {product.series_name?.split("—")[1]?.trim() || `Series ${product.series_number}`}</p>
                    <p className="font-accent text-sm font-bold text-foreground mt-1">{formatNaira(product.price)}</p>
                  </div>
                </Link>

                {i < products.length - 1 && (
                  <div className="md:hidden flex justify-center mt-2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductEvolutionTimeline;
