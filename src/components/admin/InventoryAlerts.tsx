import { useMemo } from "react";
import { formatNaira } from "@/lib/format";
import { AlertTriangle, PackageX, TrendingDown } from "lucide-react";

interface InventoryAlertsProps {
  products: any[];
}

const InventoryAlerts = ({ products }: InventoryAlertsProps) => {
  const alerts = useMemo(() => {
    const active = products.filter((p) => p.is_active);
    const outOfStock = active.filter((p) => p.stock === 0);
    const lowStock = active.filter((p) => p.stock > 0 && p.stock <= 5);
    const mediumStock = active.filter((p) => p.stock > 5 && p.stock <= 15);
    return { outOfStock, lowStock, mediumStock };
  }, [products]);

  const totalAlerts = alerts.outOfStock.length + alerts.lowStock.length;

  if (totalAlerts === 0) {
    return (
      <div className="naija-card p-6 text-center">
        <p className="font-body text-muted-foreground">All products are well stocked! ✅</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="naija-card p-4 border-l-4 border-l-destructive">
          <div className="flex items-center gap-2 mb-1">
            <PackageX className="w-4 h-4 text-destructive" />
            <span className="font-accent text-[10px] text-muted-foreground uppercase">Out of Stock</span>
          </div>
          <p className="font-display text-2xl font-bold text-destructive">{alerts.outOfStock.length}</p>
        </div>
        <div className="naija-card p-4 border-l-4 border-l-secondary">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-secondary" />
            <span className="font-accent text-[10px] text-muted-foreground uppercase">Low Stock (≤5)</span>
          </div>
          <p className="font-display text-2xl font-bold text-secondary">{alerts.lowStock.length}</p>
        </div>
        <div className="naija-card p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span className="font-accent text-[10px] text-muted-foreground uppercase">Watch (≤15)</span>
          </div>
          <p className="font-display text-2xl font-bold text-foreground">{alerts.mediumStock.length}</p>
        </div>
      </div>

      {/* Out of Stock */}
      {alerts.outOfStock.length > 0 && (
        <div className="naija-card overflow-hidden">
          <div className="px-4 py-3 bg-destructive/10 border-b border-destructive/20">
            <h3 className="font-display text-sm font-bold text-destructive flex items-center gap-2">
              <PackageX className="w-4 h-4" /> Out of Stock — Needs Immediate Action
            </h3>
          </div>
          <div className="divide-y divide-border">
            {alerts.outOfStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{p.name}</p>
                  <p className="font-accent text-xs text-muted-foreground">{(p as any).product_categories?.name || "Uncategorized"} • {formatNaira(p.price)}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-accent text-[10px] uppercase font-bold">0 left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock */}
      {alerts.lowStock.length > 0 && (
        <div className="naija-card overflow-hidden">
          <div className="px-4 py-3 bg-secondary/10 border-b border-secondary/20">
            <h3 className="font-display text-sm font-bold text-secondary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Low Stock — Restock Soon
            </h3>
          </div>
          <div className="divide-y divide-border">
            {alerts.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{p.name}</p>
                  <p className="font-accent text-xs text-muted-foreground">{(p as any).product_categories?.name || "Uncategorized"} • {formatNaira(p.price)}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-accent text-[10px] uppercase font-bold">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Stock */}
      {alerts.mediumStock.length > 0 && (
        <div className="naija-card overflow-hidden">
          <div className="px-4 py-3 bg-muted border-b border-border">
            <h3 className="font-display text-sm font-bold text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> Watchlist (≤15 units)
            </h3>
          </div>
          <div className="divide-y divide-border">
            {alerts.mediumStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{p.name}</p>
                  <p className="font-accent text-xs text-muted-foreground">{(p as any).product_categories?.name || "Uncategorized"}</p>
                </div>
                <span className="font-accent text-xs text-muted-foreground">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
