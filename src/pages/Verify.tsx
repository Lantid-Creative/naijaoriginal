import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { QrCode, ShieldCheck, ShieldAlert, Search, User, Hash, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Verify = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    const { data, error } = await supabase
      .from("product_authentications")
      .select("*, products:product_id(name, slug, price, is_limited_edition, edition_total, product_images(image_url))")
      .eq("qr_code", code.trim())
      .maybeSingle();

    if (!data) {
      setNotFound(true);
    } else {
      // Increment scan count
      await supabase
        .from("product_authentications")
        .update({ scan_count: (data.scan_count || 0) + 1, last_scanned_at: new Date().toISOString() })
        .eq("id", data.id);
      setResult(data);
    }
    setLoading(false);
  };

  const handleClaimOwnership = async () => {
    if (!user || !result) return;
    const { error } = await supabase
      .from("product_authentications")
      .update({ owner_id: user.id, owner_name: user.user_metadata?.full_name || user.email, is_verified: true })
      .eq("id", result.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ownership claimed! 🎉", description: "This product don register for your name!" });
      setResult({ ...result, owner_id: user.id, owner_name: user.user_metadata?.full_name || user.email, is_verified: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="py-12 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-naija-gold/30 text-naija-gold font-accent text-xs tracking-widest uppercase mb-4">
              QR Authentication
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
              Verify Your <span className="naija-gradient-text">Product</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-lg mx-auto">
              Enter the unique code from your product's QR tag to verify authenticity and claim ownership.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleVerify} className="max-w-md mx-auto mb-12">
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter QR code (e.g., NO-2026-001)"
                className="bg-card border-border font-body"
              />
              <Button type="submit" disabled={loading} className="font-body gap-2 px-6">
                <Search className="w-4 h-4" />
                {loading ? "..." : "Verify"}
              </Button>
            </div>
          </form>

          {/* Not Found */}
          {notFound && (
            <div className="max-w-md mx-auto text-center naija-card p-8">
              <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Not Authenticated ⚠️</h3>
              <p className="font-body text-muted-foreground">
                This code no dey our system. If you believe say your product na original, please contact support.
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="max-w-2xl mx-auto">
              <div className="naija-card overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-primary/5 border-b border-border flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-display text-lg font-bold text-primary">Authenticated ✅</h3>
                    <p className="font-body text-sm text-muted-foreground">This product na verified Naija Original</p>
                  </div>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  {result.products?.product_images?.[0] && (
                    <div className="rounded-xl overflow-hidden bg-muted">
                      <img
                        src={result.products.product_images[0].image_url}
                        alt={result.products.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-display text-2xl font-bold text-foreground">{result.products?.name}</h4>
                      {result.products?.is_limited_edition && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-secondary/10 text-secondary font-accent text-xs font-bold">
                          Limited Edition
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-body text-sm">
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Code:</span>
                        <span className="text-foreground font-semibold">{result.qr_code}</span>
                      </div>
                      {result.edition_number && (
                        <div className="flex items-center gap-2 font-body text-sm">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Edition:</span>
                          <span className="text-foreground font-semibold">
                            #{result.edition_number} {result.products?.edition_total ? `of ${result.products.edition_total}` : ""}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 font-body text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created:</span>
                        <span className="text-foreground">{new Date(result.created_at).toLocaleDateString()}</span>
                      </div>
                      {result.owner_name && (
                        <div className="flex items-center gap-2 font-body text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Owner:</span>
                          <span className="text-foreground font-semibold">{result.owner_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 font-body text-sm">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Scans:</span>
                        <span className="text-foreground">{result.scan_count + 1}</span>
                      </div>
                    </div>

                    {result.story && (
                      <div className="pt-3 border-t border-border">
                        <h5 className="font-body text-sm font-semibold text-foreground mb-1">The Story</h5>
                        <p className="font-body text-sm text-muted-foreground">{result.story}</p>
                      </div>
                    )}

                    {/* Claim Ownership */}
                    {!result.owner_id && user && (
                      <Button onClick={handleClaimOwnership} className="w-full font-body gap-2 mt-4">
                        <User className="w-4 h-4" /> Claim Ownership
                      </Button>
                    )}
                    {!result.owner_id && !user && (
                      <p className="font-body text-xs text-muted-foreground text-center mt-4">
                        <a href="/auth" className="text-primary hover:underline">Sign in</a> to claim ownership of this product
                      </p>
                    )}
                  </div>
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

export default Verify;
