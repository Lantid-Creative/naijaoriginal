import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, Plus, Pencil, Trash2, X, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";

type Tab = "products" | "orders" | "analytics";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("products");
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

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, ordersRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("*, product_categories:category_id(name)").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(count)").order("created_at", { ascending: false }).limit(50),
      supabase.from("product_categories").select("*").order("name"),
    ]);
    setProducts(productsRes.data || []);
    setOrders(ordersRes.data || []);
    setCategories(categoriesRes.data || []);
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

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status, payment_status: status === "paid" ? "paid" : undefined }).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Order ${status}` });
    fetchData();
  };

  if (authLoading || !isAdmin) return null;

  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="py-8">
            <h1 className="font-display text-3xl font-black text-foreground mb-2">Admin Dashboard 🔐</h1>
            <p className="font-body text-muted-foreground">Manage your Naija Originals store</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Products", value: products.length, icon: Package, color: "text-primary" },
              { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-secondary" },
              { label: "Pending", value: pendingOrders, icon: Users, color: "text-destructive" },
              { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: BarChart3, color: "text-primary" },
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
          <div className="flex gap-2 mb-6">
            {(["products", "orders", "analytics"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg font-body text-sm capitalize transition-all ${
                  tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Products Tab */}
          {tab === "products" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Products</h2>
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="font-body gap-2">
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              </div>

              {/* Product Form Modal */}
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
                    <div><label className="font-body text-xs text-foreground block mb-1">Price *</label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="bg-background border-border" /></div>
                    <div><label className="font-body text-xs text-foreground block mb-1">Compare Price</label><Input type="number" step="0.01" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} className="bg-background border-border" /></div>
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
                          <td className="p-4 font-body text-sm text-foreground">${Number(p.price).toFixed(2)}</td>
                          <td className="p-4 font-body text-sm text-foreground">{p.stock}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-accent ${p.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {p.is_active ? "Active" : "Inactive"}
                            </span>
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
                          <td className="p-4 font-body text-sm text-foreground">${Number(o.total).toFixed(2)}</td>
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

          {/* Analytics Tab */}
          {tab === "analytics" && (
            <div className="text-center py-20">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Analytics Coming Soon</h3>
              <p className="font-body text-muted-foreground">Sales charts, customer insights, and more — dey on the way!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
