import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Truck, MapPin } from "lucide-react";
import { formatNaira } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  NIGERIAN_STATES,
  SHIPPING_RATES,
  getShippingFee,
  type ShippingMethod,
} from "@/lib/shipping-rates";

const getOrderNumber = (orderId: string) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `NO-${date}-${orderId.slice(0, 6).toUpperCase()}`;
};

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, total, loading: cartLoading } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    state: "",
    city: "",
    country: "Nigeria",
    zip: "",
    shippingMethod: "doorstep" as ShippingMethod,
    preferredContactDay: "",
    preferredContactTime: "",
  });

  const isNigeria = form.country.toLowerCase().trim() === "nigeria";
  const cityOptions = isNigeria && form.state ? SHIPPING_RATES[form.state] || [] : [];

  const shipping = useMemo(() => {
    if (!isNigeria || !form.state || !form.city) return 0;
    return getShippingFee(form.state, form.city, form.shippingMethod);
  }, [isNigeria, form.state, form.city, form.shippingMethod]);

  const orderTotal = total + shipping;

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
          whatsapp: addr.whatsapp || prev.whatsapp,
          address: addr.address || prev.address,
          state: addr.state && (NIGERIAN_STATES.includes(addr.state) || prev.country !== "Nigeria") ? addr.state : prev.state,
          city: addr.city || prev.city,
          country: addr.country || prev.country,
          zip: addr.zip || prev.zip,
        }));
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Create account first",
        description: "You need account before checkout. Product + shipping money go pass Paystack.",
        variant: "destructive",
      });
      navigate("/auth?redirect=/checkout", { replace: true });
    }
  }, [authLoading, user, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Create account or sign in before checkout.", variant: "destructive" });
      navigate("/auth?redirect=/checkout");
      return;
    }

    if (isNigeria) {
      if (!form.state || !form.city) {
        toast({ title: "Pick state and city", description: "We need your delivery city to calculate shipping.", variant: "destructive" });
        return;
      }
      if (form.shippingMethod === "doorstep" && !form.address.trim()) {
        toast({ title: "Address needed", description: "For doorstep delivery, enter your full address.", variant: "destructive" });
        return;
      }
    }

    setLoading(true);

    try {
      const orderId = crypto.randomUUID();
      const orderNumber = getOrderNumber(orderId);
      const methodLabel = form.shippingMethod === "doorstep" ? "Doorstep delivery" : "Park pickup";
      const orderPayload = {
        id: orderId,
        order_number: orderNumber,
        user_id: user.id,
        subtotal: total,
        shipping_cost: shipping,
        total: orderTotal,
        shipping_address: {
          full_name: form.fullName,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          zip: form.zip,
          phone: form.phone,
          whatsapp: form.whatsapp,
          shipping_method: form.shippingMethod,
          preferred_contact_day: form.preferredContactDay,
          preferred_contact_time: form.preferredContactTime,
        },
        notes: isNigeria
          ? `${methodLabel} — ${form.city}, ${form.state}. Shipping fee ₦${shipping.toLocaleString()} included in payment. ${form.shippingMethod === "park" ? `Contact customer via WhatsApp (${form.whatsapp || form.phone}) on ${form.preferredContactDay || "preferred day"} at ${form.preferredContactTime || "preferred time"} with the nearest park address.` : `Deliver to: ${form.address}. Confirm via WhatsApp (${form.whatsapp || form.phone}) on ${form.preferredContactDay || "preferred day"} at ${form.preferredContactTime || "preferred time"}.`}`
          : `International order — ${form.country}. Shipping quote pending. Contact customer via WhatsApp (${form.whatsapp || form.phone}) on ${form.preferredContactDay || "preferred day"} at ${form.preferredContactTime || "preferred time"} to confirm location and final shipping quote.`,
      };

      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product?.name || "Product",
        quantity: item.quantity,
        price: item.product?.price || 0,
        selected_size: item.selected_size,
        selected_color: item.selected_color,
      }));

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke("initialize-payment", {
        body: {
          email: user.email || form.email,
          amount: Math.round(orderTotal * 100),
          order_id: orderId,
          order_number: orderNumber,
        },
      });

      if (paymentError || !paymentData?.authorization_url) {
        throw new Error(paymentData?.error || paymentError?.message || "Paystack no start. No order was placed.");
      }

      const { error: orderError } = await supabase.from("orders").insert({
        ...orderPayload,
        status: "pending",
        payment_status: "unpaid",
        payment_reference: paymentData.reference,
      });
      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      window.location.href = paymentData.authorization_url;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 py-20 flex items-center justify-center">
          <div className="animate-pulse font-body text-muted-foreground">Loading checkout…</div>
        </div>
        <Footer />
      </div>
    );
  }

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
              <div className="naija-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">Your Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-sm">Full Name *</Label>
                    <Input name="fullName" value={form.fullName} onChange={handleChange} required className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="font-body text-sm">Email *</Label>
                    <Input name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="font-body text-sm">Phone *</Label>
                    <Input name="phone" value={form.phone} onChange={handleChange} required placeholder="+234..." className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="font-body text-sm">WhatsApp Number *</Label>
                    <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="+234..." className="mt-1.5" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="font-body text-sm">Country *</Label>
                    <Input name="country" value={form.country} onChange={handleChange} required className="mt-1.5" />
                  </div>
                </div>
              </div>

              {isNigeria ? (
                <div className="naija-card p-6 space-y-5">
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground mb-1">Delivery in Nigeria 🇳🇬</h2>
                    <p className="font-body text-xs text-muted-foreground">Pick your state, city, and how you want to receive your order. Shipping fee na fixed per city.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-sm">State *</Label>
                      <Select
                        value={form.state}
                        onValueChange={(v) => setForm((p) => ({ ...p, state: v, city: "" }))}
                      >
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {NIGERIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-body text-sm">City *</Label>
                      <Select
                        value={form.city}
                        onValueChange={(v) => setForm((p) => ({ ...p, city: v }))}
                        disabled={!form.state}
                      >
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder={form.state ? "Select city" : "Pick state first"} /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {cityOptions.map((c) => (
                            <SelectItem key={c.city} value={c.city}>{c.city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {form.city && (
                    <div>
                      <Label className="font-body text-sm mb-2 block">Delivery method *</Label>
                      <RadioGroup
                        value={form.shippingMethod}
                        onValueChange={(v) => setForm((p) => ({ ...p, shippingMethod: v as ShippingMethod }))}
                        className="grid sm:grid-cols-2 gap-3"
                      >
                        <Label htmlFor="m-door" className="naija-card p-4 cursor-pointer flex items-start gap-3 hover:border-primary transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                          <RadioGroupItem value="doorstep" id="m-door" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-accent text-sm font-bold text-foreground"><Truck className="w-4 h-4" /> Doorstep</div>
                            <p className="font-body text-xs text-muted-foreground mt-1">We deliver to your address</p>
                            <p className="font-accent text-sm font-bold text-primary mt-2">{formatNaira(getShippingFee(form.state, form.city, "doorstep"))}</p>
                          </div>
                        </Label>
                        <Label htmlFor="m-park" className="naija-card p-4 cursor-pointer flex items-start gap-3 hover:border-primary transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                          <RadioGroupItem value="park" id="m-park" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-accent text-sm font-bold text-foreground"><MapPin className="w-4 h-4" /> Park pickup</div>
                            <p className="font-body text-xs text-muted-foreground mt-1">Collect from park near you (we WhatsApp you the address)</p>
                            <p className="font-accent text-sm font-bold text-primary mt-2">{formatNaira(getShippingFee(form.state, form.city, "park"))}</p>
                          </div>
                        </Label>
                      </RadioGroup>
                    </div>
                  )}

                  {form.shippingMethod === "doorstep" && (
                    <div>
                      <Label className="font-body text-sm">Full delivery address *</Label>
                      <Input name="address" value={form.address} onChange={handleChange} required={form.shippingMethod === "doorstep"} placeholder="House number, street, landmark..." className="mt-1.5" />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-sm">Preferred contact day</Label>
                      <Input name="preferredContactDay" value={form.preferredContactDay} onChange={handleChange} placeholder="e.g. Monday" className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">Preferred contact time</Label>
                      <Input name="preferredContactTime" value={form.preferredContactTime} onChange={handleChange} placeholder="e.g. 10am–2pm" className="mt-1.5" />
                    </div>
                  </div>

                  {form.shippingMethod === "park" && form.city && (
                    <p className="font-body text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
                      📞 After payment, we go reach you on WhatsApp at your preferred time with the exact park address in {form.city}.
                    </p>
                  )}
                </div>
              ) : (
                <div className="naija-card p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-foreground">International Shipping 🌍</h2>
                  <p className="font-body text-sm text-muted-foreground">For your country, shipping fee no dey inside this payment. You go pay for the product only. We go reach you on WhatsApp with a custom shipping quote based on location and weight.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label className="font-body text-sm">Address *</Label>
                      <Input name="address" value={form.address} onChange={handleChange} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">City *</Label>
                      <Input name="city" value={form.city} onChange={handleChange} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">State / Region *</Label>
                      <Input name="state" value={form.state} onChange={handleChange} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">Zip / Postal Code</Label>
                      <Input name="zip" value={form.zip} onChange={handleChange} className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">Preferred contact day</Label>
                      <Input name="preferredContactDay" value={form.preferredContactDay} onChange={handleChange} placeholder="e.g. Monday" className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">Preferred contact time</Label>
                      <Input name="preferredContactTime" value={form.preferredContactTime} onChange={handleChange} placeholder="e.g. 10am–2pm" className="mt-1.5" />
                    </div>
                  </div>
                </div>
              )}
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
                    <span className="text-muted-foreground">
                      Shipping {isNigeria && form.shippingMethod === "park" ? "(Park pickup)" : isNigeria ? "(Doorstep)" : ""}
                    </span>
                    <span className="text-foreground">
                      {isNigeria
                        ? (shipping > 0 ? formatNaira(shipping) : "Pick city")
                        : "Quote later"}
                    </span>
                  </div>
                  <div className="naija-section-divider" />
                  <div className="flex justify-between font-body font-bold text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatNaira(orderTotal)}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full font-body font-semibold gap-2" size="lg" disabled={loading}>
                  <Lock className="w-4 h-4" />
                  {loading ? "Dey process..." : "Pay with Paystack"}
                </Button>
                <p className="font-accent text-xs text-muted-foreground text-center mt-3">
                  {isNigeria
                    ? "Product + shipping fee na inside this payment."
                    : "Only product fee dey inside. Shipping quote go come via WhatsApp."}
                </p>
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
