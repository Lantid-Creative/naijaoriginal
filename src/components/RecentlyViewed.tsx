import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { Clock } from "lucide-react";

interface RecentEntry {
  id: string;
  viewedAt: number;
}

interface LiveProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  is_active: boolean;
  product_images: { image_url: string; display_order: number }[];
}

interface Props {
  products: RecentEntry[];
  currentProductId?: string;
}

const RecentlyViewed = ({ products, currentProductId }: Props) => {
  const [live, setLive] = useState<LiveProduct[]>([]);

  const ids = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 6)
    .map((p) => p.id);

  useEffect(() => {
    if (ids.length === 0) {
      setLive([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price, is_active, product_images(image_url, display_order)")
        .in("id", ids);
      if (!cancelled && data) setLive(data as any);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  // Preserve recently-viewed order, drop inactive/missing
  const ordered = ids
    .map((id) => live.find((p) => p.id === id && p.is_active))
    .filter(Boolean) as LiveProduct[];

  if (ordered.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="font-accent text-xl md:text-2xl font-black text-foreground">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {ordered.map((product) => {
          const img =
            [...(product.product_images || [])].sort(
              (a, b) => a.display_order - b.display_order
            )[0]?.image_url || "/placeholder.svg";
          return (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="bg-card rounded-xl overflow-hidden border border-border group hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={img}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-2.5">
                <h3 className="font-accent text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <span className="font-accent font-bold text-xs text-foreground">
                  {formatNaira(product.price)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyViewed;
