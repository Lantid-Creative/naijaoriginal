import { useMemo } from "react";
import { formatNaira } from "@/lib/format";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, ShoppingCart, DollarSign, Package, Users, Star } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
  "#f59e0b",
  "#06b6d4",
  "#8b5cf6",
];

interface AdminAnalyticsProps {
  orders: any[];
  products: any[];
  reviews: any[];
  subscribers: any[];
  categories: any[];
}

const AdminAnalytics = ({ orders, products, reviews, subscribers, categories }: AdminAnalyticsProps) => {
  const analytics = useMemo(() => {
    const paidOrders = orders.filter((o) => o.payment_status === "paid");
    const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Revenue by month
    const revenueByMonth: Record<string, { revenue: number; orders: number }> = {};
    for (const o of paidOrders) {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!revenueByMonth[key]) revenueByMonth[key] = { revenue: 0, orders: 0 };
      revenueByMonth[key].revenue += Number(o.total);
      revenueByMonth[key].orders += 1;
    }
    const revenueChartData = Object.entries(revenueByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-NG", { month: "short", year: "2-digit" }),
        revenue: Math.round(data.revenue),
        orders: data.orders,
      }));

    // Orders by status
    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }
    const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: count,
    }));

    // Top products by revenue
    const productSales: Record<string, { qty: number; revenue: number }> = {};
    for (const o of paidOrders) {
      const items = o.order_items;
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const name = item.product_name;
          if (!productSales[name]) productSales[name] = { qty: 0, revenue: 0 };
          productSales[name].qty += item.quantity;
          productSales[name].revenue += Number(item.price) * item.quantity;
        }
      }
    }
    const topProductsData = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 8)
      .map(([name, data]) => ({
        name: name.length > 20 ? name.slice(0, 18) + "…" : name,
        revenue: Math.round(data.revenue),
        qty: data.qty,
      }));

    // Category distribution
    const categoryMap: Record<string, string> = {};
    for (const c of categories) categoryMap[c.id] = c.name;
    const categoryCounts: Record<string, number> = {};
    for (const p of products) {
      const catName = p.category_id ? (categoryMap[p.category_id] || "Other") : "Uncategorized";
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    }
    const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    // Daily orders (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyOrders: Record<string, number> = {};
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      dailyOrders[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of orders) {
      const day = new Date(o.created_at).toISOString().slice(0, 10);
      if (dailyOrders[day] !== undefined) dailyOrders[day]++;
    }
    const dailyChartData = Object.entries(dailyOrders).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      orders: count,
    }));

    // Stats
    const activeProducts = products.filter((p) => p.is_active).length;
    const lowStock = products.filter((p) => p.is_active && p.stock <= 5).length;
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";
    const activeSubscribers = subscribers.filter((s) => s.is_active).length;

    return {
      totalRevenue, avgOrderValue, paidOrders: paidOrders.length,
      revenueChartData, statusChartData, topProductsData, categoryChartData, dailyChartData,
      activeProducts, lowStock, avgRating, activeSubscribers,
    };
  }, [orders, products, reviews, subscribers, categories]);

  const statCards = [
    { label: "Total Revenue", value: formatNaira(analytics.totalRevenue), icon: DollarSign, color: "text-primary" },
    { label: "Paid Orders", value: analytics.paidOrders, icon: ShoppingCart, color: "text-secondary" },
    { label: "Avg Order Value", value: formatNaira(Math.round(analytics.avgOrderValue)), icon: TrendingUp, color: "text-primary" },
    { label: "Active Products", value: analytics.activeProducts, icon: Package, color: "text-foreground" },
    { label: "Low Stock Items", value: analytics.lowStock, icon: Package, color: "text-destructive" },
    { label: "Avg Rating", value: analytics.avgRating, icon: Star, color: "text-secondary" },
    { label: "Subscribers", value: analytics.activeSubscribers, icon: Users, color: "text-primary" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-muted-foreground" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
        <p className="font-accent text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-body text-sm text-foreground">
            {p.name}: {p.name === "revenue" || p.dataKey === "revenue" ? formatNaira(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">Analytics 📊</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="naija-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="font-accent text-[10px] text-muted-foreground uppercase">{s.label}</span>
            </div>
            <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Over Time */}
      {analytics.revenueChartData.length > 0 && (
        <div className="naija-card p-6">
          <h3 className="font-display text-base font-bold text-foreground mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Orders (30 days) */}
        <div className="naija-card p-6">
          <h3 className="font-display text-base font-bold text-foreground mb-4">Orders (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="naija-card p-6">
          <h3 className="font-display text-base font-bold text-foreground mb-4">Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={analytics.statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                {analytics.statusChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        {analytics.topProductsData.length > 0 && (
          <div className="naija-card p-6">
            <h3 className="font-display text-base font-bold text-foreground mb-4">Top Products by Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Distribution */}
        {analytics.categoryChartData.length > 0 && (
          <div className="naija-card p-6">
            <h3 className="font-display text-base font-bold text-foreground mb-4">Products by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={analytics.categoryChartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {analytics.categoryChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
