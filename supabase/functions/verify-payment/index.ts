import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reference, order_number } = await req.json();
    if (!reference && !order_number) {
      return new Response(JSON.stringify({ error: "Missing reference or order_number" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET) {
      return new Response(JSON.stringify({ error: "Paystack not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    let ref = reference as string | undefined;
    if (!ref && order_number) {
      const { data: order } = await sb.from("orders").select("payment_reference").eq("order_number", order_number).maybeSingle();
      ref = order?.payment_reference || undefined;
    }
    if (!ref) {
      return new Response(JSON.stringify({ error: "Reference not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const json = await res.json();

    const success = json?.data?.status === "success";
    if (success) {
      await sb.from("orders").update({
        payment_status: "paid",
        status: "paid",
        payment_reference: ref,
      }).eq("payment_reference", ref);
    }

    return new Response(JSON.stringify({ success, status: json?.data?.status, amount: json?.data?.amount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
