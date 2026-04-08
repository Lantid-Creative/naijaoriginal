import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatNaira } from "@/lib/format";
import { Plus, X, Pencil, Save, Layers, ChevronDown, ChevronUp, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  series_number: number | null;
  series_year: number | null;
  series_name: string | null;
  product_line: string | null;
  product_categories?: { name: string } | null;
}

interface SeriesGroup {
  key: string; // e.g. "Series 1 — Genesis|2025"
  series_number: number;
  series_year: number;
  series_name: string;
  products: Product[];
}

const SeriesManager = ({ products: allProducts, onUpdate }: { products: any[]; onUpdate: () => void }) => {
  const { toast } = useToast();
  const [view, setView] = useState<"series" | "assign">("series");
  
  // Series creation/edit
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState<string | null>(null);
  const [seriesForm, setSeriesForm] = useState({
    series_number: "",
    series_year: String(new Date().getFullYear()),
    series_name: "",
  });

  // Assign mode
  const [selectedSeries, setSelectedSeries] = useState<SeriesGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  // Bulk assign
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [assignTarget, setAssignTarget] = useState<{ number: number; year: number; name: string } | null>(null);

  const products = allProducts as Product[];

  // Group products by series
  const seriesGroups: SeriesGroup[] = (() => {
    const map = new Map<string, SeriesGroup>();
    products.forEach((p) => {
      const num = p.series_number || 1;
      const year = p.series_year || 2025;
      const name = p.series_name || `Series ${num}`;
      const key = `${num}|${year}|${name}`;
      if (!map.has(key)) {
        map.set(key, { key, series_number: num, series_year: year, series_name: name, products: [] });
      }
      map.get(key)!.products.push(p);
    });
    return Array.from(map.values()).sort((a, b) => b.series_number - a.series_number || b.series_year - a.series_year);
  })();

  // Get unique product lines
  const productLines = [...new Set(products.map(p => p.product_line).filter(Boolean))] as string[];

  const handleCreateSeries = () => {
    const num = parseInt(seriesForm.series_number);
    const year = parseInt(seriesForm.series_year);
    const name = seriesForm.series_name.trim();
    if (!num || !year || !name) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    // Check if series already exists
    const exists = seriesGroups.find(g => g.series_number === num && g.series_year === year);
    if (exists && !editingSeries) {
      toast({ title: "This series number + year already exists", variant: "destructive" });
      return;
    }
    setAssignTarget({ number: num, year, name });
    setView("assign");
    setShowCreateForm(false);
    toast({ title: `Series "${name}" ready — select products to assign` });
  };

  const handleEditSeriesName = async (group: SeriesGroup, newName: string) => {
    const productIds = group.products.map(p => p.id);
    const { error } = await supabase
      .from("products")
      .update({ series_name: newName } as any)
      .in("id", productIds);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Series name updated! ✅" });
      setEditingSeries(null);
      onUpdate();
    }
  };

  const handleAssignProducts = async () => {
    if (!assignTarget || bulkSelected.size === 0) {
      toast({ title: "Select at least one product", variant: "destructive" });
      return;
    }
    const ids = Array.from(bulkSelected);
    const { error } = await supabase
      .from("products")
      .update({
        series_number: assignTarget.number,
        series_year: assignTarget.year,
        series_name: assignTarget.name,
      } as any)
      .in("id", ids);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${ids.length} product(s) assigned to ${assignTarget.name}! ✅` });
      setBulkSelected(new Set());
      setAssignTarget(null);
      setView("series");
      onUpdate();
    }
  };

  const handleUpdateProductLine = async (productId: string, productLine: string) => {
    const { error } = await supabase
      .from("products")
      .update({ product_line: productLine || null } as any)
      .eq("id", productId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product line updated ✅" });
      onUpdate();
    }
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const toggleBulkSelect = (id: string) => {
    const next = new Set(bulkSelected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setBulkSelected(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(bulkSelected);
    filteredProducts.forEach(p => next.add(p.id));
    setBulkSelected(next);
  };

  const deselectAll = () => setBulkSelected(new Set());

  // Quick assign: move a product to a different series
  const handleQuickAssign = async (productId: string, targetGroup: SeriesGroup) => {
    const { error } = await supabase
      .from("products")
      .update({
        series_number: targetGroup.series_number,
        series_year: targetGroup.series_year,
        series_name: targetGroup.series_name,
      } as any)
      .eq("id", productId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product moved! ✅" });
      onUpdate();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-accent text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Series Manager
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Create series, assign products, and manage product evolution.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "series" ? "default" : "outline"}
            size="sm"
            onClick={() => { setView("series"); setAssignTarget(null); }}
            className="font-body"
          >
            View Series
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowCreateForm(true); setSeriesForm({ series_number: String((seriesGroups[0]?.series_number || 0) + 1), series_year: String(new Date().getFullYear()), series_name: "" }); }}
            className="font-body gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New Series
          </Button>
        </div>
      </div>

      {/* Create Series Form */}
      {showCreateForm && (
        <div className="naija-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-accent text-base font-bold text-foreground">Create New Series</h3>
            <button onClick={() => setShowCreateForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="font-body text-xs text-foreground block mb-1">Series Number *</label>
              <Input
                type="number"
                min="1"
                value={seriesForm.series_number}
                onChange={(e) => setSeriesForm({ ...seriesForm, series_number: e.target.value })}
                placeholder="2"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="font-body text-xs text-foreground block mb-1">Year *</label>
              <Input
                type="number"
                min="2024"
                value={seriesForm.series_year}
                onChange={(e) => setSeriesForm({ ...seriesForm, series_year: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="font-body text-xs text-foreground block mb-1">Series Name *</label>
              <Input
                value={seriesForm.series_name}
                onChange={(e) => setSeriesForm({ ...seriesForm, series_name: e.target.value })}
                placeholder="Series 2 — Evolution"
                className="bg-background border-border"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleCreateSeries} className="font-body gap-1" size="sm">
              <Plus className="w-3.5 h-3.5" /> Create & Assign Products
            </Button>
            <Button variant="ghost" onClick={() => setShowCreateForm(false)} size="sm" className="font-body">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Assign Mode */}
      {view === "assign" && assignTarget && (
        <div className="mb-6">
          <div className="naija-card p-4 mb-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-accent text-sm font-bold text-foreground">
                  Assigning to: <span className="text-primary">{assignTarget.name}</span> ({assignTarget.year})
                </p>
                <p className="font-body text-xs text-muted-foreground">{bulkSelected.size} product(s) selected</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAssignProducts} disabled={bulkSelected.size === 0} className="font-body gap-1">
                  <Save className="w-3.5 h-3.5" /> Assign {bulkSelected.size} Products
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setAssignTarget(null); setView("series"); setBulkSelected(new Set()); }} className="font-body">
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Search + Select All */}
          <div className="flex gap-3 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-background border-border max-w-sm"
            />
            <Button variant="outline" size="sm" onClick={selectAllFiltered} className="font-body text-xs whitespace-nowrap">
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll} className="font-body text-xs whitespace-nowrap">
              Clear
            </Button>
          </div>

          {/* Product list for assignment */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleBulkSelect(p.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  bulkSelected.has(p.id)
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  bulkSelected.has(p.id) ? "border-primary bg-primary" : "border-border"
                }`}>
                  {bulkSelected.has(p.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    S{p.series_number || 1} · {p.series_year || 2025} · {formatNaira(p.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Series List View */}
      {view === "series" && (
        <div className="space-y-4">
          {seriesGroups.length === 0 ? (
            <div className="naija-card p-12 text-center">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-muted-foreground">No series found. Create your first series above.</p>
            </div>
          ) : (
            seriesGroups.map((group) => {
              const isExpanded = expandedSeries === group.key;
              const isEditing = editingSeries === group.key;

              return (
                <div key={group.key} className="naija-card overflow-hidden">
                  {/* Series Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedSeries(isExpanded ? null : group.key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-accent text-sm font-bold text-primary">
                        S{group.series_number}
                      </div>
                      <div>
                        {isEditing ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              defaultValue={group.series_name}
                              className="h-8 text-sm bg-background border-border w-64"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditSeriesName(group, (e.target as HTMLInputElement).value);
                                if (e.key === "Escape") setEditingSeries(null);
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                const input = document.querySelector(`input[defaultValue="${group.series_name}"]`) as HTMLInputElement;
                                if (input) handleEditSeriesName(group, input.value);
                              }}
                              className="p-1 rounded hover:bg-primary/10 text-primary"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-accent text-sm font-bold text-foreground">{group.series_name}</h3>
                            <p className="font-body text-xs text-muted-foreground">{group.series_year} · {group.products.length} products</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingSeries(isEditing ? null : group.key); }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Rename series"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignTarget({ number: group.series_number, year: group.series_year, name: group.series_name });
                          setView("assign");
                        }}
                        className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Assign products to this series"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Product List */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/30">
                              <th className="text-left p-3 font-body text-xs text-muted-foreground uppercase">Product</th>
                              <th className="text-left p-3 font-body text-xs text-muted-foreground uppercase hidden sm:table-cell">Category</th>
                              <th className="text-left p-3 font-body text-xs text-muted-foreground uppercase hidden md:table-cell">Product Line</th>
                              <th className="text-left p-3 font-body text-xs text-muted-foreground uppercase">Price</th>
                              <th className="text-left p-3 font-body text-xs text-muted-foreground uppercase hidden sm:table-cell">Status</th>
                              <th className="text-right p-3 font-body text-xs text-muted-foreground uppercase">Move</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {group.products.map((p) => (
                              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                <td className="p-3">
                                  <p className="font-body text-sm font-semibold text-foreground">{p.name}</p>
                                </td>
                                <td className="p-3 font-body text-xs text-muted-foreground hidden sm:table-cell">
                                  {(p.product_categories as any)?.name || "—"}
                                </td>
                                <td className="p-3 hidden md:table-cell">
                                  <select
                                    value={p.product_line || ""}
                                    onChange={(e) => handleUpdateProductLine(p.id, e.target.value)}
                                    className="text-xs rounded border border-border bg-background px-2 py-1 font-body text-foreground max-w-[140px]"
                                  >
                                    <option value="">No line</option>
                                    {productLines.map((line) => (
                                      <option key={line} value={line}>{line}</option>
                                    ))}
                                    <option value="__new">+ New line...</option>
                                  </select>
                                </td>
                                <td className="p-3 font-body text-sm text-foreground">{formatNaira(p.price)}</td>
                                <td className="p-3 hidden sm:table-cell">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-accent ${p.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                    {p.is_active ? "Active" : "Off"}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {seriesGroups.length > 1 && (
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        const target = seriesGroups.find(g => g.key === e.target.value);
                                        if (target) handleQuickAssign(p.id, target);
                                      }}
                                      className="text-xs rounded border border-border bg-background px-2 py-1 font-body text-foreground"
                                    >
                                      <option value="">Move to...</option>
                                      {seriesGroups.filter(g => g.key !== group.key).map((g) => (
                                        <option key={g.key} value={g.key}>S{g.series_number} — {g.series_year}</option>
                                      ))}
                                    </select>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SeriesManager;
