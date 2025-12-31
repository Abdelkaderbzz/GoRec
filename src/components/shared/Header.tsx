import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export function Header() {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="ScreenRec" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg gradient-text">ScreenRec</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t.nav.home}
          </Link>
          <Link to="/recorder" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t.nav.recorder}
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === "en" ? "العربية" : "English"}
          </Button>

          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Link to="/recorder">{t.nav.getStarted}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
