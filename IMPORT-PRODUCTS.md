# Import Naija Products into Supabase

This imports all 170 products from `Naija Product/` (and `Naija Product 2/`) into your Supabase project so they appear on the live site and can be bought.

## What the script does

1. **Uploads every product image** to the Supabase Storage bucket `product-images` (public).
2. **Creates a product** for each entry in `Naija Product/products.json` with:
   - Name: "Naija Product 1", "Naija Product 2", …
   - Slug: `naija-product-1`, etc. (unique)
   - Price: ₦5,000 (edit in Admin after import)
   - Stock: 50
   - Category: "Naija Original" (created if missing)
   - **Active** so they show on the shop and can be bought.
3. **Inserts product_images** with the storage URLs and `display_order` so the detail page shows all images per product.

## Prerequisites

- Node.js (same as the rest of the project).
- Supabase project with migrations applied (so `products`, `product_images`, `product_categories`, and the `product-images` storage bucket exist).

## Env vars

The script uses the **service role key** so it can upload to Storage and insert products without going through RLS.

Add to your `.env` (do **not** commit the service role key):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

- **VITE_SUPABASE_URL**: same as in your app (or `SUPABASE_URL`).
- **SUPABASE_SERVICE_ROLE_KEY**: from Supabase Dashboard → Project Settings → API → `service_role` (secret). Keep this server-side only.

## Run the import

From the **project root**:

```bash
npm run import-products
```

Or:

```bash
node scripts/import-products-to-supabase.mjs
```

If you use a `.env` file, load it first (e.g. with `dotenv`):

```bash
node -r dotenv/config scripts/import-products-to-supabase.mjs
```

(The `import-products` script uses `dotenv`; install with `npm install` if needed.)

## After import

- **Shop**: Products appear on `/shop` and are buyable (Add to cart → Checkout).
- **Admin**: At `/admin` you can edit names, prices, stock, categories, and feature flags.
- **Images**: Served from Supabase Storage; no extra deploy step for assets.

## Troubleshooting

- **"Missing env"** → Set `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`).
- **"Not found: … products.json"** → Run from project root so the path `Naija Product/products.json` exists.
- **Upload or insert errors** → Ensure migrations have run (including the one that creates the `product-images` bucket and `product_categories`). Check Supabase Dashboard → Storage and Table Editor.
