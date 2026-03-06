import { Link } from "react-router-dom";
import { formatNaira } from "@/lib/format";
import { Clock } from "lucide-react";

interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string;
  viewedAt: number;
}

interface RecentlyViewedProps {
  products: RecentProduct[];
  currentProductId?: string;
}

const RecentlyViewed = ({ products, currentProductId }: RecentlyViewedProps) => {
  const filtered = products.filter((p) => p.id !== currentProductId).slice(0, 6);
  if (filtered.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="font-accent text-xl md:text-2xl font-black text-foreground">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {filtered.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.slug}`}
            className="bg-card rounded-xl overflow-hidden border border-border group hover:border-primary/30 hover:shadow-md transition-all duration-300"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-2.5">
              <h3 className="font-accent text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <span className="font-accent font-bold text-xs text-foreground">{formatNaira(product.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
