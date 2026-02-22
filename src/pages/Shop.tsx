import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Filter, X } from "lucide-react";
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

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"));
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Handle category from URL
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam && categories.length > 0) {
      // If it's a slug, find the ID
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

  const filtered = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const getImage = (p: Product) => {
    const sorted = [...(p.product_images || [])].sort((a, b) => a.display_order - b.display_order);
    return sorted[0]?.image_url || "/placeholder.svg";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="py-12 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-naija-gold/30 text-naija-gold font-accent text-xs tracking-widest uppercase mb-4">
              The Shop
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-black text-foreground mb-4">
              Wetin We <span className="naija-gradient-text">Dey Sell</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-lg mx-auto">
              Every product na a piece of Nigeria. Real talk, real culture, real QR-verified drip.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-body text-sm transition-all ${
                  !selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-body text-sm transition-all ${
                    selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground font-body text-sm"
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
            <p className="font-accent text-sm text-muted-foreground">{filtered.length} products</p>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden mb-6 flex flex-wrap gap-2">
              <button onClick={() => { setSelectedCategory(null); setShowFilters(false); }} className={`px-3 py-1.5 rounded-lg font-body text-xs ${!selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>All</button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }} className={`px-3 py-1.5 rounded-lg font-body text-xs ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{cat.name}</button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="naija-card overflow-hidden animate-pulse">
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
              <h3 className="font-display text-xl font-bold text-foreground mb-2">No products found</h3>
              <p className="font-body text-muted-foreground">Try another category or check back later!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="naija-card overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden relative bg-muted">
                    <img
                      src={getImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.is_limited_edition && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-secondary text-secondary-foreground font-accent text-[10px] font-bold uppercase tracking-wider">
                        Limited Drop
                      </span>
                    )}
                    {product.compare_at_price && (
                      <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-destructive text-destructive-foreground font-accent text-[10px] font-bold">
                        SALE
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.pidgin_tagline && (
                      <p className="font-body text-xs text-muted-foreground italic mb-2 line-clamp-1">
                        "{product.pidgin_tagline}"
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-body font-bold text-foreground">${product.price.toFixed(2)}</span>
                      {product.compare_at_price && (
                        <span className="font-body text-sm text-muted-foreground line-through">
                          ${product.compare_at_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
