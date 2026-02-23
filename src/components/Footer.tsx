import { Link } from "react-router-dom";
import { MapPin, Mail, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 bg-card">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="font-accent text-xl font-black text-foreground mb-3 block uppercase tracking-tight">
              Naija Originals
            </Link>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Authenticated Culture. Wearable Pride.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-accent font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5 font-body text-sm text-muted-foreground">
              {[
                { label: "All Products", to: "/shop" },
                { label: "Limited Drops", to: "/shop?category=limited" },
                { label: "Verify Product", to: "/verify" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-accent font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5 font-body text-sm text-muted-foreground">
              {[
                { label: "Sign In", to: "/auth" },
                { label: "My Orders", to: "/orders" },
                { label: "Cart", to: "/cart" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-accent font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-3 font-body text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                info@naija-originals.com
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Lagos • London • Houston
              </div>
            </div>
          </div>
        </div>

        <div className="naija-section-divider mb-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-accent text-xs text-muted-foreground">
            © 2026 Naija Originals. All rights reserved.
          </p>
          <div className="flex gap-6 font-accent text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
