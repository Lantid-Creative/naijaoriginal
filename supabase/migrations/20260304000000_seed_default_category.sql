-- Ensure a default product category exists for imports (e.g. Naija products)
INSERT INTO public.product_categories (name, slug, pidgin)
VALUES ('Naija Original', 'naija-original', 'Original Naija style')
ON CONFLICT (slug) DO NOTHING;
