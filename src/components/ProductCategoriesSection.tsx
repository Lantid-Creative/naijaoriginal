import { Shirt, Watch, Backpack, Footprints, Home, Sparkles } from "lucide-react";
import productsImage from "@/assets/products-showcase.jpg";

const categories = [
  {
    icon: Shirt,
    name: "Apparel & Wearables",
    pidgin: "Cloth wey go make dem look you twice",
    items: "T-Shirts • Hoodies • Agbada Fusion • Joggers",
    price: "From $25",
  },
  {
    icon: Watch,
    name: "Accessories & Jewelry",
    pidgin: "Drip wey carry meaning, no be just shine",
    items: "Wristwatches • Pendants • Beaded Bracelets",
    price: "From $5",
  },
  {
    icon: Backpack,
    name: "Bags & Travel",
    pidgin: "Carry Naija go anywhere you dey go",
    items: "Backpacks • Duffel Bags • Totes • Suitcases",
    price: "From $20",
  },
  {
    icon: Footprints,
    name: "Footwear",
    pidgin: "Step out with style, step out with culture",
    items: "Ankara Sneakers • Slides • Modern Slippers",
    price: "From $25",
  },
  {
    icon: Home,
    name: "Home & Lifestyle",
    pidgin: "Make your space talk Naija too",
    items: "Mugs • Phone Cases • Wall Art • Pillows",
    price: "From $8",
  },
  {
    icon: Sparkles,
    name: "Limited Drops",
    pidgin: "Once e finish, e don finish — no dulling!",
    items: "Festival Editions • City Series • Collabs",
    price: "Exclusive",
  },
];

const ProductCategoriesSection = () => {
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

        {/* Showcase Image */}
        <div className="mb-16 max-w-3xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-border">
            <img
              src={productsImage}
              alt="Naija Originals product showcase — cap, sneakers, tote bag"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="naija-card p-6 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <cat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">{cat.name}</h3>
                  <p className="font-body text-sm text-muted-foreground italic mb-2">"{cat.pidgin}"</p>
                  <p className="font-accent text-xs text-muted-foreground mb-3">{cat.items}</p>
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-accent text-xs font-semibold">
                    {cat.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategoriesSection;
