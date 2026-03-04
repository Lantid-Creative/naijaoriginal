# Naija Product – Products Note

This note catalogs **170 products** built from all images in this folder and `Naija Product 2`. Each product is either **multi-image** (same upload batch) or **single-image**. Paths are relative to the `Naija Product` folder.

---

## Summary

| Type | Count | Notes |
|------|--------|--------|
| **Multi-image products** (2+ images) | **7** | Grouped by timestamp prefix in filename |
| **Multi-image batches** (1 image in batch) | 4 | Same naming pattern, single image |
| **Single-image products** | **159** | One image per product; some have a "(1)" variant = 2 images |
| **Total products** | **170** | |

**Image file note:** Each image often has both `.jpg` and `.avif` versions; this list uses `.jpg` paths. Files with `_800x800` or `_1350x1800` are the same image in different sizes.

---

## Multi-image products (use all listed images per product)

These products have **multiple images** from the same upload batch. Use every path below for that product.

### Product 1 — Batch 17237397 (3 images)
- `Naija Product 2/1723739772818-c8e3587265d24d23afeddb58c0172a3b-goods.jpg`
- `Naija Product 2/1723739774737-461151453c9e4eed9d35c9a4dc35cb27-goods.jpg`
- `Naija Product 2/1723739776279-c5b7a127c6fe476892834bfba4f36d91-goods.jpg`

### Product 2 — Batch 17237940 (3 images)
- `1723794047405-6741d7e7ed914c478fa031511cf1c1ea-goods.jpg`
- `1723794053115-f3c872abfd4546bf94e9d1e951ba11cf-goods.jpg`
- `1723794060685-8fdccc511d42472eb1ec45e403cc07d1-goods.jpg`

### Product 3 — Batch 17241601 (2 images)
- `1724160112722-3751430163fe4f57b4029b8add39c675-goods.jpg`
- `1724160117276-4e9177d2d70e426a872db74e7c832c07-goods.jpg`

### Product 4 — Batch 17244045 (2 images)
- `Naija Product 2/1724404577705-784a6a2ee959411aa4902445fce5abba-goods.jpg`
- `Naija Product 2/1724404580246-443db4fb22614a1baf16fb146b68203e-goods.jpg`

### Product 5 — Batch 17246452 (4 images)
- `1724645275764-fadc1969879c47968641955da42bea2d-goods.jpg`
- `1724645282755-a9ef2f63df5d42e989acb5c60374f030-goods.jpg`
- `1724645285334-52eea30ac69f4f798bae106670760ecd-goods.jpg`
- `1724645287803-6690f82a83434bac99a72409d9266ce4-goods.jpg`

### Product 6 — Batch 17248433 (3 images)
- `1724843330527-32754e85c137457eb9477d7065f59f49-goods.jpg`
- `1724843333179-35b7c413df184692b0642a413bb3db80-goods.jpg`
- `1724843335813-8158ff6be9204d5597e28cbcfc07a5af-goods.jpg`

### Product 7 — Batch 17248512 (8 images)
- `1724851225029-99661aa20c0347a4afc766a1d7be01ad-goods.jpg`
- `1724851227198-a46de3ba194746dca3a2dfb40876578f-goods.jpg`
- `1724851227552-d99dfedcbd404888abf6af249af2af7e-goods.jpg`
- `1724851230798-7374d9fb4f59441d9c344283983f4a21-goods.jpg`
- `1724851231779-9f7fbbff79914ebfa0e795c1c53b2e97-goods.jpg`
- `1724851235921-8ae0030048854f44894c050cf6d76f0a-goods.jpg`
- `1724851238468-e86caf1ee1f141199d63db88ccbf40ad-goods.jpg`
- `1724851239962-07d14b7f3e8141b3ac6583a6b7873e38-goods.jpg`

### Product 9 — Batch 17261068 (3 images)
- `Naija Product 2/1726106806229-0bd9421303f143b1933057e88ac9822e-goods.jpg`
- `Naija Product 2/1726106812611-fc94668793694edbb5f2192bc23a42b0-goods.jpg`
- `1726106816625-50267c123c1b4d90a165fa5498c69b91-goods.jpg`

---

## Single-image products with 2 images

These have a main file and a "(1)" variant — use **both** images for the product.

- **Product 28** (`1454580263324af3af5d55023a33b211-goods`):  
  `Naija Product 2/1454580263324af3af5d55023a33b211-goods (1).jpg`,  
  `Naija Product 2/1454580263324af3af5d55023a33b211-goods.jpg`

- **Product 143** (`c76012d0-7657-4898-ba6a-387887f4668b`):  
  `c76012d0-7657-4898-ba6a-387887f4668b (1).jpg`,  
  `c76012d0-7657-4898-ba6a-387887f4668b.jpg`

---

## All products index (full list)

The file **`products.json`** in this folder contains the full machine-readable list:

- **product_index**: 1–170  
- **type**: `multi_image` or `single_image`  
- **image_count**: number of images for that product  
- **images**: array of paths (relative to `Naija Product`)

Use `products.json` for scripts, import, or to map every product to its image path(s). Multi-image products are those with `image_count > 1`; single-image products with a "(1)" variant also have `image_count: 2`.

---

## How grouping was done

1. **Timestamp batches**  
   Filenames like `1724851225029-...-goods.jpg` share a timestamp prefix (first 8 digits, e.g. `17248512`). All such files in the same prefix are one product with multiple images.

2. **Single-image**  
   Everything else is one product per unique base name (after stripping `(1)`, `_800x800`, `_1350x1800`). If both `name.jpg` and `name (1).jpg` exist, they are one product with two images.

3. **Paths**  
   Images live in either the root `Naija Product` folder or the subfolder `Naija Product 2`; paths in this note and in `products.json` are relative to `Naija Product`.
