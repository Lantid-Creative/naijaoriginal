import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import { TrendingUp, ShoppingBag, Eye, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface CollectionAnalyticsProps {
  collectionId: string;
  collectionName: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function CollectionAnalytics({ collectionId, collectionName }: CollectionAnalyticsProps) {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    topProducts: [] as any[],
    revenueByProduct: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [collectionId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    // Get products in this collection
    const { data: collectionItems } = await supabase
      .from("product_collection_items")
      .select("product_id, products(id, name)")
      .eq("collection_id", collectionId);

    if (!collectionItems || collectionItems.length === 0) {
      setLoading(false);
      return;
    }

    const productIds = collectionItems.map(item => item.product_id);

    // Get order items for these products
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        *,
        order_id,
        orders!inner(payment_status, total, created_at)
      `)
      .in("product_id", productIds)
      .eq("orders.payment_status", "paid");

    if (!orderItems) {
      setLoading(false);
      return;
    }

    // Calculate analytics
    const totalRevenue = orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalOrders = new Set(orderItems.map(item => item.order_id)).size;
    const totalProductsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    // Group by product
    const productStats = productIds.map(productId => {
      const product = collectionItems.find(item => item.product_id === productId)?.products;
      const items = orderItems.filter(item => item.product_id === productId);
      const revenue = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
      const quantity = items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: productId,
        name: product?.name || "Unknown",
        revenue,
        quantity,
        orders: items.length,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    setAnalytics({
      totalRevenue,
      totalOrders,
      totalProductsSold,
      topProducts: productStats.slice(0, 5),
      revenueByProduct: productStats.slice(0, 10).map(p => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
        value: p.revenue,
      })),
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-8 bg-muted rounded w-32 mt-2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Analytics: {collectionName}
        </h3>
        <p className="font-body text-sm text-muted-foreground">
          Sales performance and engagement metrics for this collection
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">From paid orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProductsSold}</div>
            <p className="text-xs text-muted-foreground mt-1">Total units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNaira(analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products by Revenue</CardTitle>
            <CardDescription>Best performing items in this collection</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value: number) => formatNaira(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Distribution</CardTitle>
            <CardDescription>Contribution by each product</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.revenueByProduct.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.revenueByProduct}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {analytics.revenueByProduct.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatNaira(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      {analytics.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-display text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">
                        {product.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {product.quantity} units sold in {product.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-bold text-primary">
                      {formatNaira(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
