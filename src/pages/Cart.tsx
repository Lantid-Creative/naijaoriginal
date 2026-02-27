import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Cart = () => {
  const { items, loading, updateQuantity, removeFromCart, itemCount, total } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="py-12">
            <h1 className="font-display text-3xl md:text-4xl font-black text-foreground mb-2">Your Cart 🛒</h1>
            <p className="font-body text-muted-foreground">
              {itemCount === 0 ? "Your cart dey empty o!" : `${itemCount} item${itemCount > 1 ? "s" : ""} dey your cart`}
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="naija-card p-6 animate-pulse flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Cart dey empty!</h3>
              <p className="font-body text-muted-foreground mb-6">Go shop make you add some Naija drip 🇳🇬</p>
              <Link to="/shop">
                <Button className="font-body font-semibold gap-2">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="naija-card p-4 flex gap-4">
                    <Link to={`/product/${item.product?.slug}`} className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product?.product_images?.[0]?.image_url || "/placeholder.svg"}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product?.slug}`} className="font-display text-base font-bold text-foreground hover:text-primary transition-colors">
                        {item.product?.name}
                      </Link>
                      <div className="flex gap-2 mt-1 font-accent text-xs text-muted-foreground">
                        {item.selected_size && <span>Size: {item.selected_size}</span>}
                        {item.selected_color && <span>• Color: {item.selected_color}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-body text-sm font-semibold w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-body font-bold text-foreground">{formatNaira((item.product?.price || 0) * item.quantity)}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="naija-card p-6 sticky top-24">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatNaira(total)}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">We go calculate am for checkout</span>
                    </div>
                    <div className="naija-section-divider" />
                    <div className="flex justify-between font-body font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatNaira(total)}</span>
                    </div>
                  </div>
                  <Link to="/checkout">
                    <Button className="w-full font-body font-semibold gap-2" size="lg">
                      Proceed to Checkout <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
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

export default Cart;
