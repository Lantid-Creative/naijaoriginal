-- Step 1: Remove collection items referencing products we're about to delete
DELETE FROM product_collection_items 
WHERE product_id IN (
  SELECT id FROM products WHERE is_active = false
  UNION
  SELECT id FROM products WHERE slug IN ('city-hoodie-lagos','city-hoodie-abuja','lagos-look-agbada-fusion')
  UNION
  SELECT id FROM products WHERE slug LIKE '%bundle%' OR slug LIKE '%pack%' OR slug LIKE '%gift%'
);

-- Step 2: Remove product images for those products
DELETE FROM product_images 
WHERE product_id IN (
  SELECT id FROM products WHERE is_active = false
  UNION
  SELECT id FROM products WHERE slug IN ('city-hoodie-lagos','city-hoodie-abuja','lagos-look-agbada-fusion')
  UNION
  SELECT id FROM products WHERE slug LIKE '%bundle%' OR slug LIKE '%pack%' OR slug LIKE '%gift%'
);

-- Step 3: Remove product authentications
DELETE FROM product_authentications 
WHERE product_id IN (
  SELECT id FROM products WHERE is_active = false
  UNION
  SELECT id FROM products WHERE slug IN ('city-hoodie-lagos','city-hoodie-abuja','lagos-look-agbada-fusion')
  UNION
  SELECT id FROM products WHERE slug LIKE '%bundle%' OR slug LIKE '%pack%' OR slug LIKE '%gift%'
);

-- Step 4: Remove product reviews
DELETE FROM product_reviews 
WHERE product_id IN (
  SELECT id FROM products WHERE is_active = false
  UNION
  SELECT id FROM products WHERE slug IN ('city-hoodie-lagos','city-hoodie-abuja','lagos-look-agbada-fusion')
  UNION
  SELECT id FROM products WHERE slug LIKE '%bundle%' OR slug LIKE '%pack%' OR slug LIKE '%gift%'
);

-- Step 5: Delete the inactive products
DELETE FROM products WHERE is_active = false;

-- Step 6: Delete city edition products
DELETE FROM products WHERE slug IN ('city-hoodie-lagos','city-hoodie-abuja','lagos-look-agbada-fusion');

-- Step 7: Delete bundle/pack/gift products
DELETE FROM products WHERE slug LIKE '%bundle%' OR slug LIKE '%pack%' OR slug LIKE '%gift%';