#!/usr/bin/env node
/**
 * Import Naija products and images into Supabase.
 * - Uploads each image to the "product-images" storage bucket
 * - Inserts products and product_images so they can be bought on the live site
 *
 * Requires: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (e.g. in .env)
 * Run from project root: npm run import-products
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const NAIJA_PRODUCT_DIR = join(PROJECT_ROOT, "Naija Product");
const PRODUCTS_JSON_PATH = join(NAIJA_PRODUCT_DIR, "products.json");
const BUCKET = "product-images";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing env. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function safeStoragePath(productId, index, imagePath) {
  const base = imagePath.replace(/^.*[/\\]/, "").replace(/\s+/g, "-");
  return `${productId}/${index}-${base}`;
}

async function ensureDefaultCategory() {
  const { data: existing } = await supabase
    .from("product_categories")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("product_categories")
    .insert({
      name: "Naija Original",
      slug: "naija-original",
      pidgin: "Original Naija style",
    })
    .select("id")
    .single();
  if (error) throw new Error("Failed to create default category: " + error.message);
  return created.id;
}

async function uploadImage(productId, index, imageRelPath) {
  const fullPath = join(NAIJA_PRODUCT_DIR, imageRelPath);
  if (!existsSync(fullPath)) {
    throw new Error("Missing file: " + fullPath);
  }
  const buffer = readFileSync(fullPath);
  const storagePath = safeStoragePath(productId, index, imageRelPath);

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error("Upload failed " + storagePath + ": " + error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return publicUrl;
}

async function importProduct(productIndex, product, defaultCategoryId) {
  const name = `Naija Product ${productIndex}`;
  const slugBase = slugify(name);
  let slug = slugBase;
  let suffix = 0;
  while (true) {
    const { data: conflict } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (!conflict) break;
    slug = `${slugBase}-${++suffix}`;
  }

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description: null,
      pidgin_tagline: "Original from Naija 🇳🇬",
      price: 5000,
      compare_at_price: null,
      category_id: defaultCategoryId,
      stock: 50,
      sizes: [],
      colors: [],
      is_limited_edition: false,
      edition_total: null,
      is_featured: productIndex <= 10,
      is_active: true,
    })
    .select("id")
    .single();

  if (productError) throw new Error("Product insert failed: " + productError.message);
  const productId = productRow.id;

  const images = product.images || [];
  for (let i = 0; i < images.length; i++) {
    const imageUrl = await uploadImage(productId, i, images[i]);
    const { error: imgError } = await supabase.from("product_images").insert({
      product_id: productId,
      image_url: imageUrl,
      alt_text: `${name} - image ${i + 1}`,
      display_order: i,
    });
    if (imgError) throw new Error("product_images insert failed: " + imgError.message);
  }

  return { productId, name, slug, imageCount: images.length };
}

async function main() {
  if (!existsSync(PRODUCTS_JSON_PATH)) {
    console.error("Not found:", PRODUCTS_JSON_PATH);
    process.exit(1);
  }

  const products = JSON.parse(readFileSync(PRODUCTS_JSON_PATH, "utf8"));
  const defaultCategoryId = await ensureDefaultCategory();
  console.log("Using category id:", defaultCategoryId);
  console.log("Importing", products.length, "products…\n");

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    try {
      const result = await importProduct(i + 1, p, defaultCategoryId);
      console.log(`[${i + 1}/${products.length}] ${result.name} (${result.imageCount} images) → ${result.slug}`);
    } catch (err) {
      console.error(`[${i + 1}/${products.length}] FAILED:`, err.message);
      throw err;
    }
  }

  console.log("\nDone. Products are active and can be bought on the live site.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
