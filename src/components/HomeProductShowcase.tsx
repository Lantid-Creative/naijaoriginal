import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Star, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import QuickAddToCart from "@/components/QuickAddToCart";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  is_limited_edition: boolean | null;
  pidgin_tagline: string | null;
  product_images: { image_url: string; alt_text: string | null }[];
}

type SectionType = "new" | "featured" | "top-rated";

const sectionConfig: Record<SectionType, { title: string; subtitle: string; icon: typeof Star; badge: string }> = {
  new: {
    title: "Just Land! 🔥",
    subtitle: "Fresh drops wey just enter — grab am before e finish.",
    icon: Clock,
    badge: "New In",
  },
  featured: {
    title: "Na Dem Dey Rush! 🏆",
    subtitle: "The pieces wey everybody dey carry — best sellers of the moment.",
    icon: Flame,
    badge: "Best Sellers",
  },
  "top-rated": {
    title: "5-Star Originals ⭐",
    subtitle: "Top-rated culture gear — verified quality, zero cap.",
    icon: Star,
    badge: "Top Rated",
  },
};

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const image = product.product_images?.[0];
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="naija-card group block overflow-hidden"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-muted">
          {image ? (
            <img
              src={image.image_url}
              alt={image.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-accent text-xs">
              No image
            </div>
          )}

          {/* Overlay actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <QuickAddToCart productId={product.id} productName={product.name} />
          </div>

          {discount && discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-accent">
              -{discount}%
            </Badge>
          )}

          {product.is_limited_edition && (
            <Badge className="absolute bottom-3 left-3 bg-naija-gold text-secondary font-accent text-[10px]">
              Limited Edition
            </Badge>
          )}
        </div>

        <div className="p-3 md:p-4">
          {product.pidgin_tagline && (
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1 truncate">
              {product.pidgin_tagline}
            </p>
          )}
          <h3 className="font-accent text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-accent text-base font-black text-foreground">
              ₦{product.price.toLocaleString()}
            </span>
            {product.compare_at_price && (
              <span className="font-body text-xs text-muted-foreground line-through">
                ₦{product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="naija-card overflow-hidden">
    <Skeleton className="aspect-square rounded-t-2xl" />
    <div className="p-3 md:p-4 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-5 w-16" />
    </div>
  </div>
);

const ProductSection = ({ type }: { type: SectionType }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const config = sectionConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase
        .from("products")
        .select("id, name, slug, price, compare_at_price, is_limited_edition, pidgin_tagline, product_images(image_url, alt_text)")
        .eq("is_active", true)
        .limit(8);

      if (type === "new") {
        query = query.order("created_at", { ascending: false });
      } else if (type === "featured") {
        query = query.eq("is_featured", true).order("updated_at", { ascending: false });
      } else {
        // top-rated: use featured + limited edition as proxy
        query = query.or("is_featured.eq.true,is_limited_edition.eq.true").order("price", { ascending: false });
      }

      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, [type]);

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-10 gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4">
              <Icon className="w-3.5 h-3.5" />
              {config.badge}
            </span>
            <h2 className="font-accent text-3xl md:text-4xl font-black text-foreground">
              {config.title}
            </h2>
          </div>
          <p className="font-body text-muted-foreground max-w-sm text-sm">
            {config.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center mt-8 md:mt-10"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-accent text-sm font-semibold border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-wide"
          >
            See All {config.badge} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const HomeProductShowcase = () => (
  <>
    <ProductSection type="new" />
    <div className="naija-section-divider container mx-auto" />
    <ProductSection type="featured" />
    <div className="naija-section-divider container mx-auto" />
    <ProductSection type="top-rated" />
  </>
);

export default HomeProductShowcase;
