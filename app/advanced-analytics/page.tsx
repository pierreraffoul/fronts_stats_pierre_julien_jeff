import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MatchHistoryRow } from "@/types/database";
import { AdvancedAnalyticsDashboard } from "@/components/charts/AdvancedAnalyticsDashboard";

export const revalidate = 3600; // Revalider toutes les heures

export default async function AdvancedAnalyticsPage() {
  const supabase = createSupabaseServerClient();

  // Récupérer toutes les données nécessaires en une seule requête optimisée
  // Inclure htr si disponible dans la base de données
  const { data, error } = await supabase
    .from("match_history")
    .select("saison, date, hometeam, awayteam, fthg, ftag, ftr, cote_dom_clean, cote_ext_clean, hs, hst, htr")
    .order("date", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
        <div className="mx-auto max-w-7xl p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            <p className="font-semibold">Erreur lors du chargement des données</p>
            <p className="mt-1">{error.message}</p>
          </div>
        </div>
      </main>
    );
  }

  const matches = (data ?? []) as MatchHistoryRow[];

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-7xl p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Advanced Analytics
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Analyse avancée des inefficacités du marché et de la complexité du jeu — {matches.length.toLocaleString()} matchs analysés
          </p>
          <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-200">
            <p className="font-semibold">Objectif de ce dashboard</p>
            <p className="mt-1">
              Ce dashboard met en évidence les patterns non-linéaires et les inefficacités du marché 
              qui justifient l'utilisation d'une IA prédictive. Contrairement aux statistiques basiques, 
              ces analyses révèlent la complexité du football moderne et les opportunités que seule 
              une modélisation avancée peut détecter.
            </p>
          </div>
        </header>

        {matches.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Aucune donnée disponible.
          </div>
        ) : (
          <AdvancedAnalyticsDashboard matches={matches} />
        )}
      </div>
    </main>
  );
}

