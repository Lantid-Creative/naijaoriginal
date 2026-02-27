import { useParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderConfirmation = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 text-center py-20 max-w-lg">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-black text-foreground mb-2">Order Don Confirm! 🎉</h1>
          <p className="font-body text-muted-foreground mb-2">E don happen! Your Naija drip dey on the way.</p>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Order number: <span className="font-semibold text-foreground">{orderNumber}</span>
          </p>

          <div className="naija-card p-6 text-left mb-8">
            <h3 className="font-display text-base font-bold text-foreground mb-3">Wetin go happen next?</h3>
            <ul className="space-y-2 font-body text-sm text-muted-foreground">
              <li>✅ We go verify your payment</li>
              <li>📦 We go prepare your order with care</li>
              <li>🚚 Shipping confirmation go reach your email</li>
              <li>📱 Scan your QR code when e arrive to register ownership!</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop">
              <Button variant="outline" className="font-body">Continue Shopping</Button>
            </Link>
            <Link to="/orders">
              <Button className="font-body">View My Orders</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
