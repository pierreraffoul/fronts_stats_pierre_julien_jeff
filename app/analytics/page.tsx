import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MatchHistoryRow } from "@/types/database";
import { GlobalStats } from "@/components/charts/GlobalStats";

export const revalidate = 3600; // Revalider toutes les heures

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();

  // Récupérer toutes les données nécessaires en une seule requête optimisée
  const { data, error } = await supabase
    .from("match_history")
    .select("saison, date, fthg, ftag, ftr, cote_dom_clean, cote_ext_clean, hs, hst")
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
            Dashboard d'Analyse Globale
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Analyse de l'ensemble des données (2010-2025) — {matches.length.toLocaleString()} matchs analysés
          </p>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
            <p className="font-semibold">Pourquoi cette analyse ?</p>
            <p className="mt-1">
              Ce dashboard révèle les tendances et les incertitudes du football moderne. 
              Les patterns existent, mais la complexité et la non-linéarité des données 
              justifient l'utilisation d'une IA prédictive pour capturer ce que les 
              statistiques simples ne peuvent pas révéler.
            </p>
          </div>
        </header>

        {matches.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Aucune donnée disponible.
          </div>
        ) : (
          <GlobalStats matches={matches} />
        )}
      </div>
    </main>
  );
}

