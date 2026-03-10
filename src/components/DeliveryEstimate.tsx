import { addDays, format } from "date-fns";
import { Truck, Zap, Globe } from "lucide-react";

const DeliveryEstimate = () => {
  const now = new Date();
  const standardDate = format(addDays(now, 14), "EEEE, MMM d");
  const fastDate = format(addDays(now, 5), "EEEE, MMM d");

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h4 className="font-accent text-sm font-bold text-foreground flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary" /> Delivery Estimates
      </h4>
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-accent text-xs font-semibold text-foreground">Standard Delivery — ₦5,000</p>
            <p className="font-body text-xs text-muted-foreground">Estimated by {standardDate}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-accent text-xs font-semibold text-foreground">Fast Delivery — ₦10,000</p>
            <p className="font-body text-xs text-muted-foreground">Estimated by {fastDate}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="font-accent text-xs font-semibold text-foreground">International Shipping</p>
            <p className="font-body text-xs text-muted-foreground">Custom quote — we go reach out after order</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryEstimate;
