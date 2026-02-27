import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogOut, Shield, Heart, Scale } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Verify", href: "/verify" },
  { label: "Track Order", href: "/track" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        {/* Left nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="font-accent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center Logo */}
        <Link to="/" className="font-accent text-xl font-black text-foreground tracking-tight uppercase">
          Naija Original
        </Link>

        {/* Right nav */}
        <div className="hidden md:flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="font-accent text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}

          {/* Compare */}
          <Link to="/compare" className="relative text-foreground hover:text-primary transition-colors" title="Compare">
            <Scale className="w-5 h-5" />
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground font-accent text-[10px] font-bold flex items-center justify-center">
                {compareCount}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative text-foreground hover:text-primary transition-colors" title="Wishlist">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground font-accent text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative text-foreground hover:text-primary transition-colors" title="Cart">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground font-accent text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/account" className="text-foreground hover:text-primary transition-colors" title="My Account">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2 rounded-full font-accent font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300 uppercase tracking-wide"
            >
              Sign In / Up
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <Link to="/wishlist" className="relative text-foreground">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground font-accent text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative text-foreground">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground font-accent text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)} className="text-foreground">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setOpen(false)}
              className="block font-accent text-base text-foreground hover:text-primary transition-colors uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
          <Link to="/compare" onClick={() => setOpen(false)} className="block font-accent text-base text-foreground hover:text-primary uppercase tracking-wide">
            Compare {compareCount > 0 && `(${compareCount})`}
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className="block font-accent text-base text-primary uppercase">
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <>
              <Link to="/account" onClick={() => setOpen(false)} className="block font-accent text-base text-foreground">My Account</Link>
              <Link to="/orders" onClick={() => setOpen(false)} className="block font-accent text-base text-foreground">My Orders</Link>
              <button onClick={() => { signOut(); setOpen(false); }} className="block font-accent text-base text-muted-foreground">Sign Out</button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="inline-flex px-5 py-2.5 rounded-full font-accent font-semibold text-sm bg-secondary text-secondary-foreground uppercase tracking-wide"
            >
              Sign In / Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
