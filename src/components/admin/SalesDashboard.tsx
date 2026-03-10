import { useState, useMemo } from "react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { formatNaira } from "@/lib/format";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))",
  "hsl(var(--destructive))", "#f59e0b", "#06b6d4", "#8b5cf6",
];

const PRESETS = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "All Time", days: 0 },
];

interface SalesDashboardProps {
  orders: any[];
  products: any[];
}

const SalesDashboard = ({ orders, products }: SalesDashboardProps) => {
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [activePreset, setActivePreset] = useState(30);

  const handlePreset = (days: number) => {
    setActivePreset(days);
    if (days === 0) {
      setDateFrom(new Date("2020-01-01"));
    } else {
      setDateFrom(subDays(new Date(), days));
    }
    setDateTo(new Date());
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = parseISO(o.created_at);
      return isWithinInterval(d, { start: startOfDay(dateFrom), end: endOfDay(dateTo) });
    });
  }, [orders, dateFrom, dateTo]);

  const analytics = useMemo(() => {
    const paid = filteredOrders.filter((o) => o.payment_status === "paid");
    const totalRevenue = paid.reduce((s, o) => s + Number(o.total), 0);
    const avgOrderValue = paid.length > 0 ? totalRevenue / paid.length : 0;
    const totalShipping = paid.reduce((s, o) => s + Number(o.shipping_cost || 0), 0);

    // Daily revenue
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    for (const o of paid) {
      const day = o.created_at.slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { revenue: 0, orders: 0 };
      dailyMap[day].revenue += Number(o.total);
      dailyMap[day].orders += 1;
    }
    const dailyData = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date: format(parseISO(date), "dd MMM"),
        revenue: Math.round(d.revenue),
        orders: d.orders,
      }));

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const o of filteredOrders) {
      const s = o.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Top products
    const productSales: Record<string, { qty: number; revenue: number }> = {};
    for (const o of paid) {
      if (o.order_items && Array.isArray(o.order_items)) {
        for (const item of o.order_items) {
          const n = item.product_name;
          if (!productSales[n]) productSales[n] = { qty: 0, revenue: 0 };
          productSales[n].qty += item.quantity;
          productSales[n].revenue += Number(item.price) * item.quantity;
        }
      }
    }
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([name, d]) => ({
        name: name.length > 22 ? name.slice(0, 20) + "…" : name,
        fullName: name,
        revenue: Math.round(d.revenue),
        qty: d.qty,
      }));

    // Payment breakdown
    const paymentCounts: Record<string, number> = {};
    for (const o of filteredOrders) {
      const ps = o.payment_status.replace(/\b\w/g, (c: string) => c.toUpperCase());
      paymentCounts[ps] = (paymentCounts[ps] || 0) + 1;
    }
    const paymentData = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }));

    return {
      totalRevenue, avgOrderValue, totalShipping,
      paidCount: paid.length, totalCount: filteredOrders.length,
      dailyData, statusData, topProducts, paymentData,
    };
  }, [filteredOrders]);

  const exportCSV = () => {
    const paid = filteredOrders.filter((o) => o.payment_status === "paid");
    const rows = [
      ["Order Number", "Date", "Status", "Payment", "Subtotal", "Shipping", "Total"],
      ...paid.map((o) => [
        o.order_number,
        format(parseISO(o.created_at), "yyyy-MM-dd HH:mm"),
        o.status,
        o.payment_status,
        o.subtotal,
        o.shipping_cost || 0,
        o.total,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${format(dateFrom, "yyyy-MM-dd")}-to-${format(dateTo, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
        <p className="font-accent text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-body text-sm text-foreground">
            {p.name}: {p.dataKey === "revenue" ? formatNaira(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-foreground">Sales Dashboard 📊</h2>
        <Button onClick={exportCSV} variant="outline" className="font-body gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Date Range Controls */}
      <div className="naija-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                onClick={() => handlePreset(p.days)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-accent text-xs transition-colors",
                  activePreset === p.days
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="font-body text-sm gap-2 h-8">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(dateFrom, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(d) => { if (d) { setDateFrom(d); setActivePreset(-1); } }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-sm">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="font-body text-sm gap-2 h-8">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(dateTo, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(d) => { if (d) { setDateTo(d); setActivePreset(-1); } }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Revenue", value: formatNaira(analytics.totalRevenue), icon: DollarSign, color: "text-primary" },
          { label: "Paid Orders", value: analytics.paidCount, icon: ShoppingCart, color: "text-secondary" },
          { label: "Avg Order", value: formatNaira(Math.round(analytics.avgOrderValue)), icon: TrendingUp, color: "text-primary" },
          { label: "Shipping Rev", value: formatNaira(Math.round(analytics.totalShipping)), icon: Package, color: "text-muted-foreground" },
          { label: "Total Orders", value: analytics.totalCount, icon: ShoppingCart, color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="naija-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="font-accent text-[10px] text-muted-foreground uppercase">{s.label}</span>
            </div>
            <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {analytics.dailyData.length > 0 && (
        <div className="naija-card p-6">
          <h3 className="font-display text-base font-bold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        {analytics.topProducts.length > 0 && (
          <div className="naija-card p-6">
            <h3 className="font-display text-base font-bold text-foreground mb-4">Top Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status & Payment */}
        <div className="space-y-6">
          <div className="naija-card p-6">
            <h3 className="font-display text-base font-bold text-foreground mb-4">Order Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                  {analytics.statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="naija-card p-6">
            <h3 className="font-display text-base font-bold text-foreground mb-4">Payment Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                  {analytics.paymentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="naija-card p-6">
        <h3 className="font-display text-base font-bold text-foreground mb-4">
          Orders in Period ({filteredOrders.length})
        </h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase">Order #</th>
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase">Date</th>
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase">Status</th>
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase">Payment</th>
                <th className="text-right p-3 font-accent text-xs text-muted-foreground uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 100).map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-3 font-body text-sm text-foreground">{o.order_number}</td>
                  <td className="p-3 font-body text-sm text-muted-foreground">{format(parseISO(o.created_at), "dd MMM yyyy")}</td>
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full font-accent text-[10px] uppercase",
                      o.status === "delivered" ? "bg-primary/20 text-primary" :
                      o.status === "shipped" ? "bg-secondary/20 text-secondary" :
                      o.status === "pending" ? "bg-accent/20 text-accent-foreground" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full font-accent text-[10px] uppercase",
                      o.payment_status === "paid" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                    )}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-body text-sm font-semibold text-foreground">{formatNaira(Number(o.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
