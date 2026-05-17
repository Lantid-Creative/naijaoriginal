import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text } = (await req.json()) as EmailRequest;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const host = Deno.env.get("SMTP_HOST")!;
    const port = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const username = Deno.env.get("SMTP_USER")!;
    const password = Deno.env.get("SMTP_PASS")!;
    const rawFromEmail = Deno.env.get("SMTP_FROM_EMAIL") || username;
    const rawFromName = Deno.env.get("SMTP_FROM_NAME") || "Naija Original";
    // Guard against swapped/invalid SMTP_FROM_EMAIL — must be a real email
    const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const fromEmail = isEmail(rawFromEmail) ? rawFromEmail : username;
    const fromName = isEmail(rawFromName) ? rawFromEmail : rawFromName;
    const fromHeader = `${fromName} <${fromEmail}>`;

    console.log("SMTP config:", { host, port, username, fromEmail, fromName });

    const client = new SMTPClient({
      connection: {
        hostname: host,
        port,
        tls: true,
        auth: {
          username,
          password,
        },
      },
    });

    await client.send({
      from: fromHeader,
      to,
      subject,
      content: text || "",
      html,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
