import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, MapPin, Package, Heart, LogOut, Save, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [address, setAddress] = useState({
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    zip: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        const addr = (data.shipping_address as any) || {};
        setAddress({
          address: addr.address || "",
          city: addr.city || "",
          state: addr.state || "",
          country: addr.country || "Nigeria",
          zip: addr.zip || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      shipping_address: address,
    }).eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated! ✅" });
    }
    setSaving(false);
  };

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "address", label: "Address", icon: MapPin },
  ];

  const quickLinks = [
    { label: "My Orders", to: "/orders", icon: Package, desc: "Track your orders" },
    { label: "Wishlist", to: "/wishlist", icon: Heart, desc: "Your saved items" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="py-8 md:py-12">
            <h1 className="font-accent text-3xl md:text-4xl font-black text-foreground mb-1">My Account</h1>
            <p className="font-body text-muted-foreground text-sm">{user.email}</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}

              <div className="pt-4 space-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-body text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => { signOut(); navigate("/"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4" />
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              ) : activeTab === "profile" ? (
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                  <h2 className="font-accent text-lg font-bold text-foreground mb-6">Personal Information</h2>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">Full Name</label>
                      <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">Email</label>
                      <Input value={profile.email} disabled className="bg-muted border-border" />
                    </div>
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">Phone</label>
                      <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+234..." className="bg-background border-border" />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving} className="font-body font-semibold gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                  <h2 className="font-accent text-lg font-bold text-foreground mb-6">Shipping Address</h2>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <label className="font-body text-sm text-foreground block mb-1.5">Street Address</label>
                      <Input value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">City</label>
                      <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">State</label>
                      <Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">Country</label>
                      <Input value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">Postal Code</label>
                      <Input value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} className="bg-background border-border" />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving} className="font-body font-semibold gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Address"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
