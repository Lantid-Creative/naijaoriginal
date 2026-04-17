import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  Save,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Lock,
  ShoppingBag,
  Wallet,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatNaira } from "@/lib/format";

type SectionId = "dashboard" | "profile" | "address" | "security";

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wishlistIds } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "" });
  const [address, setAddress] = useState({
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    zip: "",
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [orderStats, setOrderStats] = useState({ count: 0, totalSpent: 0 });
  const [memberSince, setMemberSince] = useState<string>("");

  // Security state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [updatingPwd, setUpdatingPwd] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const fetchAll = async () => {
      const [profileRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("orders")
          .select("id, order_number, total, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) {
        setProfile({
          full_name: profileRes.data.full_name || "",
          email: profileRes.data.email || user.email || "",
          phone: profileRes.data.phone || "",
        });
        const addr = (profileRes.data.shipping_address as any) || {};
        setAddress({
          address: addr.address || "",
          city: addr.city || "",
          state: addr.state || "",
          country: addr.country || "Nigeria",
          zip: addr.zip || "",
        });
        setMemberSince(profileRes.data.created_at);
      }

      if (ordersRes.data) {
        setRecentOrders(ordersRes.data.slice(0, 5));
        setOrderStats({
          count: ordersRes.data.length,
          totalSpent: ordersRes.data
            .filter((o) => o.status !== "cancelled")
            .reduce((sum, o) => sum + Number(o.total || 0), 0),
        });
      }
      setLoading(false);
    };
    fetchAll();
  }, [user, navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        shipping_address: address,
      })
      .eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved! ✅", description: "Your details don update finish." });
    }
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords no match", description: "Try again.", variant: "destructive" });
      return;
    }
    setUpdatingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated 🔒", description: "Your account is secure." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setUpdatingPwd(false);
  };

  const initials = useMemo(() => {
    const name = profile.full_name || profile.email || user?.email || "";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "N";
  }, [profile.full_name, profile.email, user]);

  const memberSinceLabel = useMemo(() => {
    if (!memberSince) return "—";
    return new Date(memberSince).toLocaleDateString("en-NG", {
      month: "short",
      year: "numeric",
    });
  }, [memberSince]);

  const statusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-primary/15 text-primary";
      case "shipped": return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
      case "processing": return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
      case "cancelled": return "bg-destructive/15 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!user) return null;

  const navItems: { id: SectionId; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "address", label: "Address", icon: MapPin },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  const quickLinks = [
    { label: "My Orders", to: "/orders", icon: Package, desc: "Track all your orders" },
    { label: "Wishlist", to: "/wishlist", icon: Heart, desc: `${wishlist.length} saved item${wishlist.length === 1 ? "" : "s"}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="py-8 md:py-12"
          >
            <div className="flex items-center gap-4 md:gap-5">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-accent text-2xl md:text-3xl font-black shadow-lg ring-4 ring-primary/10">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="font-accent text-2xl md:text-4xl font-black text-foreground leading-tight truncate">
                  {profile.full_name ? `Welcome, ${profile.full_name.split(" ")[0]}` : "Welcome back"}
                </h1>
                <p className="font-body text-muted-foreground text-xs md:text-sm flex flex-wrap items-center gap-2">
                  <span className="truncate">{user.email}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline">Member since {memberSinceLabel}</span>
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-6 md:gap-8">
            {/* Sidebar */}
            <aside className="space-y-1">
              <p className="hidden lg:block font-accent text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
                Account
              </p>

              {/* Mobile: horizontal scroll tabs */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm transition-all ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground font-semibold shadow"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Desktop: vertical sidebar */}
              <div className="hidden lg:block space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-sm transition-all ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}

                <div className="pt-4 mt-4 border-t border-border space-y-1">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-body text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-border">
                  <button
                    onClick={() => { signOut(); navigate("/"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-sm text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0">
              {loading ? (
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-muted rounded-xl" />
                    <div className="h-24 bg-muted rounded-xl" />
                    <div className="h-24 bg-muted rounded-xl" />
                  </div>
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeSection === "dashboard" && (
                      <div className="space-y-6">
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <StatCard
                            icon={ShoppingBag}
                            label="Total Orders"
                            value={orderStats.count.toString()}
                            accent="from-primary/20 to-primary/5"
                          />
                          <StatCard
                            icon={Wallet}
                            label="Total Spent"
                            value={formatNaira(orderStats.totalSpent)}
                            accent="from-emerald-500/20 to-emerald-500/5"
                          />
                          <StatCard
                            icon={Heart}
                            label="Wishlist"
                            value={wishlist.length.toString()}
                            accent="from-rose-500/20 to-rose-500/5"
                          />
                        </div>

                        {/* Recent orders */}
                        <div className="bg-card rounded-2xl border border-border p-5 md:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="font-accent text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                              <Package className="w-4 h-4" /> Recent Orders
                            </h2>
                            <Link to="/orders" className="font-body text-xs text-primary hover:underline flex items-center gap-1">
                              View all <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>

                          {recentOrders.length === 0 ? (
                            <div className="text-center py-8">
                              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                              <p className="font-body text-sm text-muted-foreground mb-3">No orders yet. Time to shop! 🛍️</p>
                              <Button asChild size="sm">
                                <Link to="/shop">Start Shopping</Link>
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {recentOrders.map((order) => (
                                <Link
                                  key={order.id}
                                  to={`/orders`}
                                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-all group"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="font-body font-semibold text-sm text-foreground truncate">
                                      #{order.order_number}
                                    </p>
                                    <p className="font-body text-xs text-muted-foreground">
                                      {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ${statusColor(order.status)}`}>
                                      {order.status}
                                    </span>
                                    <span className="font-body font-semibold text-sm text-foreground hidden sm:inline">
                                      {formatNaira(order.total)}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick action cards (mobile only since sidebar already has them on desktop) */}
                        <div className="grid sm:grid-cols-2 gap-3 lg:hidden">
                          {quickLinks.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all"
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <link.icon className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-body font-semibold text-sm text-foreground">{link.label}</p>
                                <p className="font-body text-xs text-muted-foreground truncate">{link.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Pidgin nudge */}
                        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 md:p-6 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-accent font-bold text-foreground mb-1">Make sure say your address dey current!</p>
                            <p className="font-body text-sm text-muted-foreground">
                              Update am for the Address tab so we go fit deliver sharp sharp. 🇳🇬
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "profile" && (
                      <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                        <h2 className="font-accent text-lg font-bold text-foreground mb-1">Personal Information</h2>
                        <p className="font-body text-sm text-muted-foreground mb-6">How we go take address you.</p>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="font-body text-sm text-foreground block mb-1.5">Full Name</label>
                            <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="Your full name" className="bg-background border-border" />
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
                    )}

                    {activeSection === "address" && (
                      <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                        <h2 className="font-accent text-lg font-bold text-foreground mb-1">Shipping Address</h2>
                        <p className="font-body text-sm text-muted-foreground mb-6">Where we go ship your gbedu.</p>
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

                    {activeSection === "security" && (
                      <div className="space-y-4">
                        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                          <h2 className="font-accent text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Change Password
                          </h2>
                          <p className="font-body text-sm text-muted-foreground mb-6">Keep your account secure abeg.</p>

                          <div className="space-y-4 mb-6 max-w-md">
                            <div>
                              <label className="font-body text-sm text-foreground block mb-1.5">New Password</label>
                              <div className="relative">
                                <Input
                                  type={showPwd ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Minimum 6 characters"
                                  className="bg-background border-border pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPwd(!showPwd)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="font-body text-sm text-foreground block mb-1.5">Confirm New Password</label>
                              <Input
                                type={showPwd ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                className="bg-background border-border"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={handleUpdatePassword}
                            disabled={updatingPwd || !newPassword || !confirmPassword}
                            className="font-body font-semibold gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {updatingPwd ? "Updating..." : "Update Password"}
                          </Button>
                        </div>

                        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                          <h2 className="font-accent text-lg font-bold text-foreground mb-1">Account Info</h2>
                          <p className="font-body text-sm text-muted-foreground mb-6">Read-only details about your account.</p>
                          <dl className="space-y-3 font-body text-sm">
                            <div className="flex justify-between gap-4 py-2 border-b border-border">
                              <dt className="text-muted-foreground">Email</dt>
                              <dd className="text-foreground font-semibold truncate">{user.email}</dd>
                            </div>
                            <div className="flex justify-between gap-4 py-2 border-b border-border">
                              <dt className="text-muted-foreground">Member since</dt>
                              <dd className="text-foreground font-semibold">{memberSinceLabel}</dd>
                            </div>
                            <div className="flex justify-between gap-4 py-2">
                              <dt className="text-muted-foreground">User ID</dt>
                              <dd className="text-foreground font-mono text-xs truncate max-w-[200px]">{user.id}</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="lg:hidden">
                          <button
                            onClick={() => { signOut(); navigate("/"); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface StatCardProps {
  icon: any;
  label: string;
  value: string;
  accent: string;
}

const StatCard = ({ icon: Icon, label, value, accent }: StatCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${accent} p-4 md:p-5`}>
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
    <p className="font-accent text-xl md:text-2xl font-black text-foreground leading-tight truncate">{value}</p>
    <p className="font-body text-[11px] md:text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
  </div>
);

export default Account;
