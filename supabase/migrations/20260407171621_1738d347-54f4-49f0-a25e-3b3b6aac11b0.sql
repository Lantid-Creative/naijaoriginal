
-- Add series columns to products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS series_number integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS series_year integer DEFAULT 2025,
  ADD COLUMN IF NOT EXISTS series_name text DEFAULT 'Series 1 — Genesis',
  ADD COLUMN IF NOT EXISTS product_line text;

-- Update all existing active products to Series 1
UPDATE products SET series_number = 1, series_year = 2025, series_name = 'Series 1 — Genesis' WHERE series_number IS NULL OR series_number = 1;

-- Set product_line based on slug patterns for grouping across series
UPDATE products SET product_line = 'round-neck-tee' WHERE slug LIKE '%round-neck%' OR slug LIKE '%roundneck%';
UPDATE products SET product_line = 'polo-shirt' WHERE slug LIKE '%polo%' AND product_line IS NULL;
UPDATE products SET product_line = 'hoodie' WHERE slug LIKE '%hoodie%' AND product_line IS NULL;
UPDATE products SET product_line = 'face-cap' WHERE slug LIKE '%cap%' AND product_line IS NULL;
UPDATE products SET product_line = 'durag' WHERE slug LIKE '%durag%' OR slug LIKE '%do-rag%' AND product_line IS NULL;
UPDATE products SET product_line = 'socks' WHERE slug LIKE '%sock%' AND product_line IS NULL;
UPDATE products SET product_line = 'bracelet' WHERE slug LIKE '%bracelet%' AND product_line IS NULL;
UPDATE products SET product_line = 'notepad' WHERE slug LIKE '%notepad%' AND product_line IS NULL;
UPDATE products SET product_line = 'umbrella' WHERE slug LIKE '%umbrella%' AND product_line IS NULL;
UPDATE products SET product_line = 'bottle-flask' WHERE slug LIKE '%flask%' OR slug LIKE '%bottle%' AND product_line IS NULL;
UPDATE products SET product_line = 'towel' WHERE slug LIKE '%towel%' AND product_line IS NULL;
UPDATE products SET product_line = 'tote-bag' WHERE slug LIKE '%tote%' AND product_line IS NULL;
UPDATE products SET product_line = 'duffel-bag' WHERE slug LIKE '%duffel%' AND product_line IS NULL;
UPDATE products SET product_line = 'phone-case' WHERE slug LIKE '%phone%' AND product_line IS NULL;
UPDATE products SET product_line = 'lanyard' WHERE slug LIKE '%lanyard%' AND product_line IS NULL;
UPDATE products SET product_line = 'mug' WHERE slug LIKE '%mug%' AND product_line IS NULL;
UPDATE products SET product_line = 'keychain' WHERE slug LIKE '%keychain%' OR slug LIKE '%key-chain%' AND product_line IS NULL;
UPDATE products SET product_line = 'sticker' WHERE slug LIKE '%sticker%' AND product_line IS NULL;
UPDATE products SET product_line = 'wall-art' WHERE slug LIKE '%wall-art%' OR slug LIKE '%print%' AND product_line IS NULL;
UPDATE products SET product_line = 'pillow' WHERE slug LIKE '%pillow%' OR slug LIKE '%cushion%' AND product_line IS NULL;
UPDATE products SET product_line = 'oversized-top' WHERE slug LIKE '%oversized%' OR slug LIKE '%agbada%' AND product_line IS NULL;

-- Set remaining products with their slug as product_line
UPDATE products SET product_line = slug WHERE product_line IS NULL;

-- Create index for series queries
CREATE INDEX IF NOT EXISTS idx_products_series ON products(series_number, series_year);
CREATE INDEX IF NOT EXISTS idx_products_product_line ON products(product_line);
