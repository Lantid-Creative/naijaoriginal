
INSERT INTO products (name, slug, description, pidgin_tagline, price, compare_at_price, stock, sizes, colors, category_id, is_active, is_featured)
VALUES 
  ('Naija Hoodie', 'naija-hoodie', 'Premium heavyweight hoodie with simple Nigeria branding. Cozy fleece lining, kangaroo pocket, and adjustable drawstring hood.', 'Warm body, warm heart — rep your country 🇳🇬', 15000, 18000, 30, ARRAY['S','M','L','XL','XXL'], ARRAY['White','Black','Green'], '34dca5ec-e06d-4d22-bf08-b1089ce0f004', true, true),
  ('Nigeria Polo Shirt', 'nigeria-polo-classic', 'Classic cotton piqué polo with embroidered Nigerian flag on chest. Smart casual vibes for any occasion.', 'Sharp guy polo — flag on chest, pride for life 🏌️', 9500, 12000, 25, ARRAY['S','M','L','XL','XXL'], ARRAY['White','Black','Green'], '34dca5ec-e06d-4d22-bf08-b1089ce0f004', true, true),
  ('Nigeria Long Sleeve Tee', 'nigeria-long-sleeve-tee', 'Comfortable long sleeve cotton tee with subtle Nigeria branding. Perfect for layering or cooler evenings.', 'Long sleeve, long money — Naija no dey carry last 💪', 8500, 10000, 20, ARRAY['S','M','L','XL','XXL'], ARRAY['White','Black'], '34dca5ec-e06d-4d22-bf08-b1089ce0f004', true, false),
  ('Naija Flag Cap', 'naija-flag-cap', 'Adjustable baseball cap with embroidered Nigerian flag. One size fits all with buckle closure.', 'Cap your style with Naija pride 🧢', 5500, 7000, 40, ARRAY['One Size'], ARRAY['White','Black','Green'], '90c08e10-65d0-460f-9dda-2af2ab2ca28c', true, true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  pidgin_tagline = EXCLUDED.pidgin_tagline,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  stock = EXCLUDED.stock,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  category_id = EXCLUDED.category_id,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured;
