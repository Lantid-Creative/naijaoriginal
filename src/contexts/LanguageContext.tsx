import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "en" | "pcm";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary — Pidgin (pcm) overrides; falls back to key/English.
const dict: Record<string, { en: string; pcm: string }> = {
  "nav.shop": { en: "Shop", pcm: "Shop" },
  "nav.collections": { en: "Collections", pcm: "Collections" },
  "nav.series": { en: "Series", pcm: "Series" },
  "nav.more": { en: "More", pcm: "More" },
  "nav.verify": { en: "Verify Product", pcm: "Confirm Original" },
  "nav.track": { en: "Track Order", pcm: "Track Your Order" },
  "nav.custom": { en: "Custom Orders", pcm: "Custom Order" },
  "nav.help": { en: "Help Center", pcm: "Help Wey You Need" },
  "nav.signin": { en: "Sign In / Up", pcm: "Sign In / Sign Up" },
  "nav.account": { en: "My Account", pcm: "My Account" },
  "nav.orders": { en: "My Orders", pcm: "My Orders" },
  "nav.signout": { en: "Sign Out", pcm: "Comot" },
  "hero.tag1": { en: "//CULTURE", pcm: "//OUR CULTURE" },
  "hero.tag2": { en: "//AUTHENTICATED\nFOR LIFE.", pcm: "//ORIGINAL\nFOREVER." },
  "hero.left.l1": { en: "where", pcm: "where" },
  "hero.left.l2": { en: "— style", pcm: "— style" },
  "hero.right.l1": { en: "lives", pcm: "dey" },
  "hero.right.l2": { en: "— now.", pcm: "— now." },
  "hero.desc": {
    en: "Wearable Naija culture wey you fit prove. Curated drops, QR-verified, every piece numbered.",
    pcm: "Naija culture wey you fit wear & prove say na original. Curated drops, QR-verified, every piece numbered.",
  },
  "hero.shop": { en: "Shop now", pcm: "Shop now now" },
  "hero.verify": { en: "Verify product", pcm: "Confirm Original" },
  "hero.diaspora": { en: "Diaspora we inspire", pcm: "Naija people we dey inspire" },
  "pd.addToCart": { en: "Add to Cart", pcm: "Put for Cart" },
  "pd.adding": { en: "Adding...", pcm: "Dey add..." },
  "pd.outOfStock": { en: "Out of Stock", pcm: "E Don Finish" },
  "pd.size": { en: "Size", pcm: "Size" },
  "pd.color": { en: "Color", pcm: "Color" },
  "pd.quantity": { en: "Quantity", pcm: "How Many" },
  "pd.inStock": { en: "in stock", pcm: "dey stock" },
  "pd.qrAuth": { en: "QR Authenticated — Every piece is a verified original 🔐", pcm: "QR Authenticated — Every piece na verified original 🔐" },
  "pd.added": { en: "Added to cart! 🛒", pcm: "E don enter cart! 🛒" },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("naija_lang") as Lang) || "en";
  });

  useEffect(() => {
    localStorage.setItem("naija_lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((p) => (p === "en" ? "pcm" : "en"));
  const t = (key: string) => dict[key]?.[lang] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
};
