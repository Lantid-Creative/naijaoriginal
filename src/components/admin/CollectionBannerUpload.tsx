import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface CollectionBannerUploadProps {
  collectionId: string;
  currentBannerUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export default function CollectionBannerUpload({ 
  collectionId, 
  currentBannerUrl, 
  onUploadComplete 
}: CollectionBannerUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentBannerUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${collectionId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError, data } = await supabase.storage
        .from("collection-banners")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("collection-banners")
        .getPublicUrl(filePath);

      // Update collection with new banner URL
      const { error: updateError } = await supabase
        .from("product_collections")
        .update({ banner_image_url: publicUrl })
        .eq("id", collectionId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Banner uploaded! 🎉",
        description: "Collection banner updated successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload banner",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveBanner = async () => {
    if (!confirm("Remove this banner image?")) return;

    try {
      // Update collection to remove banner URL
      const { error } = await supabase
        .from("product_collections")
        .update({ banner_image_url: null })
        .eq("id", collectionId);

      if (error) throw error;

      setPreviewUrl(null);
      onUploadComplete("");

      toast({
        title: "Banner removed",
        description: "Collection banner has been removed",
      });
    } catch (error: any) {
      console.error("Remove error:", error);
      toast({
        title: "Failed to remove banner",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-body text-xs text-foreground block mb-2">
          Collection Banner Image
        </label>
        <p className="font-body text-xs text-muted-foreground mb-3">
          Upload a banner image for this collection (max 5MB, JPG/PNG/WebP)
        </p>
      </div>

      {previewUrl ? (
        <div className="relative group">
          <img 
            src={previewUrl} 
            alt="Collection banner preview" 
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Change
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveBanner}
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-body text-sm">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-12 h-12" />
              <p className="font-body text-sm font-semibold">Click to upload banner</p>
              <p className="font-body text-xs">JPG, PNG or WebP (max 5MB)</p>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
