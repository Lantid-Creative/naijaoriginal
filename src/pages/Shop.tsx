import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, SlidersHorizontal, X, Search, Heart, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  pidgin: string | null;
}

type SortOption = "featured" | "price-low" | "price-high" | "newest";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"));
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toast } = useToast();

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam && categories.length > 0) {
      const found = categories.find((c) => c.slug === catParam || c.id === catParam);
      setSelectedCategory(found?.id || catParam);
    }
  }, [searchParams, categories]);

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, slug, price, compare_at_price, pidgin_tagline, is_limited_edition, is_featured, category_id, product_images(image_url, display_order)")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase.from("product_categories").select("id, name, slug, pidgin").order("name"),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  let filtered = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.pidgin_tagline && p.pidgin_tagline.toLowerCase().includes(q))
    );
  }

  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "newest": return 0;
      default: return 0;
    }
  });

  const getImage = (p: Product) => {
    const sorted = [...(p.product_images || [])].sort((a, b) => a.display_order - b.display_order);
    return sorted[0]?.image_url || "/placeholder.svg";
  };

  const selectedCatName = categories.find(c => c.id === selectedCategory)?.name;

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-3">
              The Shop
            </span>
            <h1 className="font-accent text-3xl md:text-5xl font-black text-foreground mb-2">
              {selectedCatName || "All Products"}
            </h1>
            <p className="font-body text-muted-foreground max-w-lg text-sm md:text-base">
              Every product na a piece of Nigeria. Real talk, real culture, real QR-verified drip. 🇳🇬
            </p>
          </motion.div>

          {/* Search + Sort + Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products... wetin you dey find?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 rounded-xl bg-card border border-border font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="newest">Newest</option>
            </select>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-body text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> Categories
            </button>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <div className="hidden md:block w-52 flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                <p className="font-accent text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Categories</p>
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-all ${
                    !selectedCategory ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-all ${
                      selectedCategory === cat.id ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {showMobileFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden absolute left-0 right-0 z-20 bg-background border-b border-border px-4 pb-4 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={() => { handleCategoryChange(null); setShowMobileFilters(false); }} className={`px-3 py-1.5 rounded-lg font-body text-xs ${!selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>All</button>
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => { handleCategoryChange(cat.id); setShowMobileFilters(false); }} className={`px-3 py-1.5 rounded-lg font-body text-xs ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{cat.name}</button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="font-accent text-xs text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                      <div className="aspect-square bg-muted" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-accent text-xl font-bold text-foreground mb-2">No products dey here o!</h3>
                  <p className="font-body text-muted-foreground text-sm">Try another category or search term abeg!</p>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                >
                  {filtered.map((product, i) => (
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
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (!user) { toast({ title: "Sign in first make you save items", variant: "destructive" }); return; }
                                toggleWishlist(product.id);
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isInWishlist(product.id) ? "bg-destructive text-destructive-foreground" : "bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground"
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
                                isInCompare(product.id) ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground"
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
                            <span className="font-accent font-bold text-sm md:text-base text-foreground">{formatNaira(product.price)}</span>
                            {product.compare_at_price && (
                              <span className="font-body text-xs text-muted-foreground line-through">
                                {formatNaira(product.compare_at_price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
