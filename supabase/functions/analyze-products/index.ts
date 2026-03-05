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

  const { limit = 5, nameFilter } = await req.json();

  // Helper to call Supabase REST API directly
  const sbFetch = async (path: string, options: RequestInit = {}) => {
    const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
      ...options,
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": options.method === "PATCH" ? "return=minimal" : "return=representation",
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Supabase REST error [${res.status}]: ${text}`);
      return { error: text, data: null };
    }
    if (options.method === "PATCH") return { data: "ok", error: null };
    return { data: await res.json(), error: null };
  };

  // Get categories
  const { data: categories } = await sbFetch("/product_categories?select=id,name,slug");
  const categoryList = (categories || []).map((c: any) => `${c.name} (${c.id})`).join(", ");

  // Get products
  let url = `/products?select=id,name,slug,price,product_images(image_url)&is_active=eq.true&order=id&limit=${limit}`;
  if (nameFilter) url += `&name=like.${encodeURIComponent(nameFilter)}`;
  const { data: products, error } = await sbFetch(url);

  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get existing names
  const { data: allProducts } = await sbFetch("/products?select=id,name&is_active=eq.true&limit=500");
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
              { type: "text", text: `You are naming products for "Naija Original", a Nigerian streetwear brand. Look at this product image and respond with ONLY valid JSON (no markdown, no code blocks):
{"name":"<2-4 word product name describing what you see - be specific about color and type>","description":"<2-3 sentence story about this product, connecting it to Nigerian culture and street fashion>","pidgin_tagline":"<1 pidgin English sentence about this product>","category_id":"<pick the best UUID from: ${categoryList}>","price":<reasonable Naira price: tees/tanks 5000-8000, shirts/polos 7000-10000, hoodies/jackets 12000-18000, pants/shorts 8000-12000, shoes 15000-25000, accessories/hats/scarves 3000-7000, bags 8000-15000>,"sizes":["S","M","L","XL","XXL"],"colors":["<main colors you see>"]}
Use ["One Size"] for accessories/hats/scarves. IMPORTANT: Return ONLY the category UUID, not the name.` },
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
      if (!jsonMatch) { results.push({ id: product.id, error: "no json", content }); continue; }

      const p = JSON.parse(jsonMatch[0]);

      // Validate category_id
      let categoryId = p.category_id;
      const validIds = new Set((categories || []).map((c: any) => c.id));
      if (!validIds.has(categoryId)) {
        const uuidMatch = (categoryId || "").match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        categoryId = uuidMatch && validIds.has(uuidMatch[0]) ? uuidMatch[0] : null;
      }

      // Unique name
      let finalName = p.name;
      let counter = 2;
      while (existingNames.has(finalName) && finalName !== product.name) {
        finalName = `${p.name} ${counter}`;
        counter++;
      }
      existingNames.add(finalName);

      const baseSlug = finalName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const updateData: any = {
        name: finalName,
        slug: baseSlug + "-" + product.id.substring(0, 6),
        description: p.description,
        pidgin_tagline: p.pidgin_tagline,
        price: p.price,
        sizes: p.sizes,
        colors: p.colors,
      };
      if (categoryId) updateData.category_id = categoryId;

      const { error: updateError } = await sbFetch(`/products?id=eq.${product.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      results.push({ id: product.id, old: product.name, new: finalName, price: p.price, error: updateError || null });
    } catch (err: any) {
      results.push({ id: product.id, error: err.message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
