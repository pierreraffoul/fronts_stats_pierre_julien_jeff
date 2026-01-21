import { MatchAnalysisCard } from "@/components/match-analysis/MatchAnalysisCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AITrainingDataRow, MatchHistoryRow } from "@/types/database";
import { GlobalStats } from "@/components/charts/GlobalStats";

export const revalidate = 60;

function pgQuote(value: string) {
  // PostgREST: on quote pour gérer espaces/accents et éviter les virgules non échappées.
  const v = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${v}"`;
}

async function getH2H(
  hometeam: string,
  awayteam: string,
): Promise<MatchHistoryRow[]> {
  const supabase = createSupabaseServerClient();
  const h = pgQuote(hometeam);
  const a = pgQuote(awayteam);
  const or = `and(hometeam.eq.${h},awayteam.eq.${a}),and(hometeam.eq.${a},awayteam.eq.${h})`;

  const { data, error } = await supabase
    .from("match_history")
    .select("date,hometeam,awayteam,fthg,ftag")
    .or(or)
    .order("date", { ascending: false })
    .limit(3);

  if (error || !data) return [];
  return data as MatchHistoryRow[];
}

export default async function Home() {
  const supabase = createSupabaseServerClient();

  // Récupérer les données pour les graphiques globaux
  const { data: matchHistoryData, error: matchHistoryError } = await supabase
    .from("match_history")
    .select("saison, date, fthg, ftag, ftr, cote_dom_clean, cote_ext_clean, hs, hst")
    .order("date", { ascending: true });

  // Récupérer les données pour les matchs individuels
  const { data, error } = await supabase
    .from("ai_training_data")
    .select(
      [
        "date",
        "hometeam",
        "awayteam",
        "cote_dom_clean",
        "cote_nul_clean",
        "cote_ext_clean",
        "home_forme_pts_last5",
        "home_moy_buts_marques_last5",
        "home_moy_buts_encaisse_last5",
        "away_forme_pts_last5",
        "away_moy_buts_marques_last5",
        "away_moy_buts_encaisse_last5",
      ].join(","),
    )
    .order("date", { ascending: false })
    .limit(10);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
          Erreur lors du chargement des matchs (Supabase): {error.message}
        </div>
      </main>
    );
  }

  const matches = ((data ?? []) as unknown) as AITrainingDataRow[];
  const matchHistory = ((matchHistoryData ?? []) as unknown) as MatchHistoryRow[];

  const h2hList = await Promise.all(
    matches.map((m) => getH2H(m.hometeam, m.awayteam)),
  );

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-7xl p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard d'Analyse Globale
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Analyse de l'ensemble des données (2010-2025) — {matchHistory.length.toLocaleString()} matchs analysés
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

        {/* Section Graphiques Globaux */}
        {matchHistoryError ? (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            <p className="font-semibold">Erreur lors du chargement des données d'analyse</p>
            <p className="mt-1">{matchHistoryError.message}</p>
          </div>
        ) : matchHistory.length === 0 ? (
          <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Aucune donnée d'analyse disponible.
          </div>
        ) : (
          <div className="mb-12">
            <GlobalStats matches={matchHistory} />
          </div>
        )}

        {/* Section Matchs Individuels */}
        <div className="mt-12">
          <header className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Analyse des Matchs Prédictifs
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              10 derniers matchs (pré-match) issus de <code>ai_training_data</code>.
            </p>
          </header>

          {matches.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              Aucun match trouvé.
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map((match, idx) => (
                <MatchAnalysisCard
                  key={`${match.date}-${match.hometeam}-${match.awayteam}-${idx}`}
                  match={match}
                  h2h={h2hList[idx] ?? []}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
