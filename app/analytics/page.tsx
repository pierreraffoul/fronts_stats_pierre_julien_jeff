import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MatchHistoryRow } from "@/types/database";
import {
  calculateBettingROI,
  calculateHalfTimeComebacks,
  calculateEfficiencyData,
  calculateHomeAwayComparison,
} from "@/lib/analytics-utils";
import { BettingROIChart } from "@/components/charts/BettingROIChart";
import { HalfTimeFullTimeChart } from "@/components/charts/HalfTimeFullTimeChart";
import { EfficiencyScatterPlot } from "@/components/charts/EfficiencyScatterPlot";
import { HomeAwayRadar } from "@/components/charts/HomeAwayRadar";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 3600; // Revalider toutes les heures

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();

  // Récupérer toutes les données nécessaires en une seule requête optimisée
  const { data, error } = await supabase
    .from("match_history")
    .select(
      "saison, date, hometeam, awayteam, fthg, ftag, ftr, cote_dom_clean, cote_ext_clean, hs, hst, htr, hthg, htag"
    )
    .order("date", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
        <div className="mx-auto max-w-5xl p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
            <p className="font-semibold">Erreur lors du chargement des données</p>
            <p className="mt-1">{error.message}</p>
          </div>
        </div>
      </main>
    );
  }

  const matches = (data ?? []) as MatchHistoryRow[];

  // Calculer toutes les données nécessaires
  const roiData = calculateBettingROI(matches);
  const comebackData = calculateHalfTimeComebacks(matches);
  const efficiencyData = calculateEfficiencyData(matches);
  const homeAwayData = calculateHomeAwayComparison(matches);

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-5xl p-6 pb-16">
        {/* En-tête */}
        <header className="mb-16 mt-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Analytics : Pourquoi l'IA ?
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Une analyse scientifique en 4 chapitres qui démontre pourquoi le football
            est trop complexe pour être prédit par de simples règles humaines.
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            {matches.length.toLocaleString()} matchs analysés sur l'ensemble de l'historique
          </p>
        </header>

        {/* CHAPITRE 1 : L'Illusion du Favori */}
        <section className="mb-20 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Chapitre 1 : L'Illusion du Favori
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Les bookmakers se trompent souvent. Suivre aveuglément la cote la plus basse
              fait perdre de l'argent. Ce graphique analyse l'ensemble de l'historique en
              pariant systématiquement 10€ sur chaque favori (l'équipe avec la cote la plus
              basse), regroupé par tranches de cotes. Les barres vertes indiquent un profit,
              les rouges une perte. Même les favoris avec des cotes très basses (1.0-1.3)
              peuvent faire perdre de l'argent sur le long terme.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <BettingROIChart data={roiData.chartData} globalStats={roiData.globalStats} />
          </div>

          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-2xl">🤖</div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                    Pourquoi l'IA ?
                  </h3>
                  <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-300">
                    L'humain parie sur le favori par sécurité psychologique. L'IA, elle,
                    cherchera la "Value" mathématique là où la foule ne regarde pas. Elle
                    apprendra à identifier les situations où la probabilité réelle de victoire
                    diffère significativement de la cote proposée, créant des opportunités
                    de profit là où l'intuition humaine échoue.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CHAPITRE 2 : La "Remontada" est rare mais prévisible */}
        <section className="mb-20 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Chapitre 2 : La "Remontada" est rare mais prévisible
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Le scénario du match n'est pas linéaire. La mi-temps est un tournant psychologique
              majeur. Ce graphique analyse tous les matchs où l'équipe à domicile perdait à la
              mi-temps et montre la répartition du résultat final. Combien parviennent à renverser
              la situation ? La réponse révèle la complexité du mental collectif.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <HalfTimeFullTimeChart
              data={comebackData.chartData}
              stats={comebackData.stats}
            />
          </div>

          <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900/40 dark:bg-purple-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-2xl">🧠</div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-200">
                    Pourquoi l'IA ?
                  </h3>
                  <p className="text-sm leading-relaxed text-purple-800 dark:text-purple-300">
                    Une règle simple dirait "S'ils perdent à la mi-temps, ils ont perdu". Notre
                    IA utilisera des variables contextuelles comme la "Forme récente", la qualité
                    de l'adversaire, ou les patterns historiques de résilience pour prédire ces
                    retournements improbables. Elle apprendra à détecter les signaux faibles que
                    l'analyse humaine traditionnelle ignore.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CHAPITRE 3 : Dominer n'est pas Gagner */}
        <section className="mb-20 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Chapitre 3 : Dominer n'est pas Gagner (L'Efficacité)
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Avoir la possession et tirer 20 fois ne sert à rien sans réalisme. C'est le piège
              classique du parieur qui se base sur les statistiques de domination. Ce nuage de
              points montre la corrélation entre les tirs cadrés et les buts marqués. La dispersion
              révèle qu'il n'y a pas de relation linéaire parfaite : certaines équipes sont
              "chirurgicales" (peu de tirs, beaucoup de buts), d'autres sont "stériles".
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <EfficiencyScatterPlot
              scatterData={efficiencyData.scatterData}
              trendLine={efficiencyData.trendLine}
              sampleSize={efficiencyData.sampleSize}
              totalMatches={efficiencyData.totalMatches}
            />
          </div>

          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-2xl">🎯</div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                    Pourquoi l'IA ?
                  </h3>
                  <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                    L'IA ne se laissera pas berner par le volume de jeu. Elle apprendra à identifier
                    les équipes "Chirurgicales" (peu de tirs, beaucoup de buts) vs les équipes
                    "Stériles" (beaucoup de tirs, peu de buts). En analysant des patterns non-linéaires
                    et des interactions complexes entre l'attaque, la défense adverse, et le contexte
                    du match, elle pourra prédire l'efficacité réelle plutôt que de se fier aux
                    statistiques brutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CHAPITRE 4 : La Forteresse Domicile */}
        <section className="mb-20 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Chapitre 4 : La Forteresse Domicile
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              L'avantage du terrain existe, mais il est inégal selon les équipes. Ce graphique radar
              compare trois types d'équipes : une très forte à domicile, une équilibrée, et une faible
              à domicile. Chaque axe représente une métrique différente (victoires domicile/extérieur,
              buts marqués). La forme révèle l'identité tactique et psychologique de chaque équipe.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <HomeAwayRadar
              radarData={homeAwayData.radarData}
              teamLabels={homeAwayData.teamLabels}
            />
            {homeAwayData.teamLabels.length > 0 && (
              <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {homeAwayData.teamLabels.map((label, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-medium">
                      {label.label} ({label.name}):
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {label.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-2xl">🏠</div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Pourquoi l'IA ?
                  </h3>
                  <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-300">
                    Le modèle pondérera dynamiquement l'avantage du terrain selon l'identité de
                    l'équipe, au lieu d'appliquer un bonus fixe arbitraire. Il apprendra que certaines
                    équipes sont véritablement "fortes à domicile" (facteurs psychologiques, support
                    des fans, confort tactique) tandis que d'autres sont plus performantes à l'extérieur
                    (contre-attaque, pression réduite). Cette nuance contextuelle est impossible à
                    capturer avec des règles simples.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Conclusion */}
        <section className="mt-24 rounded-xl border-2 border-zinc-300 bg-gradient-to-br from-zinc-50 to-zinc-100 p-8 dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-950">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">
            Conclusion : La Complexité Justifie l'IA
          </h2>
          <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            Ces quatre chapitres démontrent que le football moderne est un système complexe,
            non-linéaire, où les règles simples échouent. Les patterns existent, mais ils sont
            enfouis dans des interactions multi-dimensionnelles que seule une intelligence artificielle
            peut apprendre à modéliser. Notre IA de prédiction ne remplacera pas l'intuition humaine,
            elle la complétera en révélant des insights que l'analyse traditionnelle ne peut pas voir.
          </p>
        </section>
      </div>
    </main>
  );
}
