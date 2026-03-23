import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { Package, ShoppingCart, Users, Plus, Pencil, Trash2, X, BarChart3, QrCode, Copy, MessageSquare, AlertCircle, Star, Check, Ban, Bell, Mail, Bot, TrendingUp, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AdminAIChat from "@/components/AdminAIChat";
import AdminAnalytics from "@/components/AdminAnalytics";
import CollectionAnalytics from "@/components/admin/CollectionAnalytics";
import CollectionBannerUpload from "@/components/admin/CollectionBannerUpload";
import DraggableProductList from "@/components/admin/DraggableProductList";
import BulkProductImport from "@/components/admin/BulkProductImport";
import SalesDashboard from "@/components/admin/SalesDashboard";
import BulkProductEditor from "@/components/admin/BulkProductEditor";
import InventoryAlerts from "@/components/admin/InventoryAlerts";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";

type Tab = "products" | "orders" | "qr" | "tickets" | "reviews" | "analytics" | "subscribers" | "ai" | "collections" | "sales" | "bulk-edit" | "inventory";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("ai");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", pidgin_tagline: "",
    price: "", compare_at_price: "", category_id: "", stock: "",
    sizes: "", colors: "", is_limited_edition: false, edition_total: "",
    is_featured: false, is_active: true,
  });

  // QR generation state
  const [qrProductId, setQrProductId] = useState("");
  const [qrEditionStart, setQrEditionStart] = useState("1");
  const [qrCount, setQrCount] = useState("1");
  const [qrStory, setQrStory] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [generatingQr, setGeneratingQr] = useState(false);

  // Support tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Reviews moderation state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<"pending" | "approved" | "all">("pending");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Collections state
  const [collections, setCollections] = useState<any[]>([]);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [collectionForm, setCollectionForm] = useState({
    name: "", slug: "", description: "", pidgin_tagline: "",
    type: "seasonal", icon: "", banner_image_url: "",
    is_active: true, display_order: "0",
  });
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, ordersRes, categoriesRes, ticketsRes, reviewsRes, notificationsRes, subscribersRes, collectionsRes] = await Promise.all([
      supabase.from("products").select("*, product_categories:category_id(name)").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(count)").order("created_at", { ascending: false }).limit(50),
      supabase.from("product_categories").select("*").order("name"),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("product_reviews").select("*, products:product_id(name, slug)").order("created_at", { ascending: false }),
      supabase.from("admin_notifications").select("*").eq("is_read", false).order("created_at", { ascending: false }).limit(20),
      supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }),
      supabase.from("product_collections").select("*").order("display_order", { ascending: true }),
    ]);
    setProducts(productsRes.data || []);
    setOrders(ordersRes.data || []);
    setCategories(categoriesRes.data || []);
    setTickets(ticketsRes.data || []);
    setReviews(reviewsRes.data || []);
    setNotifications(notificationsRes.data || []);
    setSubscribers(subscribersRes.data || []);
    setCollections(collectionsRes.data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      name: "", slug: "", description: "", pidgin_tagline: "",
      price: "", compare_at_price: "", category_id: "", stock: "",
      sizes: "", colors: "", is_limited_edition: false, edition_total: "",
      is_featured: false, is_active: true,
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name, slug: product.slug, description: product.description || "",
      pidgin_tagline: product.pidgin_tagline || "",
      price: String(product.price), compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
      category_id: product.category_id || "", stock: String(product.stock),
      sizes: (product.sizes || []).join(", "), colors: (product.colors || []).join(", "),
      is_limited_edition: product.is_limited_edition, edition_total: product.edition_total ? String(product.edition_total) : "",
      is_featured: product.is_featured, is_active: product.is_active,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: form.description,
      pidgin_tagline: form.pidgin_tagline || null,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      category_id: form.category_id || null,
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()) : [],
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()) : [],
      is_limited_edition: form.is_limited_edition,
      edition_total: form.edition_total ? parseInt(form.edition_total) : null,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Product updated! ✅" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Product created! 🎉" });
    }
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("You sure say you wan delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Product deleted" });
    fetchData();
  };

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !currentActive }).eq("id", productId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: !currentActive ? "Product activated ✅" : "Product deactivated" });
    fetchData();
  };


    const { error } = await supabase.from("orders").update({ status, payment_status: status === "paid" ? "paid" : undefined }).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Order ${status}` });
    fetchData();
  };

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrProductId) return;
    setGeneratingQr(true);
    const count = parseInt(qrCount) || 1;
    const startNum = parseInt(qrEditionStart) || 1;
    const codes: string[] = [];
    const records: any[] = [];

    for (let i = 0; i < count; i++) {
      const editionNum = startNum + i;
      const code = `NO-${Date.now().toString(36).toUpperCase()}-${editionNum.toString().padStart(3, "0")}`;
      codes.push(code);
      records.push({
        product_id: qrProductId,
        qr_code: code,
        edition_number: editionNum,
        story: qrStory || null,
      });
    }

    const { error } = await supabase.from("product_authentications").insert(records);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setGeneratedCodes(codes);
      toast({ title: `${count} QR code${count > 1 ? "s" : ""} generated! 🎉` });
    }
    setGeneratingQr(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied! 📋", description: code });
  };

  const handleUpdateTicket = async (ticketId: string, status: string) => {
    setUpdatingTicket(true);
    const { error } = await supabase.from("support_tickets").update({
      status,
      admin_notes: adminNotes || null,
    }).eq("id", ticketId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Ticket ${status}! ✅` });
      setSelectedTicket(null);
      setAdminNotes("");
      fetchData();
    }
    setUpdatingTicket(false);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Delete this ticket?")) return;
    const { error } = await supabase.from("support_tickets").delete().eq("id", ticketId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket deleted" });
      if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      fetchData();
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    const { error } = await supabase.from("product_reviews").update({ is_approved: true }).eq("id", reviewId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    // Mark related notification as read
    await supabase.from("admin_notifications").update({ is_read: true } as any).eq("metadata->>review_id", reviewId);
    toast({ title: "Review approved! ✅" });
    fetchData();
  };

  const handleRejectReview = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await supabase.from("admin_notifications").update({ is_read: true } as any).eq("metadata->>review_id", reviewId);
    toast({ title: "Review deleted" });
    fetchData();
  };

  // Collection handlers
  const resetCollectionForm = () => {
    setCollectionForm({
      name: "", slug: "", description: "", pidgin_tagline: "",
      type: "seasonal", icon: "", banner_image_url: "",
      is_active: true, display_order: "0",
    });
    setEditingCollection(null);
    setShowCollectionForm(false);
  };

  const handleEditCollection = (collection: any) => {
    setCollectionForm({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      pidgin_tagline: collection.pidgin_tagline || "",
      type: collection.type,
      icon: collection.icon || "",
      banner_image_url: collection.banner_image_url || "",
      is_active: collection.is_active,
      display_order: String(collection.display_order || 0),
    });
    setEditingCollection(collection);
    setShowCollectionForm(true);
  };

  const handleBannerUploadComplete = (url: string) => {
    setCollectionForm({ ...collectionForm, banner_image_url: url });
  };

  const handleSubmitCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: collectionForm.name,
      slug: collectionForm.slug || collectionForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: collectionForm.description || null,
      pidgin_tagline: collectionForm.pidgin_tagline || null,
      type: collectionForm.type,
      icon: collectionForm.icon || null,
      banner_image_url: collectionForm.banner_image_url || null,
      is_active: collectionForm.is_active,
      display_order: parseInt(collectionForm.display_order) || 0,
    };

    if (editingCollection) {
      const { error } = await supabase.from("product_collections").update(payload).eq("id", editingCollection.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Collection updated! ✅" });
    } else {
      const { error } = await supabase.from("product_collections").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Collection created! 🎉" });
    }
    resetCollectionForm();
    fetchData();
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Delete this collection? Products won't be deleted.")) return;
    const { error } = await supabase.from("product_collections").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Collection deleted" });
    fetchData();
  };

  const fetchCollectionProducts = async (collectionId: string) => {
    const { data } = await supabase
      .from("product_collection_items")
      .select("*, products(*)")
      .eq("collection_id", collectionId)
      .order("display_order");
    setCollectionProducts(data || []);
    
    // Get products not in this collection
    const productIds = (data || []).map((item: any) => item.product_id);
    const available = products.filter((p) => !productIds.includes(p.id));
    setAvailableProducts(available);
  };

  const handleAddProductToCollection = async (productId: string) => {
    if (!selectedCollection) return;
    const { error } = await supabase.from("product_collection_items").insert({
      collection_id: selectedCollection.id,
      product_id: productId,
      display_order: collectionProducts.length,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Product added to collection! ✅" });
    fetchCollectionProducts(selectedCollection.id);
  };

  const handleRemoveProductFromCollection = async (itemId: string) => {
    if (!selectedCollection) return;
    const { error } = await supabase.from("product_collection_items").delete().eq("id", itemId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Product removed from collection" });
    fetchCollectionProducts(selectedCollection.id);
  };

  const pendingReviews = reviews.filter((r: any) => !r.is_approved);

  const openTickets = tickets.filter(t => t.status === "open").length;

  if (authLoading || !isAdmin) return null;

  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="py-8 flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-black text-foreground mb-2">Admin Dashboard 🔐</h1>
              <p className="font-body text-muted-foreground">Manage your Naija Original store</p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => setTab("reviews")}
                className="relative p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
                title={`${notifications.length} unread notification${notifications.length !== 1 ? 's' : ''}`}
              >
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-accent font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Products", value: products.length, icon: Package, color: "text-primary" },
              { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-secondary" },
              { label: "Pending", value: pendingOrders, icon: Users, color: "text-destructive" },
              { label: "Revenue", value: formatNaira(totalRevenue), icon: BarChart3, color: "text-primary" },
            ].map((stat) => (
              <div key={stat.label} className="naija-card p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <p className="font-accent text-xs text-muted-foreground uppercase">{stat.label}</p>
                    <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {(["ai", "sales", "products", "bulk-edit", "inventory", "collections", "orders", "reviews", "tickets", "subscribers", "qr", "analytics"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg font-body text-sm capitalize transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                } ${t === "ai" ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold" : ""}`}
              >
                {t === "ai" && <Bot className="w-3.5 h-3.5" />}
                {t === "ai" ? "AI Assistant" : t === "sales" ? "Sales Dashboard" : t === "bulk-edit" ? "Bulk Edit" : t === "inventory" ? `Inventory${products.filter(p => p.is_active && p.stock <= 5).length > 0 ? ` (${products.filter(p => p.is_active && p.stock <= 5).length})` : ""}` : t === "qr" ? "QR Codes" : t === "tickets" ? `Tickets${openTickets > 0 ? ` (${openTickets})` : ""}` : t === "reviews" ? `Reviews${pendingReviews.length > 0 ? ` (${pendingReviews.length})` : ""}` : t === "subscribers" ? `Subscribers (${subscribers.length})` : t}
              </button>
            ))}
          </div>

          {/* AI Assistant Tab */}
          {tab === "ai" && <AdminAIChat />}

          {/* Products Tab */}
          {tab === "products" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Products</h2>
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="font-body gap-2">
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              </div>

              {showForm && (
                <div className="naija-card p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {editingProduct ? "Edit Product" : "New Product"}
                    </h3>
                    <button onClick={resetForm}><X className="w-5 h-5 text-muted-foreground" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div><label className="font-body text-xs text-foreground block mb-1">Name *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Slug</label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="bg-background border-border" /></div>
                    <div className="md:col-span-2"><label className="font-body text-xs text-foreground block mb-1">Description</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Pidgin Tagline</label><Input value={form.pidgin_tagline} onChange={(e) => setForm({ ...form, pidgin_tagline: e.target.value })} className="bg-background border-border" /></div>
                    <div>
                      <label className="font-body text-xs text-foreground block mb-1">Category</label>
                      <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 font-body text-sm text-foreground">
                        <option value="">Select category</option>
                        {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Price (₦) *</label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Compare Price (₦)</label><Input type="number" step="0.01" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Stock *</label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Sizes (comma separated)</label><Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Colors (comma separated)</label><Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, White" className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Edition Total</label><Input type="number" value={form.edition_total} onChange={(e) => setForm({ ...form, edition_total: e.target.value })} className="bg-background border-border" /></div>
                    <div className="flex flex-wrap gap-4 items-center">
                      <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured
                      </label>
                      <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={form.is_limited_edition} onChange={(e) => setForm({ ...form, is_limited_edition: e.target.checked })} /> Limited Edition
                      </label>
                      <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="font-body">{editingProduct ? "Update Product" : "Create Product"}</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products Table */}
              <div className="naija-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Product</th>
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Category</th>
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Price</th>
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Stock</th>
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Status</th>
                        <th className="text-right p-4 font-body text-xs text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="font-body text-sm font-semibold text-foreground">{p.name}</div>
                            {p.is_limited_edition && <span className="font-accent text-[10px] text-secondary">LIMITED</span>}
                          </td>
                          <td className="p-4 font-body text-sm text-muted-foreground">{p.product_categories?.name || "—"}</td>
                          <td className="p-4 font-body text-sm text-foreground">{formatNaira(Number(p.price))}</td>
                          <td className="p-4 font-body text-sm text-foreground">{p.stock}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={p.is_active}
                                onCheckedChange={() => handleToggleActive(p.id, p.is_active)}
                              />
                              <span className={`text-xs font-accent ${p.is_active ? "text-primary" : "text-muted-foreground"}`}>
                                {p.is_active ? "Active" : "Off"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {tab === "orders" && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Orders</h2>
              <div className="naija-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Order</th>
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Date</th>
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Total</th>
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Status</th>
                        <th className="text-left p-4 font-body text-xs text-muted-foreground uppercase">Payment</th>
                        <th className="text-right p-4 font-body text-xs text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-body text-sm font-semibold text-foreground">{o.order_number}</td>
                          <td className="p-4 font-body text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-body text-sm text-foreground">{formatNaira(Number(o.total))}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-xs font-accent capitalize bg-muted text-foreground">{o.status}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-accent ${o.payment_status === "paid" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="text-xs rounded border border-border bg-background px-2 py-1 font-body text-foreground"
                            >
                              {["pending", "paid", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* QR Codes Tab */}
          {tab === "qr" && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Generate QR Authentication Codes 🔐</h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Generate unique codes for products. Customers go fit scan or enter the code for the Verify page to confirm authenticity.
              </p>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="naija-card p-6">
                  <h3 className="font-accent text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-primary" /> Generate Codes
                  </h3>
                  <form onSubmit={handleGenerateQR} className="space-y-4">
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">Product *</label>
                      <select
                        value={qrProductId}
                        onChange={(e) => setQrProductId(e.target.value)}
                        required
                        className="w-full h-10 rounded-md border border-border bg-background px-3 font-body text-sm text-foreground"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-body text-sm text-foreground block mb-1.5">Start Edition #</label>
                        <Input type="number" min="1" value={qrEditionStart} onChange={(e) => setQrEditionStart(e.target.value)} className="bg-background border-border" />
                      </div>
                      <div>
                        <label className="font-body text-sm text-foreground block mb-1.5">How Many</label>
                        <Input type="number" min="1" max="100" value={qrCount} onChange={(e) => setQrCount(e.target.value)} className="bg-background border-border" />
                      </div>
                    </div>
                    <div>
                      <label className="font-body text-sm text-foreground block mb-1.5">Story (optional)</label>
                      <Input value={qrStory} onChange={(e) => setQrStory(e.target.value)} placeholder="The story behind this product..." className="bg-background border-border" />
                    </div>
                    <Button type="submit" disabled={generatingQr} className="font-body gap-2 w-full">
                      <QrCode className="w-4 h-4" />
                      {generatingQr ? "Generating..." : "Generate Codes"}
                    </Button>
                  </form>
                </div>

                {/* Generated codes */}
                <div className="naija-card p-6">
                  <h3 className="font-accent text-base font-bold text-foreground mb-4">Generated Codes</h3>
                  {generatedCodes.length === 0 ? (
                    <div className="text-center py-12">
                      <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-body text-sm text-muted-foreground">No codes generated yet. Use the form to create some.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {generatedCodes.map((code, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                          <div>
                            <p className="font-mono text-sm font-bold text-foreground">{code}</p>
                            <p className="font-body text-xs text-muted-foreground">Edition #{parseInt(qrEditionStart) + i}</p>
                          </div>
                          <button
                            onClick={() => copyCode(code)}
                            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <p className="font-body text-xs text-muted-foreground text-center mt-4">
                        Print these codes and attach to your products. Customers go fit verify dem at /verify 🔐
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Support Tickets Tab */}
          {tab === "tickets" && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Support Tickets 🎫</h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Escalated issues from Oga Wahala. Respond and resolve customer wahala here.
              </p>

              {tickets.length === 0 ? (
                <div className="naija-card p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-body text-muted-foreground">No tickets yet. When Oga Wahala escalates, e go show here.</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Tickets list */}
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => { setSelectedTicket(ticket); setAdminNotes(ticket.admin_notes || ""); }}
                        className={`naija-card p-4 cursor-pointer transition-all hover:border-primary/50 ${selectedTicket?.id === ticket.id ? "ring-2 ring-primary" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {ticket.status === "open" && <AlertCircle className="w-4 h-4 text-destructive" />}
                            <span className={`px-2 py-0.5 rounded text-xs font-accent capitalize ${
                              ticket.status === "open" ? "bg-destructive/10 text-destructive" :
                              ticket.status === "resolved" ? "bg-primary/10 text-primary" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <span className="font-body text-xs text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-body text-sm text-foreground line-clamp-2">{ticket.user_message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Ticket detail */}
                  <div>
                    {selectedTicket ? (
                      <div className="naija-card p-6 sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-accent text-base font-bold text-foreground">Ticket Detail</h3>
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteTicket(selectedTicket.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setSelectedTicket(null)} className="text-muted-foreground hover:text-foreground">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="font-accent text-xs text-muted-foreground uppercase mb-1">Customer Message</p>
                            <p className="font-body text-sm text-foreground bg-muted/50 p-3 rounded-lg">{selectedTicket.user_message}</p>
                          </div>

                          <div>
                            <p className="font-accent text-xs text-muted-foreground uppercase mb-1">Conversation Summary</p>
                            <p className="font-body text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{selectedTicket.conversation_summary}</p>
                          </div>

                          <div>
                            <p className="font-accent text-xs text-muted-foreground uppercase mb-1">Status</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-accent capitalize ${
                              selectedTicket.status === "open" ? "bg-destructive/10 text-destructive" :
                              selectedTicket.status === "resolved" ? "bg-primary/10 text-primary" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {selectedTicket.status}
                            </span>
                          </div>

                          <div>
                            <label className="font-accent text-xs text-muted-foreground uppercase block mb-1">Admin Notes</label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add your response or notes here..."
                              className="bg-background border-border font-body text-sm"
                              rows={4}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateTicket(selectedTicket.id, "resolved")}
                              disabled={updatingTicket}
                              className="font-body flex-1"
                            >
                              ✅ Resolve
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleUpdateTicket(selectedTicket.id, "in_progress")}
                              disabled={updatingTicket}
                              className="font-body flex-1"
                            >
                              🔄 In Progress
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="naija-card p-12 text-center">
                        <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-body text-sm text-muted-foreground">Click a ticket to view details and respond</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Moderation Tab */}
          {tab === "reviews" && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Review Moderation ⭐</h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Approve or reject customer reviews before dem show on product pages.
              </p>

              <div className="flex gap-2 mb-6">
                {(["pending", "approved", "all"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setReviewFilter(f)}
                    className={`px-3 py-1.5 rounded-lg font-body text-xs capitalize transition-all ${
                      reviewFilter === f ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f} {f === "pending" && pendingReviews.length > 0 ? `(${pendingReviews.length})` : ""}
                  </button>
                ))}
              </div>

              {(() => {
                const filtered = reviewFilter === "pending"
                  ? reviews.filter((r: any) => !r.is_approved)
                  : reviewFilter === "approved"
                  ? reviews.filter((r: any) => r.is_approved)
                  : reviews;

                if (filtered.length === 0) return (
                  <div className="naija-card p-12 text-center">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-body text-muted-foreground">No {reviewFilter} reviews.</p>
                  </div>
                );

                return (
                  <div className="space-y-3">
                    {filtered.map((review: any) => (
                      <div key={review.id} className="naija-card p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-naija-gold fill-naija-gold" : "text-muted-foreground/30"}`} />
                                ))}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-accent ${
                                review.is_approved ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                              }`}>
                                {review.is_approved ? "Approved" : "Pending"}
                              </span>
                              <span className="font-body text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-accent text-xs text-primary mb-1 truncate">
                              {review.products?.name || "Unknown product"}
                            </p>
                            <p className="font-body text-sm text-foreground">{review.comment}</p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            {!review.is_approved && (
                              <button
                                onClick={() => handleApproveReview(review.id)}
                                className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRejectReview(review.id)}
                              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Collections Tab */}
          {tab === "collections" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Collections</h2>
                <Button onClick={() => { resetCollectionForm(); setShowCollectionForm(true); }} className="font-body gap-2">
                  <Plus className="w-4 h-4" /> Add Collection
                </Button>
              </div>

              {showCollectionForm && (
                <div className="naija-card p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {editingCollection ? "Edit Collection" : "New Collection"}
                    </h3>
                    <button onClick={resetCollectionForm}><X className="w-5 h-5 text-muted-foreground" /></button>
                  </div>
                  <form onSubmit={handleSubmitCollection} className="grid md:grid-cols-2 gap-4">
                    <div><label className="font-body text-xs text-foreground block mb-1">Name *</label><Input value={collectionForm.name} onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })} required className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Slug</label><Input value={collectionForm.slug} onChange={(e) => setCollectionForm({ ...collectionForm, slug: e.target.value })} placeholder="auto-generated" className="bg-background border-border" /></div>
                    <div className="md:col-span-2"><label className="font-body text-xs text-foreground block mb-1">Description</label><Textarea value={collectionForm.description} onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })} className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Pidgin Tagline</label><Input value={collectionForm.pidgin_tagline} onChange={(e) => setCollectionForm({ ...collectionForm, pidgin_tagline: e.target.value })} placeholder="E dey sweet!" className="bg-background border-border" /></div>
                    <div>
                      <label className="font-body text-xs text-foreground block mb-1">Type *</label>
                      <select value={collectionForm.type} onChange={(e) => setCollectionForm({ ...collectionForm, type: e.target.value })} required className="w-full h-10 rounded-md border border-border bg-background px-3 font-body text-sm text-foreground">
                        <option value="seasonal">Seasonal</option>
                        <option value="gift">Gift</option>
                      </select>
                    </div>
                     <div><label className="font-body text-xs text-foreground block mb-1">Icon (emoji)</label><Input value={collectionForm.icon} onChange={(e) => setCollectionForm({ ...collectionForm, icon: e.target.value })} placeholder="☀️" className="bg-background border-border" /></div>
                     <div><label className="font-body text-xs text-foreground block mb-1">Display Order</label><Input type="number" value={collectionForm.display_order} onChange={(e) => setCollectionForm({ ...collectionForm, display_order: e.target.value })} className="bg-background border-border" /></div>
                     <div className="md:col-span-2">
                       {editingCollection && (
                         <CollectionBannerUpload
                           collectionId={editingCollection.id}
                           currentBannerUrl={collectionForm.banner_image_url}
                           onUploadComplete={handleBannerUploadComplete}
                         />
                       )}
                     </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={collectionForm.is_active} onChange={(e) => setCollectionForm({ ...collectionForm, is_active: e.target.checked })} /> Active
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="font-body">{editingCollection ? "Update Collection" : "Create Collection"}</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Collections Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {collections.map((c) => (
                  <div key={c.id} className="naija-card p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {c.icon && <span className="text-2xl">{c.icon}</span>}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-base font-bold text-foreground mb-0.5">{c.name}</h3>
                          <p className="font-accent text-xs text-primary mb-1">{c.type}</p>
                          {c.pidgin_tagline && <p className="font-body text-xs text-muted-foreground italic">"{c.pidgin_tagline}"</p>}
                        </div>
                      </div>
                       <div className="flex gap-1.5 flex-shrink-0">
                         <button
                           onClick={() => { setSelectedCollection(c); setShowAnalytics(true); }}
                           className="p-1.5 rounded hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                           title="View analytics"
                         >
                           <TrendingUp className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => { setSelectedCollection(c); fetchCollectionProducts(c.id); setShowAnalytics(false); }}
                           className="p-1.5 rounded hover:bg-secondary/10 transition-colors text-muted-foreground hover:text-secondary"
                           title="Manage products"
                         >
                           <Package className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleEditCollection(c)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                           <Pencil className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDeleteCollection(c.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-accent ${c.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">Order: {c.display_order}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Product Assignment Modal */}
              {selectedCollection && !showAnalytics && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="naija-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Manage Products: {selectedCollection.name}
                      </h3>
                      <button onClick={() => { setSelectedCollection(null); setShowBulkImport(false); }}>
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Products in collection */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-accent text-sm font-bold text-foreground">
                            In Collection ({collectionProducts.length})
                          </h4>
                          {collectionProducts.length > 0 && (
                            <button
                              onClick={() => setShowBulkImport(!showBulkImport)}
                              className="text-xs font-body text-primary hover:underline"
                            >
                              {showBulkImport ? "Cancel" : "+ Bulk Import"}
                            </button>
                          )}
                        </div>
                        
                        {showBulkImport ? (
                          <BulkProductImport
                            collectionId={selectedCollection.id}
                            availableProducts={availableProducts}
                            onProductsAdded={() => {
                              fetchCollectionProducts(selectedCollection.id);
                              setShowBulkImport(false);
                            }}
                          />
                        ) : (
                          <DraggableProductList
                            collectionId={selectedCollection.id}
                            products={collectionProducts}
                            onProductsReordered={() => fetchCollectionProducts(selectedCollection.id)}
                            onRemoveProduct={handleRemoveProductFromCollection}
                          />
                        )}
                      </div>

                      {/* Available products */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-accent text-sm font-bold text-foreground">
                            Available Products ({availableProducts.length})
                          </h4>
                          {availableProducts.length > 0 && !showBulkImport && (
                            <button
                              onClick={() => setShowBulkImport(true)}
                              className="text-xs font-body text-primary hover:underline"
                            >
                              + Bulk Import
                            </button>
                          )}
                        </div>
                        
                        {availableProducts.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                            <p className="font-body text-sm text-muted-foreground">All products added!</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {availableProducts.slice(0, 20).map((product: any) => (
                              <button
                                key={product.id}
                                onClick={() => handleAddProductToCollection(product.id)}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary hover:bg-muted transition-all text-left"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-body text-sm font-semibold text-foreground truncate">{product.name}</p>
                                  <p className="font-body text-xs text-muted-foreground">{formatNaira(Number(product.price))}</p>
                                </div>
                                <Plus className="w-4 h-4 text-muted-foreground" />
                              </button>
                            ))}
                            {availableProducts.length > 20 && (
                              <p className="text-center text-xs text-muted-foreground py-2">
                                And {availableProducts.length - 20} more... Use bulk import to add multiple products
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Modal */}
              {selectedCollection && showAnalytics && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="naija-card p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <div></div>
                      <button onClick={() => { setSelectedCollection(null); setShowAnalytics(false); }}>
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <CollectionAnalytics
                      collectionId={selectedCollection.id}
                      collectionName={selectedCollection.name}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {tab === "analytics" && (
            <AdminAnalytics
              orders={orders}
              products={products}
              reviews={reviews}
              subscribers={subscribers}
              categories={categories}
            />
          )}

          {/* Sales Dashboard Tab */}
          {tab === "sales" && (
            <SalesDashboard orders={orders} products={products} />
          )}

          {/* Bulk Editor Tab */}
          {tab === "bulk-edit" && (
            <BulkProductEditor products={products} onUpdate={fetchData} />
          )}

          {/* Inventory Alerts Tab */}
          {tab === "inventory" && (
            <InventoryAlerts products={products} />
          )}

          {/* Subscribers Tab */}
          {tab === "subscribers" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Newsletter Subscribers
                </h2>
                <span className="font-accent text-sm text-muted-foreground">
                  {subscribers.filter((s: any) => s.is_active).length} active / {subscribers.length} total
                </span>
              </div>
              {subscribers.length === 0 ? (
                <div className="text-center py-16">
                  <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-body text-muted-foreground">No subscribers yet.</p>
                </div>
              ) : (
                <div className="naija-card overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="font-accent text-xs text-muted-foreground uppercase px-4 py-3">Email</th>
                        <th className="font-accent text-xs text-muted-foreground uppercase px-4 py-3 hidden md:table-cell">Name</th>
                        <th className="font-accent text-xs text-muted-foreground uppercase px-4 py-3 hidden md:table-cell">Date</th>
                        <th className="font-accent text-xs text-muted-foreground uppercase px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subscribers.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-body text-sm text-foreground">{sub.email}</td>
                          <td className="px-4 py-3 font-body text-sm text-muted-foreground hidden md:table-cell">{sub.full_name || "—"}</td>
                          <td className="px-4 py-3 font-body text-xs text-muted-foreground hidden md:table-cell">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full font-accent text-[10px] font-bold ${sub.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {sub.is_active ? "Active" : "Unsubscribed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
