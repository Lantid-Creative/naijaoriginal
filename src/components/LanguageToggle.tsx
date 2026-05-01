import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

interface Props {
  variant?: "default" | "compact";
}

const LanguageToggle = ({ variant = "default" }: Props) => {
  const { lang, toggleLang } = useLanguage();

  if (variant === "compact") {
    return (
      <button
        onClick={toggleLang}
        title={lang === "en" ? "Switch to Pidgin" : "Switch to English"}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-border text-foreground hover:bg-muted transition-colors font-accent text-[11px] font-bold uppercase tracking-wider"
      >
        <Languages className="w-3.5 h-3.5" />
        {lang === "en" ? "EN" : "PCM"}
      </button>
    );
  }

  return (
    <button
      onClick={toggleLang}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-muted transition-colors font-accent text-xs font-semibold uppercase tracking-wider"
      title={lang === "en" ? "Switch to Naija Pidgin" : "Switch to English"}
    >
      <Languages className="w-3.5 h-3.5" />
      <span className={lang === "en" ? "text-primary" : "text-muted-foreground"}>EN</span>
      <span className="text-muted-foreground/50">/</span>
      <span className={lang === "pcm" ? "text-primary" : "text-muted-foreground"}>PIDGIN</span>
    </button>
  );
};

export default LanguageToggle;
