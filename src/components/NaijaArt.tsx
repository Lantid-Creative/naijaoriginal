/**
 * NaijaArt — Pure CSS/SVG geometric illustrations.
 * VEXO-minimal: green / white / black, bold shapes, Ankara-flavored motifs.
 * Replaces AI-generated photos across the site.
 */

type Variant = "hero" | "community" | "category";

interface NaijaArtProps {
  variant?: Variant;
  label?: string;
  className?: string;
}

const NaijaArt = ({ variant = "hero", label, className = "" }: NaijaArtProps) => {
  if (variant === "hero") return <HeroArt label={label} className={className} />;
  if (variant === "community") return <CommunityArt label={label} className={className} />;
  return <CategoryArt label={label} className={className} />;
};

/* ---------- HERO ---------- */
const HeroArt = ({ label, className }: { label?: string; className: string }) => (
  <div className={`relative w-full h-full overflow-hidden bg-secondary ${className}`}>
    {/* gradient field */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-naija-green-glow to-secondary" />

    {/* Ankara-inspired SVG pattern */}
    <svg
      className="absolute inset-0 w-full h-full opacity-25"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="ankara-hero" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="28" fill="none" stroke="hsl(var(--naija-cream))" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="14" fill="none" stroke="hsl(var(--naija-cream))" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="3" fill="hsl(var(--naija-cream))" />
          <path d="M0 40 H80 M40 0 V80" stroke="hsl(var(--naija-cream))" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="600" fill="url(#ankara-hero)" />
    </svg>

    {/* Big geometric NG mark */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="w-48 h-48 md:w-72 md:h-72 rounded-full border-[6px] border-naija-cream/80 flex items-center justify-center">
          <span className="font-accent font-black text-naija-cream text-7xl md:text-9xl tracking-tighter leading-none">
            NG
          </span>
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-naija-cream flex items-center justify-center">
          <span className="font-accent font-black text-primary text-xl md:text-2xl">🇳🇬</span>
        </div>
      </div>
    </div>

    {/* Corner label */}
    {label && (
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 px-3 py-1.5 rounded-full bg-naija-cream/90 backdrop-blur-sm">
        <span className="font-accent text-xs font-bold text-secondary uppercase tracking-wider">{label}</span>
      </div>
    )}

    {/* Diagonal accent stripes */}
    <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48">
      <div className="absolute top-6 right-0 w-40 h-1.5 bg-naija-cream/60 rotate-45 origin-right" />
      <div className="absolute top-12 right-0 w-32 h-1.5 bg-naija-cream/40 rotate-45 origin-right" />
    </div>
  </div>
);

/* ---------- COMMUNITY ---------- */
const CommunityArt = ({ label, className }: { label?: string; className: string }) => (
  <div className={`relative w-full h-full overflow-hidden bg-primary ${className}`}>
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="ankara-comm" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M30 5 L55 30 L30 55 L5 30 Z"
            fill="none"
            stroke="hsl(var(--naija-cream))"
            strokeWidth="1.2"
          />
          <circle cx="30" cy="30" r="4" fill="hsl(var(--naija-cream))" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#ankara-comm)" />
    </svg>

    {/* Cluster of "people" dots — community */}
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-naija-cream flex items-center justify-center font-accent font-black text-primary text-lg md:text-xl shadow-lg"
            style={{ transform: `translateY(${(i % 3) * 8}px)` }}
          >
            {["N", "A", "I", "J", "A", "•", "1", "✦", "9"][i]}
          </div>
        ))}
      </div>
    </div>

    {label && (
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
        <span className="font-accent text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
    )}
  </div>
);

/* ---------- CATEGORY (banner background) ---------- */
const CategoryArt = ({ label, className }: { label?: string; className: string }) => (
  <div className={`relative w-full h-full overflow-hidden bg-secondary ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-primary/40 to-secondary" />
    <svg
      className="absolute inset-0 w-full h-full opacity-30"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="ankara-cat" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect x="10" y="10" width="30" height="30" fill="none" stroke="hsl(var(--naija-cream))" strokeWidth="1" />
          <rect x="20" y="20" width="10" height="10" fill="hsl(var(--naija-cream))" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#ankara-cat)" />
    </svg>
    {label && (
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-naija-cream/90 backdrop-blur-sm">
        <span className="font-accent text-[10px] font-bold text-secondary uppercase tracking-wider">{label}</span>
      </div>
    )}
  </div>
);

export default NaijaArt;
