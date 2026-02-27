import { useState } from "react";
import { formatNaira } from "@/lib/format";
import { Calculator, AlertTriangle, Building2, Users, Shirt, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const productTypes = [
  { id: "tshirt", label: "T-Shirts", basePrice: 8500, icon: Shirt },
  { id: "hoodie", label: "Hoodies", basePrice: 18000, icon: Shirt },
  { id: "cap", label: "Caps / Hats", basePrice: 5500, icon: Package },
  { id: "tote", label: "Tote Bags", basePrice: 6000, icon: Package },
  { id: "polo", label: "Polo Shirts", basePrice: 12000, icon: Shirt },
  { id: "jacket", label: "Jackets / Bombers", basePrice: 25000, icon: Shirt },
  { id: "mug", label: "Branded Mugs", basePrice: 3500, icon: Package },
  { id: "notebook", label: "Notebooks", basePrice: 4000, icon: Package },
];

const customizations = [
  { id: "logo", label: "Custom Logo / Branding", price: 500, desc: "Add your organization logo" },
  { id: "name", label: "Individual Name Printing", price: 300, desc: "Personalize each item" },
  { id: "packaging", label: "Custom Packaging", price: 800, desc: "Branded box/bag per item" },
  { id: "qr", label: "QR Authentication Tag", price: 1000, desc: "Each item get unique QR code" },
];

const Estimate = () => {
  const [selectedProduct, setSelectedProduct] = useState("tshirt");
  const [quantity, setQuantity] = useState(50);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("company");

  const product = productTypes.find((p) => p.id === selectedProduct)!;

  // Bulk discount tiers
  const getDiscount = (qty: number) => {
    if (qty >= 1000) return 0.20;
    if (qty >= 500) return 0.15;
    if (qty >= 200) return 0.10;
    if (qty >= 100) return 0.05;
    return 0;
  };

  const discount = getDiscount(quantity);
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const extra = customizations.find((c) => c.id === id);
    return sum + (extra?.price || 0);
  }, 0);
  const unitPrice = product.basePrice + extrasTotal;
  const subtotal = unitPrice * quantity;
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="py-8 md:py-12 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-accent text-xs font-semibold tracking-widest uppercase mb-4">
              Corporate & Custom Orders
            </span>
            <h1 className="font-accent text-3xl md:text-5xl font-black text-foreground mb-3">
              Get Your <span className="text-primary">Estimate</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
              We dey help companies, NGOs, and government bodies customize anything and everything. Use this calculator to get rough idea of pricing.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-accent text-sm font-bold text-foreground mb-1">Disclaimer Notice</p>
                <p className="font-body text-xs text-muted-foreground">
                  This calculator dey provide rough estimates only. Final pricing go depend on specific design requirements, materials, delivery location, and timeline. Contact us for accurate quote. Prices fit change without notice.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-6 md:gap-8">
            {/* Left: Configuration */}
            <div className="lg:col-span-3 space-y-6">
              {/* Org Info */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-accent text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Organization Details
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm text-foreground block mb-1.5">Organization Name</label>
                    <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. GTBank, UNICEF, Lagos State" className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="font-body text-sm text-foreground block mb-1.5">Type</label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full h-10 rounded-md border border-border bg-background px-3 font-body text-sm text-foreground"
                    >
                      <option value="company">Company / Corporate</option>
                      <option value="ngo">NGO / Non-Profit</option>
                      <option value="government">Government Agency</option>
                      <option value="school">School / University</option>
                      <option value="event">Event / Conference</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-accent text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-primary" /> Choose Product
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {productTypes.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProduct(p.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedProduct === p.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <p className="font-accent text-xs font-semibold">{p.label}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{formatNaira(p.basePrice)}/pc</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-accent text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Quantity
                </h2>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                    className="bg-background border-border w-32"
                  />
                  <span className="font-body text-sm text-muted-foreground">pieces (minimum 10)</span>
                </div>
                {discount > 0 && (
                  <p className="font-accent text-xs text-primary mt-2">🎉 You dey get {discount * 100}% bulk discount!</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[50, 100, 200, 500, 1000].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setQuantity(qty)}
                      className={`px-3 py-1 rounded-lg font-accent text-xs transition-all ${
                        quantity === qty ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customizations */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-accent text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Customizations
                </h2>
                <div className="space-y-3">
                  {customizations.map((c) => (
                    <label
                      key={c.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedExtras.includes(c.id) ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(c.id)}
                        onChange={() => toggleExtra(c.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-accent text-sm font-semibold text-foreground">{c.label}</p>
                        <p className="font-body text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                      <span className="font-accent text-xs font-bold text-primary">+{formatNaira(c.price)}/pc</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h3 className="font-accent text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" /> Estimate Summary
                </h3>

                {orgName && (
                  <p className="font-body text-sm text-muted-foreground mb-4">For: <span className="text-foreground font-semibold">{orgName}</span></p>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">{product.label}</span>
                    <span className="text-foreground">{formatNaira(product.basePrice)}/pc</span>
                  </div>
                  {selectedExtras.map((id) => {
                    const extra = customizations.find((c) => c.id === id);
                    if (!extra) return null;
                    return (
                      <div key={id} className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">+ {extra.label}</span>
                        <span className="text-foreground">{formatNaira(extra.price)}/pc</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Unit Price</span>
                      <span className="text-foreground font-semibold">{formatNaira(unitPrice)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="text-foreground">× {quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatNaira(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-primary">Bulk Discount ({discount * 100}%)</span>
                      <span className="text-primary">-{formatNaira(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between font-accent font-bold text-lg">
                      <span className="text-foreground">Estimated Total</span>
                      <span className="text-primary">{formatNaira(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a href={`mailto:howfar@naijaoriginal.com?subject=Custom Order Estimate - ${orgName || "Organization"}&body=Product: ${product.label}%0AQuantity: ${quantity}%0AEstimated Total: ${formatNaira(total)}%0ACustomizations: ${selectedExtras.join(", ") || "None"}%0AOrganization Type: ${orgType}`}>
                    <Button className="w-full font-body font-semibold gap-2" size="lg">
                      Request Official Quote <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                  <p className="font-body text-[11px] text-muted-foreground text-center">
                    We go respond within 24-48 hours with official quote
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="font-accent text-xs font-bold text-foreground mb-2">Bulk Discount Tiers:</p>
                  <div className="space-y-1 font-body text-xs text-muted-foreground">
                    <p>100+ pieces → 5% off</p>
                    <p>200+ pieces → 10% off</p>
                    <p>500+ pieces → 15% off</p>
                    <p>1,000+ pieces → 20% off</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Estimate;
