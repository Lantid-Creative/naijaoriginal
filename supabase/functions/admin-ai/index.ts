import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_SYSTEM_PROMPT = `You are "Oga Dashboard" 🧠 — the AI admin assistant for Naija Original e-commerce platform.

YOUR ROLE:
- You help the admin understand and manage their platform
- You analyze sales data, orders, products, customers, and trends
- You speak naturally with some Nigerian flavor but keep it professional
- You provide actionable insights, not just raw numbers
- Keep responses clear and structured — use bullet points, tables when helpful

WHAT YOU HAVE ACCESS TO:
The platform data will be provided to you as context. You can answer questions about:
- Sales analytics: revenue, order counts, trends, averages
- Order management: statuses, pending orders, international orders needing quotes
- Product performance: top sellers, stock levels, pricing, categories
- Customer insights: top customers, review stats, subscriber counts
- Support tickets: open issues, escalation patterns
- Platform health: overall performance metrics

HOW TO RESPOND:
- Give specific numbers from the data provided
- Highlight concerning trends (low stock, pending orders, open tickets)
- Suggest actions when appropriate ("You should restock X", "3 tickets need attention")
- Use emojis sparingly for emphasis
- Format currency in Naira (₦) with commas
- If asked about something not in the data, say so honestly
- You can do calculations on the data (averages, percentages, growth)

NEVER:
- Make up data that wasn't provided
- Access or modify customer passwords/auth
- Execute database operations — you only analyze and advise
- Share raw database IDs with the admin (use order numbers, product names instead)`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    // Verify admin access
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // Check admin role
    const { data: roleData } = await sb
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather platform data in parallel
    const [
      productsRes,
      ordersRes,
      ticketsRes,
      reviewsRes,
      subscribersRes,
      categoriesRes,
      profilesRes,
    ] = await Promise.all([
      sb.from("products").select("name, slug, price, compare_at_price, stock, is_active, is_featured, is_limited_edition, edition_total, sizes, colors, created_at, category_id, product_categories:category_id(name)"),
      sb.from("orders").select("order_number, status, payment_status, total, subtotal, shipping_cost, shipping_address, created_at, notes, user_id, guest_email, guest_name, order_items(product_name, quantity, price, selected_size, selected_color)").order("created_at", { ascending: false }).limit(100),
      sb.from("support_tickets").select("status, conversation_summary, user_message, created_at, admin_notes").order("created_at", { ascending: false }).limit(50),
      sb.from("product_reviews").select("rating, comment, is_approved, created_at, products:product_id(name)").order("created_at", { ascending: false }).limit(50),
      sb.from("newsletter_subscribers").select("email, full_name, is_active, subscribed_at"),
      sb.from("product_categories").select("name, slug"),
      sb.from("profiles").select("full_name, email, phone, created_at").order("created_at", { ascending: false }).limit(50),
    ]);

    const products = productsRes.data || [];
    const orders = ordersRes.data || [];
    const tickets = ticketsRes.data || [];
    const reviews = reviewsRes.data || [];
    const subscribers = subscribersRes.data || [];
    const categories = categoriesRes.data || [];
    const profiles = profilesRes.data || [];

    // Calculate analytics
    const paidOrders = orders.filter((o: any) => o.payment_status === "paid");
    const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
    const shippedOrders = orders.filter((o: any) => o.status === "shipped").length;
    const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;
    const intlOrders = orders.filter((o: any) => o.status === "pending_shipping_quote").length;
    const openTickets = tickets.filter((t: any) => t.status === "open").length;
    const pendingReviews = reviews.filter((r: any) => !r.is_approved).length;
    const approvedReviews = reviews.filter((r: any) => r.is_approved).length;
    const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : "N/A";
    const activeSubscribers = subscribers.filter((s: any) => s.is_active).length;
    const lowStockProducts = products.filter((p: any) => p.stock <= 5 && p.is_active);
    const outOfStockProducts = products.filter((p: any) => p.stock === 0 && p.is_active);
    const activeProducts = products.filter((p: any) => p.is_active).length;

    // Product popularity from orders
    const productSales: Record<string, { qty: number; revenue: number }> = {};
    for (const o of paidOrders) {
      if (o.order_items && Array.isArray(o.order_items)) {
        for (const item of o.order_items) {
          const name = item.product_name;
          if (!productSales[name]) productSales[name] = { qty: 0, revenue: 0 };
          productSales[name].qty += item.quantity;
          productSales[name].revenue += Number(item.price) * item.quantity;
        }
      }
    }
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([name, data]) => `${name}: ${data.qty} sold, ₦${data.revenue.toLocaleString()} revenue`);

    // Recent orders summary
    const recentOrders = orders.slice(0, 15).map((o: any) => {
      const addr = o.shipping_address && typeof o.shipping_address === "object" ? o.shipping_address as Record<string, string> : {};
      return `${o.order_number} | ${o.status} | ${o.payment_status} | ₦${Number(o.total).toLocaleString()} | ${addr.state || addr.country || "Unknown"} | ${new Date(o.created_at).toLocaleDateString()}`;
    });

    // Build platform context
    let platformContext = `
PLATFORM SNAPSHOT (as of ${new Date().toLocaleDateString()}):

📊 KEY METRICS:
- Total Revenue (paid orders): ₦${totalRevenue.toLocaleString()}
- Total Orders: ${orders.length} | Paid: ${paidOrders.length}
- Average Order Value: ₦${Math.round(avgOrderValue).toLocaleString()}
- Pending Orders: ${pendingOrders} | Shipped: ${shippedOrders} | Delivered: ${deliveredOrders}
- International Orders Awaiting Quote: ${intlOrders}

📦 PRODUCTS:
- Total: ${products.length} | Active: ${activeProducts}
- Categories: ${categories.map((c: any) => c.name).join(", ")}
- Low Stock (≤5): ${lowStockProducts.length}${lowStockProducts.length > 0 ? ` — ${lowStockProducts.map((p: any) => `${p.name} (${p.stock} left)`).join(", ")}` : ""}
- Out of Stock: ${outOfStockProducts.length}${outOfStockProducts.length > 0 ? ` — ${outOfStockProducts.map((p: any) => p.name).join(", ")}` : ""}

🏆 TOP SELLING PRODUCTS:
${topProducts.length > 0 ? topProducts.map((p, i) => `${i + 1}. ${p}`).join("\n") : "No sales data yet"}

🛒 RECENT ORDERS:
${recentOrders.length > 0 ? recentOrders.join("\n") : "No orders yet"}

🎫 SUPPORT:
- Open Tickets: ${openTickets} | Total: ${tickets.length}
${openTickets > 0 ? "Open ticket summaries:\n" + tickets.filter((t: any) => t.status === "open").slice(0, 5).map((t: any) => `- "${t.conversation_summary}"`).join("\n") : ""}

⭐ REVIEWS:
- Total: ${reviews.length} | Pending Approval: ${pendingReviews} | Approved: ${approvedReviews}
- Average Rating: ${avgRating}

📧 NEWSLETTER:
- Total Subscribers: ${subscribers.length} | Active: ${activeSubscribers}

👥 RECENT CUSTOMERS:
${profiles.slice(0, 10).map((p: any) => `- ${p.full_name || "No name"} (${p.email || "No email"}) — joined ${new Date(p.created_at).toLocaleDateString()}`).join("\n")}

ALL PRODUCTS LIST:
${products.map((p: any) => `- ${p.name} | ₦${Number(p.price).toLocaleString()}${p.compare_at_price ? ` (was ₦${Number(p.compare_at_price).toLocaleString()})` : ""} | Stock: ${p.stock} | ${p.is_active ? "Active" : "Inactive"} | Category: ${(p as any).product_categories?.name || "Uncategorized"}`).join("\n")}
`;

    const systemMessage = ADMIN_SYSTEM_PROMPT + "\n\n" + platformContext;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Top up in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("admin-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
