import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ruler } from "lucide-react";

const SIZE_GUIDES: Record<string, { headers: string[]; rows: string[][] }> = {
  "Apparel & Wearables": {
    headers: ["Size", "Chest (in)", "Waist (in)", "Hips (in)", "Length (in)"],
    rows: [
      ["XS", "32–34", "26–28", "34–36", "26"],
      ["S", "34–36", "28–30", "36–38", "27"],
      ["M", "38–40", "32–34", "40–42", "28"],
      ["L", "42–44", "36–38", "44–46", "29"],
      ["XL", "46–48", "40–42", "48–50", "30"],
      ["XXL", "50–52", "44–46", "52–54", "31"],
    ],
  },
  "Footwear": {
    headers: ["Size (NG)", "EU", "US", "UK", "Foot Length (cm)"],
    rows: [
      ["38", "38", "6", "5", "24"],
      ["39", "39", "6.5", "5.5", "24.5"],
      ["40", "40", "7", "6", "25"],
      ["41", "41", "8", "7", "25.5"],
      ["42", "42", "9", "8", "26"],
      ["43", "43", "10", "9", "27"],
      ["44", "44", "11", "10", "28"],
      ["45", "45", "12", "11", "29"],
    ],
  },
  "Accessories & Jewelry": {
    headers: ["Size", "Wrist (cm)", "Neck (cm)", "Ring (mm)"],
    rows: [
      ["XS", "14–15", "34–36", "14.9"],
      ["S", "15–16", "36–38", "15.7"],
      ["M", "16–17", "38–40", "16.5"],
      ["L", "17–18", "40–42", "17.3"],
      ["XL", "18–20", "42–44", "18.1"],
    ],
  },
  "Bags & Travel": {
    headers: ["Size", "Width (cm)", "Height (cm)", "Depth (cm)", "Strap (cm)"],
    rows: [
      ["Small", "25", "20", "10", "60–120"],
      ["Medium", "35", "28", "12", "60–130"],
      ["Large", "45", "35", "18", "60–140"],
    ],
  },
};

interface SizeGuideProps {
  categoryName?: string;
}

const SizeGuide = ({ categoryName }: SizeGuideProps) => {
  const guide = categoryName ? SIZE_GUIDES[categoryName] : null;
  const allGuides = Object.entries(SIZE_GUIDES);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 font-accent text-xs text-primary hover:underline transition-colors">
          <Ruler className="w-3.5 h-3.5" /> Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogTitle className="font-accent text-lg font-bold text-foreground">
          📏 Size Guide {categoryName ? `— ${categoryName}` : ""}
        </DialogTitle>

        {guide ? (
          <SizeTable headers={guide.headers} rows={guide.rows} />
        ) : (
          <div className="space-y-6">
            {allGuides.map(([cat, data]) => (
              <div key={cat}>
                <h3 className="font-accent text-sm font-bold text-foreground mb-2">{cat}</h3>
                <SizeTable headers={data.headers} rows={data.rows} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-muted">
          <p className="font-body text-xs text-muted-foreground">
            <strong className="text-foreground">How to measure:</strong> Use a flexible tape measure. 
            For chest, wrap around the fullest part. For waist, measure at the narrowest point. 
            For hips, measure at the widest point. If between sizes, go up for comfort.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SizeTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-border">
          {headers.map((h) => (
            <th key={h} className="px-3 py-2 font-accent text-[10px] text-muted-foreground uppercase">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-muted/50">
            {row.map((cell, j) => (
              <td key={j} className={`px-3 py-2 font-body text-sm ${j === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SizeGuide;
