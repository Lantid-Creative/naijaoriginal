import { Badge } from "@/components/ui/badge";

interface SeriesBadgeProps {
  seriesNumber?: number | null;
  seriesYear?: number | null;
  seriesName?: string | null;
  size?: "sm" | "md";
}

const SeriesBadge = ({ seriesNumber, seriesYear, seriesName, size = "sm" }: SeriesBadgeProps) => {
  if (!seriesNumber) return null;

  return (
    <Badge
      variant="outline"
      className={`font-accent tracking-wider uppercase border-primary/30 text-primary bg-primary/5 ${
        size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"
      }`}
    >
      S{seriesNumber} · {seriesYear}
    </Badge>
  );
};

export default SeriesBadge;
