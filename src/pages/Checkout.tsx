import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import { formatNaira } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Checkout = () => {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const shipping = total > 50000 ? 0 : 3500;
  const orderTotal = total + shipping;

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
        total: orderTotal,
        shipping_address: {
          full_name: form.fullName,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          zip: form.zip,
          phone: form.phone,
        },
      };
      if (user) {
        orderPayload.user_id = user.id;
      } else {
        orderPayload.guest_email = form.email;
        orderPayload.guest_name = form.fullName;
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

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke("initialize-payment", {
        body: {
          email: user?.email || form.email,
          amount: Math.round(orderTotal * 100),
          order_id: order.id,
          order_number: order.order_number,
        },
      });

      if (paymentError || !paymentData?.authorization_url) {
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
                    <label className="font-body text-sm text-foreground block mb-1.5">Country</label>
                    <Input name="country" value={form.country} onChange={handleChange} className="bg-background border-border" />
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
                    <label className="font-body text-sm text-foreground block mb-1.5">State *</label>
                    <Input name="state" value={form.state} onChange={handleChange} required className="bg-background border-border" />
                  </div>
                </div>
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
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{shipping === 0 ? "Free 🎉" : formatNaira(shipping)}</span>
                  </div>
                  <div className="naija-section-divider" />
                  <div className="flex justify-between font-body font-bold text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatNaira(orderTotal)}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full font-body font-semibold gap-2" size="lg" disabled={loading}>
                  <Lock className="w-4 h-4" />
                  {loading ? "Dey process..." : "Place Order & Pay"}
                </Button>
                {total < 50000 && (
                  <p className="font-accent text-xs text-muted-foreground text-center mt-3">
                    Free shipping for orders above {formatNaira(50000)}! 🚚
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
