import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { Search, Package, CheckCircle, Truck, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const statusSteps = [
  { key: "pending", label: "Order Don Place", icon: Clock },
  { key: "paid", label: "Payment Confirmed ✅", icon: CheckCircle },
  { key: "processing", label: "We Dey Prepare Am", icon: Package },
  { key: "shipped", label: "E Don Ship 🚚", icon: Truck },
  { key: "delivered", label: "Delivered! 🎉", icon: MapPin },
];

const getStatusIndex = (status: string) => {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
};

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*, products:product_id(name, slug))")
      .eq("order_number", orderNumber.trim().toUpperCase())
      .maybeSingle();
    setOrder(data);
    setLoading(false);
  };

  const currentStep = order ? getStatusIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="py-8 md:py-12 text-center">
            <h1 className="font-accent text-3xl md:text-4xl font-black text-foreground mb-2">Track Your Order 📦</h1>
            <p className="font-body text-muted-foreground text-sm">Enter your order number make we show you where e dey</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-10">
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. NO-20260224-ABC123"
              className="bg-card border-border font-body"
            />
            <Button type="submit" disabled={loading} className="font-body font-semibold gap-2 shrink-0">
              <Search className="w-4 h-4" />
              {loading ? "..." : "Track"}
            </Button>
          </form>

          {searched && !loading && !order && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-accent text-lg font-bold text-foreground mb-1">Order no dey here o!</h3>
              <p className="font-body text-sm text-muted-foreground">Check your order number well, try again.</p>
            </div>
          )}

          {order && (
            <div className="space-y-8">
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-accent text-lg font-bold text-foreground">{order.order_number}</h2>
                  <span className="px-3 py-1 rounded-full font-accent text-xs font-semibold capitalize bg-primary/10 text-primary">
                    {order.status}
                  </span>
                </div>

                <div className="relative">
                  {statusSteps.map((step, i) => {
                    const active = i <= currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {i < statusSteps.length - 1 && (
                            <div className={`w-0.5 h-8 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                        <div className="pt-2">
                          <p className={`font-accent text-sm font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h3 className="font-accent text-base font-bold text-foreground mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">
                        {item.products?.name || item.product_name} × {item.quantity}
                        {item.selected_size && ` (${item.selected_size})`}
                      </span>
                      <span className="text-foreground font-medium">{formatNaira(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-4 flex justify-between font-accent font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatNaira(Number(order.total))}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTracking;
