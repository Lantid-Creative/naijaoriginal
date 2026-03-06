import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, X, CheckCircle, ShoppingCart, Star, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

const typeIcons: Record<string, typeof Bell> = {
  order_confirmation: ShoppingCart,
  review_approved: Star,
  general: MessageSquare,
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications((data as any) || []);
    };
    fetchNotifications();

    // Subscribe to realtime
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    await supabase.from("user_notifications").update({ is_read: true } as any).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("user_notifications").update({ is_read: true } as any).in("id", ids);
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  if (!user) return null;

  const getLink = (n: Notification) => {
    if (n.type === "order_confirmation" && n.metadata?.order_id) return `/orders`;
    if (n.type === "review_approved" && n.metadata?.product_id) return `/shop`;
    return undefined;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-foreground hover:text-primary transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-naija-gold text-secondary font-accent text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-2xl shadow-xl z-50"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-accent text-sm font-bold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="font-body text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="font-body text-sm text-muted-foreground">All caught up! 🎉</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => {
                    const Icon = typeIcons[n.type] || Bell;
                    const link = getLink(n);
                    const content = (
                      <div className="flex gap-3 p-3 hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-accent text-xs font-bold text-foreground">{n.title}</p>
                          <p className="font-body text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="font-body text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(n.id); }}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                    return link ? (
                      <Link key={n.id} to={link} onClick={() => { markAsRead(n.id); setOpen(false); }}>
                        {content}
                      </Link>
                    ) : (
                      <div key={n.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
