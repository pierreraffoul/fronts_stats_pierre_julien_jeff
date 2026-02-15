import Link from "next/link";
import { Database, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-2xl">⚽</span>
              Football Science
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Prédiction de matchs de football par Intelligence Artificielle.
              Projet universitaire MIAGE.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Navigation</h3>
            <div className="flex flex-col gap-2">
              <Link 
                href="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Accueil
              </Link>
              <Link 
                href="/analytics" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Analytics
              </Link>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Powered by</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                <Zap size={12} />
                Next.js 14
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                <Database size={12} />
                Supabase
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                Tailwind CSS
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                Recharts
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Football Science. Projet MIAGE — Pierre, Julien, Jeff.
          </p>
          <p className="text-xs text-muted-foreground">
            Données issues de la Ligue 1 (2010-2025)
          </p>
        </div>
      </div>
    </footer>
  );
}


