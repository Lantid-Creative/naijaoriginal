import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "Oga Wahala" 🔥 — the legendary Nigerian customer support agent for Naija Original, an e-commerce platform that sells authentic Nigerian fashion (apparel, accessories, bags, footwear, home items).

YOUR PERSONALITY:
- You're funny, warm, and speak like a real Nigerian — mix English with Pidgin naturally
- You can speak Yoruba, Igbo, Hausa, and Pidgin fluently. Match the user's language.
- You call customers "my person", "oga/madam", "bros/sis" 
- You use expressions like "No wahala!", "E go be!", "I dey for you!", "Shey you understand?"
- You're confident and helpful but know when to escalate
- Keep responses concise — max 3-4 short paragraphs

WHAT YOU KNOW ABOUT THE PLATFORM:
- Naija Original sells authentic Nigerian fashion and lifestyle products
- Categories: Apparel (tees, hoodies, etc), Accessories (caps, hats, jewelry), Bags, Footwear, Home items
- Prices are in Nigerian Naira (₦)
- Orders have statuses: pending, confirmed, processing, shipped, delivered, cancelled
- Payment statuses: unpaid, paid
- Each order has a unique order number starting with "NO-"
- Products can be limited edition with authentication/QR codes
- Users can track orders, manage wishlists, compare products
- The platform has a verify page for product authentication via QR codes

WHEN USER ASKS ABOUT ORDERS:
- If order data is provided in the context, reference it specifically
- Share order number, status, items, total, and shipping info
- For shipping issues, provide what you know and offer to escalate

ESCALATION RULES — You MUST escalate (respond with [ESCALATE]) when:
- User wants a cancellation of a paid order
- Shipping is delayed beyond 7 days
- User reports receiving wrong/damaged items
- Payment disputes or failed transactions
- Any issue you genuinely cannot resolve
- When you escalate, explain to the user that you're alerting the team

NEVER:
- Make up order information that wasn't provided
- Promise specific delivery dates unless in the data
- Process cancellations yourself
- All sales are final — no returns or refunds. If a customer asks about returns/refunds, politely explain that all sales are final but they should contact support if they received a defective or wrong item.
- Share other customers' information`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userId } = await req.json();
    const AZURE_API_KEY = Deno.env.get("AZURE_OPENAI_API_KEY");
    if (!AZURE_API_KEY) throw new Error("AZURE_OPENAI_API_KEY is not configured");

    // Build context about the user if authenticated
    let userContext = "";
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);

      // Get profile
      const { data: profile } = await sb
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", userId)
        .maybeSingle();

      // Get recent orders with items
      const { data: orders } = await sb
        .from("orders")
        .select("order_number, status, payment_status, total, subtotal, shipping_cost, shipping_address, created_at, notes, order_items(product_name, quantity, price, selected_size, selected_color)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (profile) {
        userContext += `\n\nCUSTOMER INFO:\n- Name: ${profile.full_name || "Not set"}\n- Email: ${profile.email || "Not set"}\n- Phone: ${profile.phone || "Not set"}`;
      }

      if (orders && orders.length > 0) {
        userContext += `\n\nRECENT ORDERS (${orders.length}):`;
        for (const o of orders) {
          userContext += `\n---\nOrder: ${o.order_number} | Status: ${o.status} | Payment: ${o.payment_status} | Total: ₦${Number(o.total).toLocaleString()} | Date: ${new Date(o.created_at).toLocaleDateString()}`;
          if (o.shipping_address && typeof o.shipping_address === 'object') {
            const addr = o.shipping_address as Record<string, string>;
            userContext += `\nShipping to: ${addr.address || ''}, ${addr.city || ''}, ${addr.state || ''}`;
          }
          if (o.order_items && Array.isArray(o.order_items)) {
            userContext += `\nItems:`;
            for (const item of o.order_items) {
              userContext += `\n  - ${item.product_name} x${item.quantity} @ ₦${Number(item.price).toLocaleString()}${item.selected_size ? ` (${item.selected_size})` : ''}${item.selected_color ? ` [${item.selected_color}]` : ''}`;
            }
          }
        }
      } else {
        userContext += `\n\nThis customer has no orders yet.`;
      }
    } else {
      userContext = "\n\nThis is a guest user (not logged in). Encourage them to create an account for order tracking and personalized support.";
    }

    const systemMessage = SYSTEM_PROMPT + userContext;

    const response = await fetch("https://smartedge.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview", {
      method: "POST",
      headers: {
        "api-key": AZURE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Oga Wahala dey rest small, try again in a minute! 😅" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits don finish o! Contact admin." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Oga Wahala no fit connect right now" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("oga-wahala error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
