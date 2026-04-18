import { formatNaira } from "@/lib/format";
import { ShoppingCart, Package, AlertTriangle, Star, TrendingUp, Users, Mail, ArrowRight, MessageSquare } from "lucide-react";
import type { AdminSection } from "./AdminSidebar";

interface Props {
  products: any[];
  orders: any[];
  reviews: any[];
  subscribers: any[];
  tickets: any[];
  onJump: (s: AdminSection) => void;
}

const AdminOverview = ({ products, orders, reviews, subscribers, tickets, onJump }: Props) => {
  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => p.is_active && p.stock <= 5);
  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const openTickets = tickets.filter((t) => t.status === "open");
  const recentOrders = orders.slice(0, 5);

  // Last 7 days revenue mini-bars
  const today = new Date(); today.setHours(0,0,0,0);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const revenueByDay = last7.map((d) => {
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const sum = paidOrders
      .filter((o) => {
        const od = new Date(o.created_at);
        return od >= d && od < next;
      })
      .reduce((s, o) => s + Number(o.total), 0);
    return { date: d, sum };
  });
  const maxRev = Math.max(...revenueByDay.map((r) => r.sum), 1);
  const weekRevenue = revenueByDay.reduce((s, r) => s + r.sum, 0);

  const kpis = [
    { label: "Revenue (paid)", value: formatNaira(totalRevenue), icon: TrendingUp, accent: "text-primary", bg: "bg-primary/10" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, accent: "text-foreground", bg: "bg-muted" },
    { label: "Pending Orders", value: pendingOrders, icon: AlertTriangle, accent: "text-secondary", bg: "bg-secondary/10" },
    { label: "Active Products", value: products.filter((p) => p.is_active).length, icon: Package, accent: "text-foreground", bg: "bg-muted" },
    { label: "Subscribers", value: subscribers.filter((s) => s.is_active).length, icon: Mail, accent: "text-primary", bg: "bg-primary/10" },
    { label: "Open Tickets", value: openTickets.length, icon: MessageSquare, accent: openTickets.length > 0 ? "text-destructive" : "text-foreground", bg: openTickets.length > 0 ? "bg-destructive/10" : "bg-muted" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="naija-card p-4">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon className={`w-4 h-4 ${k.accent}`} />
            </div>
            <p className="font-accent text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{k.label}</p>
            <p className="font-display text-xl font-bold text-foreground truncate">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart + Recent orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="naija-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Revenue — Last 7 Days</h3>
              <p className="font-body text-xs text-muted-foreground">{formatNaira(weekRevenue)} earned this week</p>
            </div>
            <button onClick={() => onJump("sales")} className="text-xs font-body text-primary hover:underline flex items-center gap-1">
              Sales dashboard <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-end gap-2 h-40">
            {revenueByDay.map((r, i) => {
              const h = Math.max((r.sum / maxRev) * 100, 4);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary transition-all hover:opacity-80"
                      style={{ height: `${h}%` }}
                      title={formatNaira(r.sum)}
                    />
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground">
                    {r.date.toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="naija-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-foreground">Recent Orders</h3>
            <button onClick={() => onJump("orders")} className="text-xs font-body text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-semibold text-foreground truncate">{o.order_number}</p>
                    <p className="font-body text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-sm font-bold text-foreground">{formatNaira(Number(o.total))}</p>
                    <span className={`font-accent text-[10px] capitalize ${
                      o.payment_status === "paid" ? "text-primary" : "text-secondary"
                    }`}>{o.payment_status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action lists */}
      <div className="grid lg:grid-cols-3 gap-6">
        <ActionCard
          title="Low Stock Alerts"
          icon={AlertTriangle}
          iconClass="text-destructive"
          count={lowStock.length}
          emptyText="All products well stocked 🎉"
          onJump={() => onJump("inventory")}
          jumpLabel="Manage inventory"
        >
          {lowStock.slice(0, 5).map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-body text-foreground truncate">{p.name}</span>
              <span className="font-accent text-xs text-destructive shrink-0">{p.stock} left</span>
            </li>
          ))}
        </ActionCard>

        <ActionCard
          title="Pending Reviews"
          icon={Star}
          iconClass="text-secondary"
          count={pendingReviews.length}
          emptyText="No reviews waiting 👌"
          onJump={() => onJump("reviews")}
          jumpLabel="Moderate reviews"
        >
          {pendingReviews.slice(0, 5).map((r: any) => (
            <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-body text-foreground truncate">{r.products?.name || "Review"}</span>
              <span className="font-accent text-xs text-secondary shrink-0">★ {r.rating}</span>
            </li>
          ))}
        </ActionCard>

        <ActionCard
          title="Open Tickets"
          icon={MessageSquare}
          iconClass="text-destructive"
          count={openTickets.length}
          emptyText="No open tickets ✨"
          onJump={() => onJump("tickets")}
          jumpLabel="Reply to tickets"
        >
          {openTickets.slice(0, 5).map((t: any) => (
            <li key={t.id} className="text-sm">
              <p className="font-body text-foreground truncate">{t.user_message}</p>
              <p className="font-body text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ActionCard>
      </div>
    </div>
  );
};

const ActionCard = ({ title, icon: Icon, iconClass, count, emptyText, onJump, jumpLabel, children }: any) => (
  <div className="naija-card p-5 flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconClass}`} />
        <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
        {count > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-muted font-accent text-[10px] text-muted-foreground">{count}</span>
        )}
      </div>
      <button onClick={onJump} className="text-xs font-body text-primary hover:underline flex items-center gap-1">
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
    {count === 0 ? (
      <p className="font-body text-sm text-muted-foreground text-center py-6 flex-1">{emptyText}</p>
    ) : (
      <ul className="space-y-3 flex-1">{children}</ul>
    )}
    <button onClick={onJump} className="mt-4 text-xs font-body text-muted-foreground hover:text-primary text-left">
      {jumpLabel} →
    </button>
  </div>
);

export default AdminOverview;
