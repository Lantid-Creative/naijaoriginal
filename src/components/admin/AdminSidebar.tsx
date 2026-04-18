import {
  LayoutDashboard, Package, Layers, Boxes, FileEdit, Sparkles,
  ShoppingCart, Star, MessageSquare, Mail, Users, QrCode,
  BarChart3, TrendingUp, Bot, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

export type AdminSection =
  | "overview" | "ai" | "sales" | "analytics"
  | "products" | "bulk-edit" | "inventory" | "series" | "collections"
  | "orders" | "qr"
  | "reviews" | "tickets" | "subscribers";

interface AdminSidebarProps {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
  badges?: Partial<Record<AdminSection, number>>;
}

const groups: { label: string; items: { id: AdminSection; title: string; icon: any }[] }[] = [
  {
    label: "Insights",
    items: [
      { id: "overview", title: "Overview", icon: LayoutDashboard },
      { id: "ai", title: "AI Assistant", icon: Bot },
      { id: "sales", title: "Sales", icon: TrendingUp },
      { id: "analytics", title: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { id: "products", title: "Products", icon: Package },
      { id: "bulk-edit", title: "Bulk Edit", icon: FileEdit },
      { id: "inventory", title: "Inventory", icon: Boxes },
      { id: "series", title: "Series", icon: Sparkles },
      { id: "collections", title: "Collections", icon: Layers },
    ],
  },
  {
    label: "Commerce",
    items: [
      { id: "orders", title: "Orders", icon: ShoppingCart },
      { id: "qr", title: "QR Codes", icon: QrCode },
    ],
  },
  {
    label: "Community",
    items: [
      { id: "reviews", title: "Reviews", icon: Star },
      { id: "tickets", title: "Tickets", icon: MessageSquare },
      { id: "subscribers", title: "Subscribers", icon: Mail },
    ],
  },
];

const AdminSidebar = ({ active, onChange, badges = {} }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <Link
          to="/"
          className="flex items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-foreground truncate">Admin</p>
              <p className="font-body text-[10px] text-muted-foreground truncate">Naija Original</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const isActive = active === item.id;
                  const badge = badges[item.id];
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <button
                          onClick={() => onChange(item.id)}
                          className={`w-full flex items-center gap-2 ${
                            isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
                          }`}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          {!collapsed && <span className="flex-1 text-left truncate">{item.title}</span>}
                          {!collapsed && badge !== undefined && badge > 0 && (
                            <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-accent font-bold">
                              {badge}
                            </span>
                          )}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
