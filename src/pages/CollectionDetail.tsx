import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Heart, Scale, Star, ArrowLeft, ArrowRight, ChevronRight, Home } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { useToast } from "@/hooks/use-toast";
import { useProductRatings } from "@/hooks/useProductRatings";
import { formatNaira } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuickAddToCart from "@/components/QuickAddToCart";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  pidgin_tagline: string | null;
  is_limited_edition: boolean;
  is_featured: boolean;
  category_id: string | null;
  product_images: { image_url: string; display_order: number }[];
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pidgin_tagline: string | null;
  type: string;
  icon: string | null;
  banner_image_url: string | null;
}

const CollectionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toast } = useToast();
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const ratings = useProductRatings(productIds);

  useEffect(() => {
    const fetchCollectionAndProducts = async () => {
      if (!slug) return;

      // Fetch collection
      const { data: collectionData } = await supabase
        .from("product_collections")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (!collectionData) {
        setLoading(false);
        return;
      }

      setCollection(collectionData);

      // Fetch products in collection
      const { data: itemsData } = await supabase
        .from("product_collection_items")
        .select("product_id")
        .eq("collection_id", collectionData.id)
        .order("display_order");

      if (itemsData && itemsData.length > 0) {
        const productIds = itemsData.map((item) => item.product_id);
        const { data: productsData } = await supabase
          .from("products")
          .select(
            "id, name, slug, price, compare_at_price, pidgin_tagline, is_limited_edition, is_featured, category_id, product_images(image_url, display_order)"
          )
          .eq("is_active", true)
          .in("id", productIds);

        setProducts(productsData || []);
      }

      setLoading(false);
    };

    fetchCollectionAndProducts();
  }, [slug]);

  const getImage = (p: Product) => {
    const sorted = [...(p.product_images || [])].sort((a, b) => a.display_order - b.display_order);
    return sorted[0]?.image_url || "/placeholder.svg";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="py-8 md:py-12 space-y-4">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-10 w-64 bg-muted rounded animate-pulse" />
              <div className="h-5 w-96 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 md:px-6 text-center py-20">
            <h1 className="font-accent text-2xl font-bold text-foreground mb-2">Collection Not Found</h1>
            <p className="font-body text-muted-foreground mb-6">This collection no dey o!</p>
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-accent font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Collections
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-12"
          >
            <Link
              to="/collections"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-accent text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Collections
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl md:text-5xl">{collection.icon || "🎁"}</span>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase">
                {collection.type === "seasonal" ? "Seasonal" : "Gift Collection"}
              </span>
            </div>
            <h1 className="font-accent text-3xl md:text-5xl font-black text-foreground mb-2">
              {collection.name}
            </h1>
            {collection.pidgin_tagline && (
              <p className="font-body text-muted-foreground italic text-sm md:text-base mb-2">
                "{collection.pidgin_tagline}"
              </p>
            )}
            <p className="font-body text-muted-foreground max-w-2xl text-sm md:text-base">
              {collection.description}
            </p>
          </motion.div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-accent text-xl font-bold text-foreground mb-2">No products yet!</p>
              <p className="font-body text-muted-foreground text-sm">We dey work on am, check back soon!</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="font-accent text-sm text-muted-foreground">
                  {products.length} product{products.length !== 1 ? "s" : ""} for this collection
                </p>
              </div>
              <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <Link
                      to={`/product/${product.slug}`}
                      className="bg-card rounded-2xl overflow-hidden border border-border group block hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="aspect-square overflow-hidden relative bg-muted">
                        <img
                          src={getImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {product.is_limited_edition && (
                          <span className="absolute top-2 left-2 md:top-3 md:left-3 px-2 py-1 rounded-lg bg-secondary text-secondary-foreground font-accent text-[10px] font-bold uppercase tracking-wider">
                            Limited
                          </span>
                        )}
                        {product.compare_at_price && (
                          <span className="absolute top-2 right-2 md:top-3 md:right-3 px-2 py-1 rounded-lg bg-destructive text-destructive-foreground font-accent text-[10px] font-bold">
                            SALE
                          </span>
                        )}
                        <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <QuickAddToCart productId={product.id} productName={product.name} />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!user) {
                                toast({ title: "Sign in first make you save items", variant: "destructive" });
                                return;
                              }
                              toggleWishlist(product.id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isInWishlist(product.id)
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground"
                            }`}
                          >
                            <Heart className="w-3.5 h-3.5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (isInCompare(product.id)) {
                                removeFromCompare(product.id);
                              } else {
                                addToCompare(product.id);
                                toast({ title: "E don enter compare list!" });
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isInCompare(product.id)
                                ? "bg-primary text-primary-foreground"
                                : "bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground"
                            }`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="font-accent text-sm md:text-base font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        {product.pidgin_tagline && (
                          <p className="font-body text-[11px] md:text-xs text-muted-foreground italic mb-1.5 line-clamp-1">
                            "{product.pidgin_tagline}"
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-accent font-bold text-sm md:text-base text-foreground">
                            {formatNaira(product.price)}
                          </span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="font-body text-xs text-muted-foreground line-through">
                              {formatNaira(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                        {ratings[product.id] && ratings[product.id].count > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-naija-gold fill-naija-gold" />
                            <span className="font-accent text-xs font-bold text-foreground">
                              {ratings[product.id].avg.toFixed(1)}
                            </span>
                            <span className="font-body text-[10px] text-muted-foreground">
                              ({ratings[product.id].count})
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>

        {/* Related Collections */}
        <RelatedCollections currentSlug={slug!} currentType={collection.type} />
      </main>
      <Footer />
    </div>
  );
};


const RelatedCollections = ({ currentSlug, currentType }: { currentSlug: string; currentType: string }) => {
  const { collections } = useCollections();
  const related = collections
    .filter((c) => c.slug !== currentSlug)
    .sort((a, b) => (a.type === currentType ? -1 : 1) - (b.type === currentType ? -1 : 1))
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16 border-t border-border mt-12">
      <h2 className="font-accent text-2xl md:text-3xl font-black text-foreground mb-6">
        More Collections 🔥
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {related.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Link
              to={`/collections/${c.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {c.banner_image_url ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={c.banner_image_url}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-5xl">{c.icon || "🎁"}</span>
                </div>
              )}
              <div className="p-3 md:p-4 bg-card">
                <h3 className="font-accent text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {c.name}
                </h3>
                {c.pidgin_tagline && (
                  <p className="font-body text-[10px] md:text-xs text-muted-foreground italic mt-0.5 truncate">
                    {c.pidgin_tagline}
                  </p>
                )}
                <div className="flex items-center gap-1 text-primary font-accent text-xs font-semibold mt-2">
                  Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CollectionDetail;
