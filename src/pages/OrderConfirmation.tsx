import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderConfirmation = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { clearCart } = useCart();
  const [state, setState] = useState<"verifying" | "paid" | "unpaid">("verifying");

  useEffect(() => {
    if (!orderNumber) return;
    const url = new URL(window.location.href);
    const reference = url.searchParams.get("reference") || url.searchParams.get("trxref") || undefined;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { reference, order_number: orderNumber },
        });
        if (error) throw error;
        if (data?.success) {
          setState("paid");
          await clearCart();
        } else {
          setState("unpaid");
        }
      } catch {
        setState("unpaid");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 text-center py-20 max-w-lg">
          {state === "verifying" && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
              <h1 className="font-display text-2xl font-black text-foreground mb-2">Verifying your payment…</h1>
              <p className="font-body text-muted-foreground">Hold on small make we confirm with Paystack.</p>
            </>
          )}

          {state === "paid" && (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-black text-foreground mb-2">Payment Confirmed! 🎉</h1>
              <p className="font-body text-muted-foreground mb-2">E don land! Your product money don enter.</p>
              <p className="font-body text-sm text-muted-foreground mb-8">
                Order number: <span className="font-semibold text-foreground">{orderNumber}</span>
              </p>
              <div className="naija-card p-6 text-left mb-8">
                <h3 className="font-display text-base font-bold text-foreground mb-3">Wetin go happen next?</h3>
                <ul className="space-y-2 font-body text-sm text-muted-foreground">
                  <li>✅ Product + shipping payment don confirm</li>
                  <li>📦 We go prepare your order with care</li>
                  <li>📱 We go WhatsApp you at your preferred time to confirm delivery / park pickup details</li>
                  <li>🔐 Scan your QR code when e arrive to register ownership!</li>
                </ul>
              </div>
            </>
          )}

          {state === "unpaid" && (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="font-display text-2xl font-black text-foreground mb-2">Payment no confirm</h1>
              <p className="font-body text-muted-foreground mb-2">We never see your Paystack payment for order <span className="font-semibold text-foreground">{orderNumber}</span>.</p>
              <p className="font-body text-sm text-muted-foreground mb-8">If you don pay already, try refresh this page in a minute. Otherwise, go back to cart and try again.</p>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop"><Button variant="outline" className="font-body">Continue Shopping</Button></Link>
            <Link to="/orders"><Button className="font-body">View My Orders</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
