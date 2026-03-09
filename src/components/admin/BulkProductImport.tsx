import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, Plus } from "lucide-react";
import { formatNaira } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  stock: number;
}

interface BulkProductImportProps {
  collectionId: string;
  availableProducts: Product[];
  onProductsAdded: () => void;
}

export default function BulkProductImport({
  collectionId,
  availableProducts,
  onProductsAdded,
}: BulkProductImportProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleBulkAdd = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No products selected",
        description: "Select at least one product to add",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);

    try {
      // Get current max display order
      const { data: existingItems } = await supabase
        .from("product_collection_items")
        .select("display_order")
        .eq("collection_id", collectionId)
        .order("display_order", { ascending: false })
        .limit(1);

      const startOrder = existingItems && existingItems.length > 0 
        ? existingItems[0].display_order + 1 
        : 0;

      // Create items to insert
      const items = Array.from(selectedProducts).map((productId, index) => ({
        collection_id: collectionId,
        product_id: productId,
        display_order: startOrder + index,
      }));

      const { error } = await supabase
        .from("product_collection_items")
        .insert(items);

      if (error) throw error;

      toast({
        title: `${selectedProducts.size} products added! 🎉`,
        description: "Products have been added to the collection",
      });

      setSelectedProducts(new Set());
      onProductsAdded();
    } catch (error: any) {
      console.error("Bulk add error:", error);
      toast({
        title: "Failed to add products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={selectAll}
          className="whitespace-nowrap"
        >
          {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0
            ? "Deselect All"
            : "Select All"}
        </Button>
      </div>

      {selectedProducts.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="font-body text-sm text-foreground">
            <span className="font-bold">{selectedProducts.size}</span> product{selectedProducts.size !== 1 ? 's' : ''} selected
          </p>
          <Button
            onClick={handleBulkAdd}
            disabled={adding}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {adding ? "Adding..." : "Add Selected"}
          </Button>
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <p className="font-body text-sm text-muted-foreground">
              {searchQuery ? "No products found" : "All products are already in this collection"}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isSelected = selectedProducts.has(product.id);
            return (
              <button
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-foreground truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-body text-xs text-primary">
                      {formatNaira(Number(product.price))}
                    </p>
                    <span className="text-muted-foreground">•</span>
                    <p className="font-body text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
