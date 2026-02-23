import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Watch, Backpack, Footprints, Home, Sparkles, ArrowRight, type LucideIcon } from "lucide-react";
import productsShowcase from "@/assets/products-showcase.jpg";

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
    <section id="shop" className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4">
              Our Top Picks
            </span>
            <h2 className="font-accent text-4xl md:text-5xl font-black text-foreground">
              Top Culture Gear For
              <br />
              <span className="text-primary">Peak</span> Performance!
            </h2>
          </div>
          <p className="font-body text-muted-foreground max-w-sm">
            Discover the best of our collection, designed to power your cultural expression all year round.
          </p>
        </div>

        {/* Featured cards - two large */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {categories.slice(0, 2).map((cat) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group relative rounded-3xl overflow-hidden min-h-[400px] bg-secondary flex flex-col justify-end p-8 border border-border"
              >
                <img
                  src={productsShowcase}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                />
                <div className="relative z-10">
                  <span className="font-accent text-xs text-secondary-foreground/60 uppercase tracking-wider mb-2 block">
                    {cat.pidgin || "Explore"}
                  </span>
                  <h3 className="font-accent text-3xl md:text-4xl font-black text-secondary-foreground leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Smaller category cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(2).map((cat) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="naija-card p-6 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-accent text-base font-bold text-foreground mb-1">{cat.name}</h3>
                <p className="font-body text-xs text-muted-foreground">{cat.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex px-8 py-4 rounded-full font-accent font-semibold text-sm bg-primary text-primary-foreground hover:bg-naija-green-glow transition-all duration-300 uppercase tracking-wide items-center gap-2"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCategoriesSection;
