import { useState, useEffect, useMemo } from "react";
import { formatNaira } from "@/lib/format";
import { Calculator, AlertTriangle, Building2, Users, Shirt, Package, ArrowRight, Search, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ProductOption {
  id: string;
  name: string;
  price: number;
  category_name: string | null;
  image_url: string | null;
}

interface SelectedProduct {
  product: ProductOption;
  quantity: number;
}

const customizations = [
  { id: "logo", label: "Custom Logo / Branding", price: 500, desc: "Add your organization logo" },
  { id: "name", label: "Individual Name Printing", price: 300, desc: "Personalize each item" },
  { id: "packaging", label: "Custom Packaging", price: 800, desc: "Branded box/bag per item" },
  { id: "qr", label: "QR Authentication Tag", price: 1000, desc: "Each item get unique QR code" },
];

const Estimate = () => {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("company");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, product_categories:category_id(name), product_images(image_url, display_order)")
        .eq("is_active", true)
        .order("name");
      
      const mapped: ProductOption[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category_name: p.product_categories?.name || null,
        image_url: p.product_images?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))[0]?.image_url || null,
      }));
      setProducts(mapped);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category_name || "Other"))).sort(), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || (p.category_name || "Other") === categoryFilter;
      const notAlreadySelected = !selectedProducts.some((sp) => sp.product.id === p.id);
      return matchesSearch && matchesCategory && notAlreadySelected;
    });
  }, [products, search, categoryFilter, selectedProducts]);

  const addProduct = (product: ProductOption) => {
    setSelectedProducts((prev) => [...prev, { product, quantity: 50 }]);
    setSearch("");
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((sp) => sp.product.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((sp) => (sp.product.id === id ? { ...sp, quantity: Math.max(10, quantity) } : sp))
    );
  };

  // Bulk discount tiers
  const getDiscount = (qty: number) => {
    if (qty >= 1000) return 0.20;
    if (qty >= 500) return 0.15;
    if (qty >= 200) return 0.10;
    if (qty >= 100) return 0.05;
    return 0;
  };

  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const extra = customizations.find((c) => c.id === id);
    return sum + (extra?.price || 0);
  }, 0);

  const totalQuantity = selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0);
  const discount = getDiscount(totalQuantity);

  const lineItems = selectedProducts.map((sp) => {
    const unitPrice = sp.product.price + extrasTotal;
    const lineSubtotal = unitPrice * sp.quantity;
    return { ...sp, unitPrice, lineSubtotal };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineSubtotal, 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const emailBody = selectedProducts
    .map((sp) => `${sp.product.name} x${sp.quantity} @ ${formatNaira(sp.product.price + extrasTotal)}/pc`)
    .join("%0A");

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
                  <Shirt className="w-4 h-4 text-primary" /> Add Products
                  {selectedProducts.length > 0 && (
                    <span className="ml-auto font-body text-xs text-muted-foreground">{selectedProducts.length} selected</span>
                  )}
                </h2>

                {/* Selected products */}
                {selectedProducts.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {selectedProducts.map((sp) => (
                      <div key={sp.product.id} className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
                        {sp.product.image_url && (
                          <img src={sp.product.image_url} alt={sp.product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-accent text-xs font-semibold text-foreground truncate">{sp.product.name}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{formatNaira(sp.product.price)}/pc</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Input
                            type="number"
                            min={10}
                            value={sp.quantity}
                            onChange={(e) => updateQuantity(sp.product.id, parseInt(e.target.value) || 10)}
                            className="w-20 h-8 text-xs bg-background border-border text-center"
                          />
                          <button
                            onClick={() => removeProduct(sp.product.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search and filter */}
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="pl-9 bg-background border-border"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 font-body text-xs text-foreground"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Product list */}
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                    {filteredProducts.length === 0 ? (
                      <p className="font-body text-sm text-muted-foreground text-center py-4">
                        {search ? "No products match your search" : "All products have been added"}
                      </p>
                    ) : (
                      filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addProduct(p)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        >
                          {p.image_url && (
                            <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-accent text-xs font-semibold text-foreground truncate">{p.name}</p>
                            <p className="font-body text-[10px] text-muted-foreground">{p.category_name} • {formatNaira(p.price)}/pc</p>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Customizations */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-accent text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Customizations (per piece)
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

                {selectedProducts.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground py-4 text-center">Add products to see estimate</p>
                ) : (
                  <div className="space-y-3 mb-6">
                    {lineItems.map((li) => (
                      <div key={li.product.id} className="font-body text-sm">
                        <div className="flex justify-between">
                          <span className="text-foreground font-medium truncate mr-2">{li.product.name}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-xs mt-0.5">
                          <span>{formatNaira(li.unitPrice)}/pc × {li.quantity.toLocaleString()}</span>
                          <span className="text-foreground">{formatNaira(li.lineSubtotal)}</span>
                        </div>
                      </div>
                    ))}

                    {extrasTotal > 0 && (
                      <div className="font-body text-xs text-muted-foreground">
                        <span>Includes {formatNaira(extrasTotal)}/pc in customizations</span>
                      </div>
                    )}

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Total Quantity</span>
                        <span className="text-foreground font-semibold">{totalQuantity.toLocaleString()} pieces</span>
                      </div>
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
                )}

                <div className="space-y-3">
                  <Button
                    className="w-full font-body font-semibold gap-2"
                    size="lg"
                    disabled={selectedProducts.length === 0}
                    asChild={selectedProducts.length > 0}
                  >
                    {selectedProducts.length > 0 ? (
                      <a href={`mailto:howfar@naijaoriginal.com?subject=Custom Order Estimate - ${orgName || "Organization"}&body=Products:%0A${emailBody}%0A%0AEstimated Total: ${formatNaira(total)}%0ACustomizations: ${selectedExtras.join(", ") || "None"}%0AOrganization Type: ${orgType}`}>
                        Request Official Quote <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <>Request Official Quote <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                  <p className="font-body text-[11px] text-muted-foreground text-center">
                    We go respond within 24-48 hours with official quote
                  </p>
                </div>

                {discount > 0 && (
                  <p className="font-accent text-xs text-primary mt-3">🎉 You dey get {discount * 100}% bulk discount!</p>
                )}

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
