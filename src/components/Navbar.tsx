import { useState } from "react";
import { Menu, X, QrCode } from "lucide-react";

const navLinks = [
  { label: "Shop", href: "#shop" },
  { label: "Verify", href: "#verify" },
  { label: "Community", href: "#community" },
  { label: "Our Story", href: "#story" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="font-display text-xl font-black naija-gradient-text">
          🇳🇬 NAIJA ORIGINALS
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#verify"
            className="px-5 py-2 rounded-lg font-body font-semibold text-sm bg-primary text-primary-foreground hover:bg-naija-green-glow transition-all duration-300 flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Scan & Verify
          </a>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block font-body text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#verify"
            onClick={() => setOpen(false)}
            className="inline-flex px-5 py-2.5 rounded-lg font-body font-semibold text-sm bg-primary text-primary-foreground items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Scan & Verify
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
