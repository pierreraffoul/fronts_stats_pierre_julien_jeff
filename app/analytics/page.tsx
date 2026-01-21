import { createSupabaseServerClient } from "@/lib/supabase/server";
import { 
  calculateBettingROI, 
  calculateHalfTimeComebacks, 
  calculateEfficiencyData, 
  calculateHomeAwayComparison,
  enrichMatchesWithTrainingData 
} from "@/lib/analytics-utils";
import { BettingROIChart } from "@/components/charts/BettingROIChart";
import { HalfTimeFullTimeChart } from "@/components/charts/HalfTimeFullTimeChart";
import { EfficiencyScatterPlot } from "@/components/charts/EfficiencyScatterPlot";
import { HomeAwayRadar } from "@/components/charts/HomeAwayRadar";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, BrainCircuit, Target, ShieldAlert } from "lucide-react";

export const revalidate = 3600;

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();

  // 1. Fetching optimisé
  const [historyRes, trainingRes] = await Promise.all([
    supabase.from("match_history").select("*").order("date", { ascending: true }),
    supabase.from("ai_training_data").select("*").order("date", { ascending: true })
  ]);

  const matches = (historyRes.data || []) as any[];
  const training = (trainingRes.data || []) as any[];
  
  // 2. Fusion et Calculs
  const enriched = enrichMatchesWithTrainingData(matches, training);
  
  const roiData = calculateBettingROI(enriched);
  const comebackData = calculateHalfTimeComebacks(enriched);
  const efficiencyData = calculateEfficiencyData(enriched);
  const radarData = calculateHomeAwayComparison(enriched);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* HEADER : L'Accroche */}
        <header className="mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <BrainCircuit size={16} /> Projet Data Science & IA
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Pourquoi l'Humain ne suffit plus.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Nous avons analysé <strong>{matches.length} matchs</strong> historiques. 
            Le verdict est clair : le football est un système chaotique où les règles simples échouent.
            Voici les 4 preuves mathématiques qui justifient la création de notre IA.
          </p>
        </header>

        {/* CHAPITRE 1 : ROI Betting */}
        <section className="mb-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 text-xl font-bold">1</span>
              La Faillite du "Bon Sens"
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              On pense souvent que parier sur le favori (la plus petite cote) est une stratégie sûre. 
              C'est faux.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Ce graphique montre le résultat d'une simulation où l'on parie 10€ sur chaque favori depuis 2010.
              Résultat ? <strong>On perd de l'argent presque partout</strong>. Même à 1.30, le risque est sous-estimé par le marché.
            </p>
            
            <Card className="bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
              <CardContent className="p-4 flex gap-4">
                <TrendingUp className="text-indigo-600 w-8 h-8 shrink-0" />
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200">La solution IA</h4>
                  <p className="text-sm text-indigo-800 dark:text-indigo-300 mt-1">
                    Notre modèle ne cherche pas le vainqueur probable, il cherche l'erreur du bookmaker. 
                    Il détecte quand la cote de 1.50 devrait être en réalité de 1.80, évitant ainsi les "pièges à favoris".
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Profit/Perte par type de cote</h3>
            <BettingROIChart data={roiData.chartData} />
          </div>
        </section>

        {/* CHAPITRE 2 : Remontada */}
        <section className="mb-32 grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div className="order-2 md:order-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
             <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Devenir d'une équipe menée à la mi-temps</h3>
             <HalfTimeFullTimeChart data={comebackData.chartData} stats={comebackData.stats} />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600 text-xl font-bold">2</span>
              L'Inertie du Match
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              "Tout est possible au foot" ? Pas vraiment. 
              Quand une équipe perd à la mi-temps à domicile, elle ne gagne que dans <strong>{comebackData.stats.winRate}%</strong> des cas.
            </p>
            
            <Card className="bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="text-orange-600 w-8 h-8 shrink-0" />
                <div>
                  <h4 className="font-bold text-orange-900 dark:text-orange-200">La solution IA</h4>
                  <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
                    L'IA utilise cette inertie statistique comme une "Prior Probability". 
                    Elle ne prédira une remontada que si des signaux forts (Forme {'>'} 12/15, Attaque {'>'} 2.5 buts) sont présents pour contredire la statistique de base.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CHAPITRE 3 : Efficacité */}
        <section className="mb-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 text-xl font-bold">3</span>
              Dominer n'est pas Gagner
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Regardez ce nuage de points. Si le foot était logique, tous les points seraient alignés : "Plus je tire, plus je marque".
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Au lieu de ça, c'est le chaos. On voit des matchs avec 15 tirs et 0 but, et d'autres avec 3 tirs et 3 buts. 
              L'analyse humaine ("Ils ont dominé, ils méritaient") est biaisée par le volume.
            </p>
            
            <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
              <CardContent className="p-4 flex gap-4">
                <Target className="text-emerald-600 w-8 h-8 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">La solution IA</h4>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">
                    Notre modèle apprend la "Non-Linéarité". Il sait distinguer une domination stérile (tirs de loin, possession passive) d'une domination dangereuse, grâce aux features d'efficacité (`goals_per_shot`) que nous avons ingéniées.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Tirs Cadrés vs Buts (Échantillon aléatoire)</h3>
            <EfficiencyScatterPlot data={efficiencyData.scatterData} trendLine={efficiencyData.trendLine} />
          </div>
        </section>

        {/* CHAPITRE 4 : Radar */}
        <section className="mb-20 grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div className="order-2 md:order-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
             <HomeAwayRadar data={radarData.radarData} />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-600 text-xl font-bold">4</span>
              L'Identité "Bipolaire"
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Toutes les équipes ne sont pas égales face au domicile/extérieur. 
              Ce radar compare 3 profils types. Le PSG (en bleu) est fort partout. Metz (en rose) s'effondre dès qu'il quitte son stade.
            </p>
            
            <Card className="bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800">
              <CardContent className="p-4 flex gap-4">
                <ShieldAlert className="text-purple-600 w-8 h-8 shrink-0" />
                <div>
                  <h4 className="font-bold text-purple-900 dark:text-purple-200">La solution IA</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">
                    Plutôt que d'appliquer un "avantage domicile" fixe (+10%), notre IA adapte sa pondération selon l'identité de l'équipe. Elle sait que pour Metz, jouer à domicile est vital, alors que pour le PSG, ça change peu de choses.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </main>
  );
}
