import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/format";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  product_id: string;
  display_order: number;
  products: {
    name: string;
    price: number;
    slug: string;
  };
}

interface DraggableProductListProps {
  collectionId: string;
  products: Product[];
  onProductsReordered: () => void;
  onRemoveProduct: (itemId: string) => void;
}

export default function DraggableProductList({
  collectionId,
  products: initialProducts,
  onProductsReordered,
  onRemoveProduct,
}: DraggableProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newProducts = [...products];
    const draggedItem = newProducts[draggedIndex];
    
    // Remove from old position
    newProducts.splice(draggedIndex, 1);
    // Insert at new position
    newProducts.splice(index, 0, draggedItem);
    
    setProducts(newProducts);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    
    setSaving(true);
    
    try {
      // Update display_order for all products
      const updates = products.map((product, index) => ({
        id: product.id,
        display_order: index,
      }));

      // Update each product's display order
      for (const update of updates) {
        const { error } = await supabase
          .from("product_collection_items")
          .update({ display_order: update.display_order })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast({
        title: "Order updated! ✅",
        description: "Product order has been saved",
      });

      onProductsReordered();
    } catch (error: any) {
      console.error("Reorder error:", error);
      toast({
        title: "Failed to save order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setDraggedIndex(null);
    }
  };

  // Update products when prop changes
  if (initialProducts !== products && draggedIndex === null) {
    setProducts(initialProducts);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
        <p className="font-body text-sm text-muted-foreground">No products yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-xs text-muted-foreground">
          Drag products to reorder them
        </p>
        {saving && (
          <p className="font-body text-xs text-primary">Saving...</p>
        )}
      </div>
      
      {products.map((item, index) => (
        <div
          key={item.id}
          draggable={!saving}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move ${
            draggedIndex === index
              ? "bg-primary/10 border-primary shadow-lg scale-105"
              : "bg-muted/50 border-border hover:border-primary/50 hover:bg-muted"
          }`}
        >
          <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold text-foreground truncate">
              {item.products.name}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              {formatNaira(Number(item.products.price))} • Position {index + 1}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveProduct(item.id)}
            disabled={saving}
            className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
