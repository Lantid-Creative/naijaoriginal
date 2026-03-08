import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QrScanner from "@/components/QrScanner";
import VerifyResult from "@/components/VerifyResult";

const Verify = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const verifyCode = useCallback(async (qrCode: string) => {
    if (!qrCode.trim()) return;
    setCode(qrCode.trim());
    setLoading(true);
    setNotFound(false);
    setResult(null);

    const { data } = await supabase
      .from("product_authentications")
      .select("*, products:product_id(name, slug, price, description, pidgin_tagline, is_limited_edition, edition_total, product_images(id, image_url, display_order))")
      .eq("qr_code", qrCode.trim())
      .maybeSingle();

    if (!data) {
      setNotFound(true);
    } else {
      await supabase
        .from("product_authentications")
        .update({ scan_count: (data.scan_count || 0) + 1, last_scanned_at: new Date().toISOString() })
        .eq("id", data.id);
      // Sort images by display order
      if (data.products?.product_images) {
        data.products.product_images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
      }
      setResult(data);
    }
    setLoading(false);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(code);
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
          {!result && (
            <>
              <div className="py-12 text-center">
                <span className="inline-block px-4 py-1.5 rounded-full border border-naija-gold/30 text-naija-gold font-accent text-xs tracking-widest uppercase mb-4">
                  QR Authentication
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
                  Verify Your <span className="naija-gradient-text">Product</span>
                </h1>
                <p className="font-body text-muted-foreground max-w-lg mx-auto">
                  Scan the QR code on your product or enter the code manually to verify authenticity and claim ownership.
                </p>
              </div>

              <QrScanner onScan={verifyCode} />

              <div className="max-w-md mx-auto mb-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">or enter code manually</span>
                <div className="flex-1 h-px bg-border" />
              </div>

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
            </>
          )}

          {notFound && (
            <div className="max-w-md mx-auto text-center naija-card p-8">
              <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Not Authenticated ⚠️</h3>
              <p className="font-body text-muted-foreground mb-4">
                This code no dey our system. If you believe say your product na original, please contact support.
              </p>
              <Button variant="outline" onClick={() => { setNotFound(false); setCode(""); }} className="font-body gap-2">
                <Search className="w-4 h-4" /> Try Another Code
              </Button>
            </div>
          )}

          {result && (
            <div>
              <VerifyResult result={result} user={user} onClaimOwnership={handleClaimOwnership} />
              <div className="text-center mt-6">
                <Button variant="outline" onClick={() => { setResult(null); setCode(""); }} className="font-body gap-2">
                  <Search className="w-4 h-4" /> Verify Another Product
                </Button>
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
