import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Star, ArrowUp, ArrowDown } from "lucide-react";

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

interface Props {
  productId: string;
}

export default function ProductImagesManager({ productId }: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });
    if (error) {
      toast({ title: "Couldn't load images", description: error.message, variant: "destructive" });
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (productId) fetchImages();
  }, [productId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const startOrder = images.length;
    const uploadOne = async (file: File, idx: number) => {
      if (!file.type.startsWith("image/")) throw new Error("Only image files allowed");
      if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} is bigger than 5MB`);

      const ext = file.name.split(".").pop();
      const path = `${productId}/${Date.now()}-${idx}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);

      const { error: insErr } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: publicUrl,
        display_order: startOrder + idx,
        alt_text: file.name,
      });
      if (insErr) throw insErr;
    };

    try {
      const arr = Array.from(files);
      for (let i = 0; i < arr.length; i++) {
        await uploadOne(arr[i], i);
      }
      toast({ title: `Uploaded ${arr.length} image${arr.length > 1 ? "s" : ""} 🎉` });
      fetchImages();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (img: ProductImage) => {
    if (!confirm("Remove this image?")) return;
    // Try to remove the storage object too (best-effort)
    try {
      const url = new URL(img.image_url);
      const marker = "/product-images/";
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const path = decodeURIComponent(url.pathname.slice(idx + marker.length));
        await supabase.storage.from("product-images").remove([path]);
      }
    } catch {/* ignore */}

    const { error } = await supabase.from("product_images").delete().eq("id", img.id);
    if (error) {
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Image removed" });
    fetchImages();
  };

  const reorder = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const a = images[idx], b = images[target];
    const updates = [
      supabase.from("product_images").update({ display_order: b.display_order }).eq("id", a.id),
      supabase.from("product_images").update({ display_order: a.display_order }).eq("id", b.id),
    ];
    await Promise.all(updates);
    fetchImages();
  };

  const makePrimary = async (idx: number) => {
    if (idx === 0) return;
    const reordered = [images[idx], ...images.filter((_, i) => i !== idx)];
    await Promise.all(
      reordered.map((img, i) =>
        supabase.from("product_images").update({ display_order: i }).eq("id", img.id)
      )
    );
    fetchImages();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="font-body text-xs text-foreground block">Product Images</label>
          <p className="font-body text-xs text-muted-foreground">
            First image is the primary. Up to 5MB each. JPG, PNG, WebP.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Add images"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading images...</div>
      ) : images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          <ImageIcon className="w-8 h-8" />
          <p className="font-body text-sm">Click to upload product images</p>
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border bg-muted">
              <img src={img.image_url} alt={img.alt_text || ""} className="w-full h-32 object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                  <Star className="w-3 h-3" /> Primary
                </span>
              )}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => reorder(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 rounded bg-background border border-border disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(i, 1)}
                    disabled={i === images.length - 1}
                    className="p-1.5 rounded bg-background border border-border disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(i)}
                    className="text-[10px] font-accent uppercase tracking-wide px-2 py-1 rounded bg-secondary text-secondary-foreground"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(img)}
                  className="p-1.5 rounded bg-destructive text-destructive-foreground"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
