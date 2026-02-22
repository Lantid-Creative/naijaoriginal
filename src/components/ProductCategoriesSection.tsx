import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Watch, Backpack, Footprints, Home, Sparkles, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Shirt, Watch, Backpack, Footprints, Home, Sparkles,
};

const ProductCategoriesSection = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("product_categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  return (
    <section id="shop" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-naija-gold/30 text-naija-gold font-accent text-xs tracking-widest uppercase mb-4">
            Product Categories
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
            Wetin We <span className="naija-gradient-text">Dey Sell</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Every product na a piece of Nigeria. Real talk, real culture, real QR-verified drip.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="naija-card p-6 group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{cat.name}</h3>
                    {cat.pidgin && (
                      <p className="font-body text-sm text-muted-foreground italic mb-2">"{cat.pidgin}"</p>
                    )}
                    <p className="font-accent text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex px-8 py-4 rounded-lg font-body font-semibold text-base bg-primary text-primary-foreground hover:bg-naija-green-glow transition-all duration-300"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCategoriesSection;
