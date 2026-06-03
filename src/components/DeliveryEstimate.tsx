import { addDays, format } from "date-fns";
import { Globe, MessageCircle, Truck, MapPin } from "lucide-react";

const DeliveryEstimate = () => {
  const now = new Date();
  const standardDate = format(addDays(now, 14), "EEEE, MMM d");

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h4 className="font-accent text-sm font-bold text-foreground flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary" /> Delivery Options (Nigeria)
      </h4>
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-accent text-xs font-semibold text-foreground">Doorstep delivery — ₦2,000 – ₦5,000</p>
            <p className="font-body text-xs text-muted-foreground">Fee shown at checkout per city. Around {standardDate}.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-accent text-xs font-semibold text-foreground">Park pickup — ₦2,000 – ₦10,000</p>
            <p className="font-body text-xs text-muted-foreground">Collect at park near you. We send the address via WhatsApp.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-accent text-xs font-semibold text-foreground">WhatsApp confirmation</p>
            <p className="font-body text-xs text-muted-foreground">We reach out at your preferred time to confirm details</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="font-accent text-xs font-semibold text-foreground">International Shipping</p>
            <p className="font-body text-xs text-muted-foreground">Custom quote via WhatsApp after order</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryEstimate;
