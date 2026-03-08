import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Truck, Zap, Globe } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { orderConfirmationEmail } from "@/lib/email-templates";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MIN_ORDER_AMOUNT = 30000;

type ShippingOption = "standard" | "fast" | "international";

const SHIPPING_OPTIONS = {
  standard: { label: "Standard Shipping", price: 5000, icon: Truck, description: "~2 weeks delivery within Nigeria" },
  fast: { label: "Fast Shipping", price: 10000, icon: Zap, description: "3–5 days delivery within Nigeria ⚡" },
  international: { label: "International Shipping", price: 0, icon: Globe, description: "We go calculate and contact you with the cost" },
};

const Checkout = () => {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingOption, setShippingOption] = useState<ShippingOption>("standard");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    zip: "",
  });

  const isNigeria = form.country.toLowerCase().trim() === "nigeria";

  // Auto-select international when country changes
  useEffect(() => {
    if (!isNigeria) {
      setShippingOption("international");
    } else if (shippingOption === "international") {
      setShippingOption("standard");
    }
  }, [isNigeria]);

  // Auto-fill from profile for logged-in users
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, shipping_address")
        .eq("id", user.id)
        .single();
      if (data) {
        const addr = (data.shipping_address as any) || {};
        setForm((prev) => ({
          ...prev,
          fullName: data.full_name || prev.fullName,
          email: data.email || user.email || prev.email,
          phone: data.phone || prev.phone,
          address: addr.address || prev.address,
          city: addr.city || prev.city,
          state: addr.state || prev.state,
          country: addr.country || prev.country,
          zip: addr.zip || prev.zip,
        }));
      }
    };
    fetchProfile();
  }, [user]);

  const shipping = shippingOption === "international" ? 0 : SHIPPING_OPTIONS[shippingOption].price;
  const orderTotal = total + shipping;
  const isInternational = shippingOption === "international";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const orderPayload: any = {
        subtotal: total,
        shipping_cost: shipping,
        total: isInternational ? total : orderTotal,
        shipping_address: {
          full_name: form.fullName,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          zip: form.zip,
          phone: form.phone,
        },
        notes: isInternational
          ? `INTERNATIONAL ORDER — Shipping to ${form.country}. Shipping cost needs to be calculated and sent to customer.`
          : `Shipping: ${SHIPPING_OPTIONS[shippingOption].label}`,
      };
      if (user) {
        orderPayload.user_id = user.id;
      } else {
        orderPayload.guest_email = form.email;
        orderPayload.guest_name = form.fullName;
      }

      if (isInternational) {
        orderPayload.status = "pending_shipping_quote";
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || "Product",
        quantity: item.quantity,
        price: item.product?.price || 0,
        selected_size: item.selected_size,
        selected_color: item.selected_color,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Alert admin for international orders
      if (isInternational) {
        await supabase.from("admin_notifications").insert({
          type: "international_order",
          title: "International Order — Shipping Quote Needed! 🌍",
          message: `Order #${order.order_number} needs international shipping quote. Customer: ${form.fullName}, Country: ${form.country}, City: ${form.city}. Email: ${form.email || user?.email}. Subtotal: ₦${total.toLocaleString()}.`,
          metadata: { order_id: order.id, order_number: order.order_number, country: form.country, email: form.email || user?.email },
        });

        // Send email to customer about pending quote
        const emailTo = user?.email || form.email;
        if (emailTo) {
          supabase.functions.invoke("send-email", {
            body: {
              to: emailTo,
              subject: `Order Received! #${order.order_number} — Shipping Quote Coming 🌍`,
              html: orderConfirmationEmail({
                orderNumber: order.order_number,
                customerName: form.fullName || user?.user_metadata?.full_name || "",
                total,
                items: orderItems.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.price * i.quantity })),
              }),
            },
          });
        }

        toast({ title: "Order don receive! 🌍", description: `We go calculate your international shipping and contact you with the total.` });
        await clearCart();
        navigate(`/order-confirmation/${order.order_number}`);
        return;
      }

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke("initialize-payment", {
        body: {
          email: user?.email || form.email,
          amount: Math.round(orderTotal * 100),
          order_id: order.id,
          order_number: order.order_number,
        },
      });

      if (paymentError || !paymentData?.authorization_url) {
        const emailTo = user?.email || form.email;
        if (emailTo) {
          supabase.functions.invoke("send-email", {
            body: {
              to: emailTo,
              subject: `Order Confirmed! #${order.order_number} 🎉`,
              html: orderConfirmationEmail({
                orderNumber: order.order_number,
                customerName: form.fullName || user?.user_metadata?.full_name || "",
                total: orderTotal,
                items: orderItems.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.price * i.quantity })),
              }),
            },
          });
        }
        toast({ title: "Order don place! 🎉", description: `Order ${order.order_number} don create. Payment processing dey come soon!` });
        await clearCart();
        navigate(`/order-confirmation/${order.order_number}`);
        return;
      }

      await clearCart();
      window.location.href = paymentData.authorization_url;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 text-center py-20">
          <h1 className="font-display text-3xl font-black text-foreground mb-4">Nothing dey here to checkout</h1>
          <Link to="/shop" className="text-primary hover:underline font-body">← Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (total < MIN_ORDER_AMOUNT) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 text-center py-20">
          <h1 className="font-display text-3xl font-black text-foreground mb-4">Cart never reach minimum o! 😅</h1>
          <p className="font-body text-muted-foreground mb-6">Minimum order na {formatNaira(MIN_ORDER_AMOUNT)}. You still need {formatNaira(MIN_ORDER_AMOUNT - total)} more.</p>
          <Link to="/cart" className="text-primary hover:underline font-body">← Back to Cart</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const availableOptions = isNigeria
    ? (["standard", "fast"] as ShippingOption[])
    : (["international"] as ShippingOption[]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <Link to="/cart" className="inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-primary transition-colors py-6">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>

          <h1 className="font-display text-3xl font-black text-foreground mb-8">Checkout 🛍️</h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {!user && (
                <div className="naija-card p-6">
                  <p className="font-body text-sm text-muted-foreground mb-3">
                    You get account?{" "}
                    <Link to="/auth" className="text-primary hover:underline font-semibold">Sign in</Link>
                    {" "}make checkout fast!
                  </p>
                </div>
              )}

              <div className="naija-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm text-foreground block mb-1.5">Full Name *</label>
                    <Input name="fullName" value={form.fullName} onChange={handleChange} required className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="font-body text-sm text-foreground block mb-1.5">Email *</label>
                    <Input name="email" type="email" value={form.email} onChange={handleChange} required className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="font-body text-sm text-foreground block mb-1.5">Phone *</label>
                    <Input name="phone" value={form.phone} onChange={handleChange} required placeholder="+234..." className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="font-body text-sm text-foreground block mb-1.5">Country *</label>
                    <Input name="country" value={form.country} onChange={handleChange} required className="bg-background border-border" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-body text-sm text-foreground block mb-1.5">Address *</label>
                    <Input name="address" value={form.address} onChange={handleChange} required className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="font-body text-sm text-foreground block mb-1.5">City *</label>
                    <Input name="city" value={form.city} onChange={handleChange} required className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="font-body text-sm text-foreground block mb-1.5">State / Region *</label>
                    <Input name="state" value={form.state} onChange={handleChange} required className="bg-background border-border" />
                  </div>
                  {!isNigeria && (
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">Zip / Postal Code</label>
                      <Input name="zip" value={form.zip} onChange={handleChange} className="bg-background border-border" />
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Method */}
              <div className="naija-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">Shipping Method 🚚</h2>
                <div className="space-y-3">
                  {availableOptions.map((key) => {
                    const opt = SHIPPING_OPTIONS[key];
                    const Icon = opt.icon;
                    const isSelected = shippingOption === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setShippingOption(key)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-body text-sm font-semibold text-foreground">{opt.label}</div>
                          <div className="font-body text-xs text-muted-foreground">{opt.description}</div>
                        </div>
                        <div className="font-body text-sm font-bold text-foreground flex-shrink-0">
                          {key === "international" ? "TBD" : formatNaira(opt.price)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {isInternational && (
                  <div className="mt-4 bg-accent/50 border border-accent rounded-xl p-4">
                    <p className="font-body text-sm text-muted-foreground">
                      🌍 For international shipping, we go calculate the cost based on your location and contact you with the total before we ship. Your order go hold until you confirm.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="naija-card p-6 sticky top-24">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground truncate mr-2">
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span className="text-foreground flex-shrink-0">{formatNaira((item.product?.price || 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="naija-section-divider mb-3" />
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatNaira(total)}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping ({SHIPPING_OPTIONS[shippingOption].label})</span>
                    <span className="text-foreground">
                      {isInternational ? "To be calculated" : formatNaira(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground">{isInternational ? "Varies by location" : "~2 weeks 📦"}</span>
                  </div>
                  <div className="naija-section-divider" />
                  <div className="flex justify-between font-body font-bold text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">
                      {isInternational ? `${formatNaira(total)} + shipping` : formatNaira(orderTotal)}
                    </span>
                  </div>
                </div>
                <Button type="submit" className="w-full font-body font-semibold gap-2" size="lg" disabled={loading}>
                  <Lock className="w-4 h-4" />
                  {loading ? "Dey process..." : isInternational ? "Place Order (Pending Quote)" : "Place Order & Pay"}
                </Button>
                {isInternational && (
                  <p className="font-accent text-xs text-muted-foreground text-center mt-3">
                    We go contact you with shipping cost before processing payment 📩
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
