import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { limit = 5, nameFilter } = await req.json();

  const { data: categories } = await supabase.from("product_categories").select("id, name, slug");
  const categoryList = (categories || []).map((c: any) => `${c.name} (${c.id})`).join(", ");

  let query = supabase
    .from("products")
    .select("id, name, slug, price, product_images(image_url)")
    .eq("is_active", true);
  
  if (nameFilter) {
    query = query.like("name", nameFilter);
  }
  
  const { data: products, error } = await query.order("id").limit(limit);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get existing names to avoid duplicates
  const { data: allProducts } = await supabase.from("products").select("id, name").eq("is_active", true);
  const existingNames = new Set((allProducts || []).map((p: any) => p.name));

  const results: any[] = [];

  for (const product of products || []) {
    const imageUrl = product.product_images?.[0]?.image_url;
    if (!imageUrl) { results.push({ id: product.id, skipped: true }); continue; }

    try {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: `You are naming products for "Naija Original", a Nigerian fashion brand. Look at this image and respond with ONLY valid JSON (no markdown):
{"name":"<2-5 word UNIQUE product name that accurately describes what you see>","description":"<2-3 sentences about this product>","pidgin_tagline":"<1 pidgin sentence>","category_id":"<pick from: ${categoryList}>","price":<naira: tees 5000-8000, hoodies 12000-18000, shoes 15000-25000, accessories 3000-8000, bags 8000-15000>,"sizes":["S","M","L","XL","XXL"],"colors":["<colors visible>"]}
Use ["One Size"] for accessories. Make the name SPECIFIC - include color, style, and type. Avoid generic names like "Classic Black Tee". Instead use something like "Midnight V-Neck Tee" or "Naija Crest Polo".` },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      const aiData = await aiRes.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { results.push({ id: product.id, error: "no json" }); continue; }

      const p = JSON.parse(jsonMatch[0]);
      
      // Ensure unique name
      let finalName = p.name;
      let counter = 2;
      while (existingNames.has(finalName) && finalName !== product.name) {
        finalName = `${p.name} ${counter}`;
        counter++;
      }
      existingNames.add(finalName);

      const baseSlug = finalName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { data: conflict } = await supabase.from("products").select("id").eq("slug", baseSlug).neq("id", product.id).maybeSingle();
      const slug = conflict ? `${baseSlug}-${product.id.substring(0, 6)}` : baseSlug;

      await supabase.from("products").update({
        name: finalName, slug, description: p.description, pidgin_tagline: p.pidgin_tagline,
        category_id: p.category_id, price: p.price, sizes: p.sizes, colors: p.colors,
      }).eq("id", product.id);

      results.push({ id: product.id, old: product.name, new: finalName, price: p.price });
    } catch (err: any) {
      results.push({ id: product.id, error: err.message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
