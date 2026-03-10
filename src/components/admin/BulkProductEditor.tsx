import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Pencil, AlertTriangle } from "lucide-react";

interface BulkProductEditorProps {
  products: any[];
  onUpdate: () => void;
}

const BulkProductEditor = ({ products, onUpdate }: BulkProductEditorProps) => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, { price?: string; stock?: string; is_active?: boolean }>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const setEdit = (id: string, field: string, value: any) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const applyBulkPrice = (type: "set" | "increase" | "decrease", value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const next = { ...edits };
    for (const id of selected) {
      const product = products.find((p) => p.id === id);
      if (!product) continue;
      let newPrice: number;
      if (type === "set") newPrice = num;
      else if (type === "increase") newPrice = product.price * (1 + num / 100);
      else newPrice = product.price * (1 - num / 100);
      next[id] = { ...next[id], price: String(Math.round(newPrice)) };
    }
    setEdits(next);
  };

  const applyBulkStock = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return;
    const next = { ...edits };
    for (const id of selected) {
      next[id] = { ...next[id], stock: String(num) };
    }
    setEdits(next);
  };

  const applyBulkStatus = (active: boolean) => {
    const next = { ...edits };
    for (const id of selected) {
      next[id] = { ...next[id], is_active: active };
    }
    setEdits(next);
  };

  const hasEdits = Object.keys(edits).length > 0;
  const editCount = Object.keys(edits).length;

  const handleSave = async () => {
    setSaving(true);
    let success = 0;
    let errors = 0;

    for (const [id, changes] of Object.entries(edits)) {
      const payload: any = {};
      if (changes.price !== undefined) payload.price = parseFloat(changes.price);
      if (changes.stock !== undefined) payload.stock = parseInt(changes.stock);
      if (changes.is_active !== undefined) payload.is_active = changes.is_active;

      if (Object.keys(payload).length === 0) continue;

      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) errors++;
      else success++;
    }

    if (errors > 0) {
      toast({ title: `Updated ${success}, failed ${errors}`, variant: "destructive" });
    } else {
      toast({ title: `${success} product${success !== 1 ? "s" : ""} updated! ✅` });
    }
    setEdits({});
    setSelected(new Set());
    setSaving(false);
    onUpdate();
  };

  const [bulkAction, setBulkAction] = useState<"price_set" | "price_up" | "price_down" | "stock" | "activate" | "deactivate" | null>(null);
  const [bulkValue, setBulkValue] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">Bulk Editor ✏️</h2>
        <div className="flex items-center gap-2">
          {hasEdits && (
            <>
              <span className="font-accent text-xs text-muted-foreground">{editCount} product{editCount !== 1 ? "s" : ""} modified</span>
              <Button onClick={() => setEdits({})} variant="ghost" size="sm" className="font-body gap-1">
                <X className="w-3.5 h-3.5" /> Discard
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm" className="font-body gap-1">
                <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save All"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search & Bulk Actions */}
      <div className="naija-card p-4 space-y-3">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background border-border max-w-sm"
        />

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-accent text-xs text-primary font-bold">{selected.size} selected:</span>

            <select
              value={bulkAction || ""}
              onChange={(e) => { setBulkAction(e.target.value as any); setBulkValue(""); }}
              className="h-8 rounded-md border border-border bg-background px-2 font-body text-xs text-foreground"
            >
              <option value="">Choose action...</option>
              <option value="price_set">Set Price</option>
              <option value="price_up">Increase Price %</option>
              <option value="price_down">Decrease Price %</option>
              <option value="stock">Set Stock</option>
              <option value="activate">Activate All</option>
              <option value="deactivate">Deactivate All</option>
            </select>

            {bulkAction && !["activate", "deactivate"].includes(bulkAction) && (
              <Input
                type="number"
                placeholder={bulkAction === "stock" ? "Stock qty" : bulkAction === "price_set" ? "Price (₦)" : "Percentage"}
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="w-32 h-8 bg-background border-border text-xs"
              />
            )}

            <Button
              size="sm"
              className="h-8 font-body text-xs"
              disabled={!bulkAction || (!["activate", "deactivate"].includes(bulkAction || "") && !bulkValue)}
              onClick={() => {
                if (bulkAction === "price_set") applyBulkPrice("set", bulkValue);
                else if (bulkAction === "price_up") applyBulkPrice("increase", bulkValue);
                else if (bulkAction === "price_down") applyBulkPrice("decrease", bulkValue);
                else if (bulkAction === "stock") applyBulkStock(bulkValue);
                else if (bulkAction === "activate") applyBulkStatus(true);
                else if (bulkAction === "deactivate") applyBulkStatus(false);
                setBulkAction(null);
                setBulkValue("");
              }}
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="naija-card overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="p-3 w-10">
                  <Checkbox
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onCheckedChange={selectAll}
                  />
                </th>
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase">Product</th>
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase">Category</th>
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase w-32">Price</th>
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase w-24">Stock</th>
                <th className="text-left p-3 font-accent text-xs text-muted-foreground uppercase w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const edit = edits[p.id];
                const isEdited = !!edit;
                return (
                  <tr key={p.id} className={`border-b border-border/50 hover:bg-muted/50 ${isEdited ? "bg-primary/5" : ""}`}>
                    <td className="p-3">
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-body text-sm text-foreground">{p.name}</span>
                        {p.stock <= 5 && p.stock > 0 && <AlertTriangle className="w-3.5 h-3.5 text-secondary" />}
                        {p.stock === 0 && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                        {isEdited && <Pencil className="w-3 h-3 text-primary" />}
                      </div>
                    </td>
                    <td className="p-3 font-body text-sm text-muted-foreground">
                      {(p as any).product_categories?.name || "—"}
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={edit?.price ?? String(p.price)}
                        onChange={(e) => setEdit(p.id, "price", e.target.value)}
                        className="h-8 w-28 bg-background border-border text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={edit?.stock ?? String(p.stock)}
                        onChange={(e) => setEdit(p.id, "stock", e.target.value)}
                        className="h-8 w-20 bg-background border-border text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Checkbox
                        checked={edit?.is_active ?? p.is_active}
                        onCheckedChange={(checked) => setEdit(p.id, "is_active", !!checked)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BulkProductEditor;
