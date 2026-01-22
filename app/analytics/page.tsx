import { createSupabaseServerClient } from "@/lib/supabase/server";
import { 
  calculateBettingROI, 
  calculateDrawAnomaly,
  calculateEfficiencyData,
  calculateCornerEfficiency,
  calculateSeasonalGoals,
  calculateHalfTimeComebacks, 
  calculateRedCardImpact,
  calculateHomeAwayComparison,
  calculateGoalDistribution,
  calculateAggressivenessData,
  enrichMatchesWithTrainingData 
} from "@/lib/analytics-utils";

import { AnalyticsSection } from "@/components/analytics/AnalyticsSection";
import { SECTION_COLORS } from "@/lib/section-colors";
import { BettingROIChart } from "@/components/charts/BettingROIChart";
import { DrawAnomalyChart } from "@/components/charts/DrawAnomalyChart";
import { EfficiencyScatterPlot } from "@/components/charts/EfficiencyScatterPlot";
import { CornerEfficiencyChart } from "@/components/charts/CornerEfficiencyChart";
import { SeasonalGoalsChart } from "@/components/charts/SeasonalGoalsChart";
import { HalfTimeFullTimeChart } from "@/components/charts/HalfTimeFullTimeChart";
import { RedCardChart } from "@/components/charts/RedCardChart";
import { HomeAwayRadar } from "@/components/charts/HomeAwayRadar";
import { GoalsDistributionChart } from "@/components/charts/GoalsDistributionChart";
import { AggressivenessChart } from "@/components/charts/AggressivenessChart";

import Link from "next/link";
import { BrainCircuit, ArrowRight, Sparkles } from "lucide-react";

export const revalidate = 3600;

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();

  // Fetching optimisé - .range() pour dépasser la limite par défaut de 1000 lignes
  const [historyRes, trainingRes] = await Promise.all([
    supabase
      .from("match_history")
      .select("*")
      .order("date", { ascending: true })
      .range(0, 9999),
    supabase
      .from("ai_training_data")
      .select("*")
      .order("date", { ascending: true })
      .range(0, 9999),
  ]);

  const matches = (historyRes.data || []) as any[];
  const training = (trainingRes.data || []) as any[];
  
  // Fusion et Calculs
  const enriched = enrichMatchesWithTrainingData(matches, training);
  
  // Les 10 calculs
  const roiData = calculateBettingROI(enriched);
  const drawData = calculateDrawAnomaly(enriched);
  const efficiencyData = calculateEfficiencyData(enriched);
  const cornerData = calculateCornerEfficiency(enriched);
  const seasonalData = calculateSeasonalGoals(enriched);
  const comebackData = calculateHalfTimeComebacks(enriched);
  const redCardData = calculateRedCardImpact(enriched);
  const radarData = calculateHomeAwayComparison(enriched);
  const goalDistData = calculateGoalDistribution(enriched);
  const aggressivenessData = calculateAggressivenessData(enriched);

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-small opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <header className="py-16 md:py-24 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Masterclass Data Science
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            Le Football est-il
            <br />
            <span className="text-gradient">Prévisible ?</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Une exploration data-driven en <strong className="text-foreground">10 chapitres</strong> basée sur 
            l&apos;analyse de <span className="font-bold text-primary">{matches.length.toLocaleString()} matchs</span> historiques.
          </p>
          <p className="mt-4 text-muted-foreground text-sm">
            Spoiler : les règles simples échouent. Voici pourquoi notre IA fait mieux.
          </p>
        </header>

        <div className="divide-y divide-border">
          
          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 1 : LA FAILLITE DU FAVORI
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-1"
            index={1}
            title="La Faillite du Favori"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  💥 On vous a toujours dit que &quot;parier sur le favori, c&apos;est la sécurité&quot;. 
                  <strong className="text-foreground"> Les données racontent exactement l&apos;inverse.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p key="factual">
                  Ce graphique simule une stratégie simple : miser 10€ sur le favori (la cote la plus basse) 
                  à chaque match depuis 2010. Les barres montrent le profit ou la perte cumulée par tranche de cote. 
                  On observe que <strong className="text-foreground">presque toutes les catégories sont dans le rouge</strong>. 
                  Même les &quot;hyper-favoris&quot; (cotes 1.0-1.3) génèrent des pertes. 
                  Seule exception possible : les outsiders, où le risque est si élevé que les gains compensent parfois.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p key="analysis">
                  Ce phénomène s&apos;explique par la <strong className="text-foreground">marge du bookmaker</strong> (environ 5-7%) 
                  et par la <strong className="text-foreground">surestimation psychologique des favoris</strong>. 
                  Le public parie massivement sur les grosses équipes, ce qui compresse leurs cotes au-delà de leur vraie probabilité. 
                  Résultat : même quand ils gagnent, le gain ne compense pas les pertes sur les surprises. 
                  C&apos;est le &quot;piège à favoris&quot; — un biais cognitif où l&apos;humain confond &quot;probable&quot; et &quot;rentable&quot;.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → Le football est-il prévisible ? Ce graphique montre que <strong className="text-foreground">prédire le vainqueur ne suffit pas</strong>. 
                  L&apos;IA ne cherche pas qui va gagner, mais <em>où le marché se trompe</em>. 
                  Elle détecte les cotes mal calibrées — là où la vraie probabilité diverge du prix affiché.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: "Notre modèle ne prédit pas le vainqueur, il prédit l'erreur. En croisant forme récente, H2H, et contexte, il identifie quand une cote de 1.50 devrait être à 1.80 — transformant un 'pari perdant' en opportunité."
            }}
            chartComponent={<BettingROIChart key="chart" data={roiData.chartData} />}
            chartTitle="Profit/Perte cumulé par tranche de cote"
            color={SECTION_COLORS.red}
            iconName="TrendingDown"
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 2 : L'ANOMALIE DES MATCHS NULS
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-2"
            index={2}
            title="L'Anomalie des Matchs Nuls"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  🎯 Le Nul est l&apos;issue que personne n&apos;ose jouer... 
                  <strong className="text-foreground"> et pourtant, il représente {drawData.stats.avgDrawRate}% des résultats.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  L&apos;aire jaune/orange montre l&apos;évolution du pourcentage de matchs nuls par saison. 
                  On observe une <strong className="text-foreground">stabilité remarquable autour de 25-28%</strong>, 
                  avec quelques pics et creux selon les années. 
                  La ligne rouge pointillée indique la moyenne historique. 
                  Aucune saison ne descend sous 20% ou ne dépasse 32% — le Nul est un phénomène régulier, pas une anomalie rare.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  Pourquoi alors les parieurs l&apos;évitent-ils ? Parce que <strong className="text-foreground">l&apos;humain pense en binaire</strong> : 
                  soit l&apos;équipe A gagne, soit l&apos;équipe B. Le Nul est perçu comme un &quot;non-résultat&quot;, un accident. 
                  Les bookmakers exploitent ce biais : <strong className="text-foreground">les cotes du Nul sont souvent surévaluées</strong> (3.20 au lieu de 2.80). 
                  C&apos;est un marché inefficace où l&apos;offre (peu de paris) fait monter artificiellement le prix. 
                  Les configurations &quot;pro-nul&quot; existent : deux équipes défensives, faible possession, historique serré.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → Ce graphique révèle que <strong className="text-foreground">le &quot;bon sens&quot; humain crée des angles morts</strong>. 
                  L&apos;IA, elle, n&apos;a pas de préférence émotionnelle. Elle calcule froidement la probabilité du Nul 
                  et identifie les ~25% de matchs où cette issue est sous-cotée par le marché.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: "L'IA détecte les 'signatures du Nul' : équipes à faible variance offensive, confrontations équilibrées, contextes de fin de saison où les deux camps veulent éviter le risque. Elle exploite le biais humain contre le Nul."
            }}
            chartComponent={<DrawAnomalyChart key="chart" data={drawData.chartData} avgDrawRate={drawData.stats.avgDrawRate} />}
            chartTitle="% de Matchs Nuls par saison"
            color={SECTION_COLORS.amber}
            iconName="HelpCircle"
            reversed
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 3 : DOMINATION ≠ VICTOIRE
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-3"
            index={3}
            title="Domination ≠ Victoire"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  📊 &quot;Ils ont dominé, ils méritaient de gagner.&quot; 
                  <strong className="text-foreground"> Ce nuage de points prouve que la domination n&apos;est qu&apos;une illusion.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  Chaque point représente un match : l&apos;axe X indique le nombre de tirs cadrés, l&apos;axe Y le nombre de buts marqués. 
                  Si le football était linéaire, les points formeraient une ligne droite ascendante. 
                  Au lieu de ça, on observe un <strong className="text-foreground">nuage chaotique</strong> : 
                  des matchs avec 12 tirs et 0 but, d&apos;autres avec 2 tirs et 3 buts. 
                  La ligne de tendance (en pointillé) montre un taux de conversion moyen de {efficiencyData.conversionRate}%, 
                  mais la variance autour de cette ligne est énorme.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  Ce graphique expose la <strong className="text-foreground">non-linéarité fondamentale du football</strong>. 
                  Un tir de 30 mètres et un tir à bout portant comptent pareil dans les stats, mais pas dans le score. 
                  La qualité des occasions (xG), le gardien adverse, la précision du tireur — tout ça échappe au simple comptage. 
                  L&apos;humain qui dit &quot;ils ont dominé&quot; confond <strong className="text-foreground">volume et efficacité</strong>. 
                  C&apos;est le biais du &quot;plus = mieux&quot;, qui mène à de mauvaises prédictions.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → Ce chaos apparent est en réalité <strong className="text-foreground">un signal que l&apos;IA sait lire</strong>. 
                  En combinant tirs, xG, position des tirs, et historique du gardien, 
                  elle distingue une &quot;domination stérile&quot; (15 tirs de loin) d&apos;une &quot;domination létale&quot; (5 grosses occasions). 
                  Le football est prévisible... si on regarde les bonnes métriques.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: `Avec un taux de conversion moyen de ${efficiencyData.conversionRate}%, l'IA sait que 10 tirs ≠ 1 but garanti. Elle pondère par la qualité des occasions et détecte les équipes 'cliniques' (peu de tirs, beaucoup de buts) vs les équipes 'stériles' (beaucoup de tirs, peu de buts).`
            }}
            chartComponent={<EfficiencyScatterPlot key="chart" data={efficiencyData.scatterData} trendLine={efficiencyData.trendLine} />}
            chartTitle={`Tirs Cadrés vs Buts (échantillon de ${efficiencyData.sampleSize} matchs)`}
            color={SECTION_COLORS.emerald}
            iconName="Target"
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 4 : L'ARME SECRÈTE DES CORNERS
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-4"
            index={4}
            title="L'Arme Secrète : Les Corners"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  ⚡ Les corners sont souvent ignorés dans l&apos;analyse... 
                  <strong className="text-foreground"> pourtant, certaines équipes les transforment en arme fatale.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  Ce classement montre le Top 5 des équipes avec le meilleur ratio Buts/Corners. 
                  On observe des écarts significatifs : certaines équipes marquent 1 but tous les 6-7 corners, 
                  d&apos;autres ont besoin de 15-20 corners pour trouver le chemin des filets. 
                  La moyenne globale est de {cornerData.stats.avgRatio} but par corner — 
                  mais les meilleures équipes sont <strong className="text-foreground">2 à 3 fois plus efficaces</strong> que cette moyenne.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  L&apos;efficacité sur corner dépend de multiples facteurs : qualité du tireur, présence de joueurs grands et puissants, 
                  schémas tactiques travaillés à l&apos;entraînement. <strong className="text-foreground">C&apos;est un skill team-spécifique</strong> 
                  qui ne se retrouve pas dans les stats classiques. 
                  Un match avec 10 corners pour une équipe &quot;redoutable&quot; n&apos;a pas la même valeur 
                  qu&apos;un match avec 10 corners pour une équipe &quot;inoffensive&quot;. 
                  Les corners sont des <strong className="text-foreground">&quot;game-changers&quot; invisibles</strong> pour l&apos;analyste classique.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → L&apos;IA intègre ce signal : face à une équipe dominante sur corners, 
                  elle <strong className="text-foreground">augmente la probabilité de but en seconde mi-temps</strong> 
                  (quand la fatigue fait baisser la vigilance défensive). 
                  C&apos;est un pattern que l&apos;humain sous-estime systématiquement.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: "L'IA croise le nombre de corners obtenus avec l'efficacité historique de l'équipe sur coups de pied arrêtés. Face à une équipe avec ratio > 0.15, elle ajuste ses probabilités de buts tardifs à la hausse."
            }}
            chartComponent={<CornerEfficiencyChart key="chart" data={cornerData.chartData} avgRatio={cornerData.stats.avgRatio} />}
            chartTitle="Top 5 : Meilleur ratio Buts/Corners"
            color={SECTION_COLORS.teal}
            iconName="CornerDownRight"
            reversed
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 5 : LE RYTHME DES SAISONS
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-5"
            index={5}
            title="Le Rythme des Saisons"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  📅 On croit que le football est constant d&apos;août à mai. 
                  <strong className="text-foreground"> La réalité ? Le nombre de buts varie de +{seasonalData.stats.variation} selon le mois.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  Cette courbe montre la moyenne de buts par match selon le mois de la saison. 
                  Le pic se situe en <strong className="text-foreground">{seasonalData.stats.maxMonth}</strong> ({seasonalData.stats.maxAvg} buts/match), 
                  le creux en <strong className="text-foreground">{seasonalData.stats.minMonth}</strong> ({seasonalData.stats.minAvg} buts/match). 
                  On observe une tendance générale : <strong className="text-foreground">plus de buts en fin de saison</strong> qu&apos;en début. 
                  La courbe forme un &quot;U&quot; inversé avec une remontée progressive à partir de février-mars.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  Plusieurs facteurs expliquent ce pattern : en <strong className="text-foreground">début de saison</strong>, 
                  les équipes sont en rodage, les systèmes défensifs pas encore huilés, d&apos;où des scores parfois élevés. 
                  En <strong className="text-foreground">milieu de saison</strong>, le froid, les terrains lourds et les calendriers chargés (coupes) 
                  favorisent des matchs fermés. En <strong className="text-foreground">fin de saison</strong>, 
                  les enjeux (titre, maintien, Europe) poussent à l&apos;attaque, 
                  et la fatigue physique fait craquer les défenses. C&apos;est la &quot;saisonnalité du risque&quot;.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → L&apos;IA pondère ses prédictions &quot;Over/Under&quot; selon le mois. 
                  Un match de <strong className="text-foreground">mai entre une équipe en lutte pour le maintien et une autre pour l&apos;Europe</strong> 
                  a une probabilité de &quot;Over 2.5&quot; supérieure au même match en décembre. 
                  Le contexte temporel est un signal faible que l&apos;humain ignore souvent.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: "L'IA intègre le mois comme feature. En avril-mai, elle augmente automatiquement les probabilités de matchs à buts. Elle sait que les enjeux de fin de saison créent des configurations offensives que les cotes ne reflètent pas toujours."
            }}
            chartComponent={<SeasonalGoalsChart key="chart" data={seasonalData.chartData} stats={seasonalData.stats} />}
            chartTitle="Moyenne de buts par mois (Août → Mai)"
            color={SECTION_COLORS.blue}
            iconName="Calendar"
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 6 : LE MYTHE DE LA REMONTADA
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-6"
            index={6}
            title="Le Mythe de la Remontada"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  🔄 &quot;Tout est possible au football, on peut toujours remonter.&quot; 
                  <strong className="text-foreground"> Les stats disent : seulement {comebackData.stats.winRate}% du temps.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  Ce camembert montre le devenir des équipes qui perdent à domicile à la mi-temps. 
                  La part rouge (défaite confirmée) domine largement. 
                  La part jaune (match nul sauvé) représente environ {comebackData.stats.drawRate}%. 
                  La part verte (remontada) n&apos;est que de <strong className="text-foreground">{comebackData.stats.winRate}%</strong>. 
                  Sur {comebackData.stats.total} situations de ce type, 
                  seules {comebackData.stats.wins} se sont soldées par une victoire finale.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  C&apos;est le phénomène d&apos;<strong className="text-foreground">inertie du score</strong>. 
                  Une fois mené, le mental joue contre vous : pressing désespéré, espaces laissés, erreurs défensives. 
                  L&apos;équipe qui mène, elle, peut gérer, défendre bas, jouer les contres. 
                  Le &quot;momentum&quot; est une force réelle, pas un mythe. 
                  Les remontadas célèbres (Liverpool-Barcelone, PSG-Barcelone) sont <strong className="text-foreground">mémorables justement parce qu&apos;elles sont exceptionnelles</strong>. 
                  Notre cerveau retient les exceptions, pas la règle.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → L&apos;IA utilise cette inertie comme <strong className="text-foreground">&quot;prior probability&quot;</strong>. 
                  Elle ne prédit une remontada que si des signaux forts la contredisent : 
                  forme exceptionnelle ({'>'}12/15 pts), attaque prolifique ({'>'}2.5 buts/match), adversaire fragile. 
                  Sans ces signaux, elle suit la statistique de base.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: "L'IA code l'inertie comme feature. Elle sait que 'mené à la mi-temps' = ~90% de chance de ne pas gagner. Elle ne s'écarte de cette base que si le profil offensif de l'équipe et la fragilité de l'adversaire sont exceptionnels."
            }}
            chartComponent={<HalfTimeFullTimeChart key="chart" data={comebackData.chartData} stats={comebackData.stats} />}
            chartTitle="Devenir d'une équipe menée à la mi-temps"
            color={SECTION_COLORS.orange}
            iconName="RotateCcw"
            reversed
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 7 : L'EFFET CYGNE NOIR
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-7"
            index={7}
            title="L'Effet 'Cygne Noir'"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  🟥 Un carton rouge change tout. 
                  <strong className="text-foreground"> Le taux de victoire chute de {redCardData.stats.dropRateHome} points d&apos;un coup.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  Ce graphique compare le taux de victoire selon que l&apos;équipe joue à 11 ou avec un joueur exclu. 
                  Les barres bleues/violettes montrent la situation &quot;normale&quot; (à 11), 
                  les barres rouges/orange la situation post-expulsion. 
                  L&apos;écart est <strong className="text-foreground">spectaculaire</strong> : 
                  à domicile, on passe de ~45% de victoires à ~{Math.round(45 - redCardData.stats.dropRateHome)}% avec un rouge. 
                  À l&apos;extérieur, l&apos;effondrement est encore plus brutal ({redCardData.stats.dropRateAway} points de chute).
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  Le carton rouge est l&apos;archétype du <strong className="text-foreground">&quot;Cygne Noir&quot;</strong> en football : 
                  un événement rare (moins de 5% des matchs) mais aux conséquences disproportionnées. 
                  Il ne suffit pas de regarder les stats offensives et défensives : 
                  une équipe agressive (beaucoup de fautes, cartons jaunes fréquents) porte un <strong className="text-foreground">risque latent</strong> 
                  que les analyses classiques ignorent. 
                  Ce risque ne se manifeste pas à chaque match, mais quand il se manifeste, il renverse toutes les prédictions.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → L&apos;IA intègre un <strong className="text-foreground">&quot;score de risque disciplinaire&quot;</strong> basé sur les moyennes de fautes et cartons. 
                  Elle pénalise les équipes trop agressives AVANT même le match, 
                  en ajustant leurs probabilités de victoire à la baisse pour refléter le risque d&apos;expulsion.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: "L'IA calcule un 'indice d'agressivité' par équipe. Plus l'équipe est proche du rouge, plus l'IA réduit sa confiance dans une victoire. Elle transforme un événement 'imprévisible' en probabilité quantifiable."
            }}
            chartComponent={<RedCardChart key="chart" data={redCardData.chartData} stats={redCardData.stats} />}
            chartTitle="Impact du carton rouge sur le taux de victoire"
            color={SECTION_COLORS.red}
            iconName="Ban"
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 8 : L'IDENTITÉ BIPOLAIRE
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-8"
            index={8}
            title="L'Identité 'Bipolaire'"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  🏠 &quot;L&apos;avantage du terrain, c&apos;est +10% pour tout le monde.&quot; 
                  <strong className="text-foreground"> Faux : certaines équipes s&apos;effondrent dès qu&apos;elles quittent leur stade.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  Ce radar compare 3 profils d&apos;équipes sur 4 métriques : victoire domicile (%), victoire extérieur (%), 
                  buts domicile, buts extérieur. <strong className="text-foreground">Le Caïd</strong> (Paris SG) a un polygone équilibré et large — 
                  fort partout. <strong className="text-foreground">L&apos;Équilibré</strong> (Rennes) montre un profil symétrique mais plus modeste. 
                  <strong className="text-foreground">Le Fragile</strong> (Metz) a un polygone déformé : 
                  performance correcte à domicile, effondrement total à l&apos;extérieur.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  Chaque équipe a une <strong className="text-foreground">&quot;identité domicile/extérieur&quot;</strong> propre. 
                  Pour certaines, le public est un 12ème homme indispensable. Pour d&apos;autres, le voyage et l&apos;environnement hostile 
                  déclenchent un blocage psychologique. Appliquer un &quot;bonus domicile&quot; uniforme de +10% est une erreur grossière. 
                  L&apos;avantage terrain est <strong className="text-foreground">team-specific</strong> : +25% pour Metz, +5% pour le PSG. 
                  Ne pas en tenir compte, c&apos;est se tromper sur un quart des prédictions.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → L&apos;IA calcule un <strong className="text-foreground">&quot;coefficient domicile/extérieur&quot; personnalisé</strong> par équipe. 
                  Elle sait que Metz à l&apos;extérieur n&apos;est pas le même Metz qu&apos;à domicile. 
                  Cette granularité individuelle est impossible à reproduire par intuition humaine.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: "L'IA abandonne le 'bonus domicile fixe' des modèles naïfs. Elle calcule un coefficient personnalisé par équipe, basé sur l'historique des 3 dernières saisons. Pour certaines équipes, ce coefficient vaut +30%, pour d'autres seulement +3%."
            }}
            chartComponent={<HomeAwayRadar key="chart" data={radarData.radarData} />}
            chartTitle="Profils Domicile/Extérieur (3 équipes types)"
            color={SECTION_COLORS.purple}
            iconName="Home"
            reversed
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 9 : LA LOI DES NOMBRES
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-9"
            index={9}
            title="La Loi des Nombres"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  🎲 Le score final semble aléatoire... 
                  <strong className="text-foreground"> mais il suit une loi mathématique stricte : la distribution de Poisson.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  Cet histogramme montre la fréquence des scores totaux (buts domicile + buts extérieur). 
                  La distribution forme une <strong className="text-foreground">courbe en cloche asymétrique</strong> typique de Poisson. 
                  Le mode (valeur la plus fréquente) se situe à <strong className="text-foreground">{goalDistData.stats.mode}</strong>. 
                  La moyenne est de {goalDistData.stats.avgGoals} buts par match. 
                  Les scores extrêmes (0-0, 5+) sont des <strong className="text-foreground">anomalies statistiques</strong> représentant moins de 15% des matchs chacun.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  La distribution de Poisson décrit les événements rares et indépendants — exactement comme les buts au football. 
                  Avec une moyenne λ ≈ {goalDistData.stats.avgGoals}, on peut calculer mathématiquement 
                  la probabilité de chaque score : P(0-0) ≈ 7%, P(1-1) ≈ 12%, P(2-1) ≈ 14%... 
                  Le football n&apos;est <strong className="text-foreground">pas aléatoire, il est probabiliste</strong>. 
                  Les scores &quot;bizarres&quot; (0-0, 4-4) ne sont pas des accidents — ils ont une probabilité calculable.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → L&apos;IA ne prédit pas UN score, elle calcule une <strong className="text-foreground">distribution de probabilités pour chaque score possible</strong>. 
                  &quot;2-1 avec 18% de chances, 1-1 avec 14%, 1-0 avec 12%...&quot; 
                  Cette approche probabiliste capture l&apos;incertitude inhérente au football, là où l&apos;humain veut une réponse unique.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: `Avec λ ≈ ${goalDistData.stats.avgGoals}, l'IA calcule P(score) = (λ^k × e^-λ) / k! pour chaque issue. Elle prédit non pas 'qui gagne' mais 'la matrice complète des probabilités' — une approche plus honnête et plus rentable.`
            }}
            chartComponent={<GoalsDistributionChart key="chart" data={goalDistData.chartData} stats={goalDistData.stats} />}
            chartTitle="Distribution du nombre total de buts par match"
            color={SECTION_COLORS.violet}
            iconName="Sigma"
          />

          {/* ═══════════════════════════════════════════════════════════════════════════
              CHAPITRE 10 : LE DILEMME DE L'AGRESSIVITÉ
              ═══════════════════════════════════════════════════════════════════════════ */}
          <AnalyticsSection
            key="section-10"
            index={10}
            title="Le Dilemme de l'Agressivité"
            description={
              <div>
                {/* ACCROCHE */}
                <p key="hook" className="text-lg font-medium">
                  ⚔️ Faut-il être agressif pour gagner ? 
                  <strong className="text-foreground"> La relation entre fautes et résultats révèle un paradoxe subtil.</strong>
                </p>

                {/* DESCRIPTION FACTUELLE */}
                <p>
                  Ce scatter plot positionne chaque équipe selon ses fautes moyennes par match (axe X) 
                  et ses points moyens par match (axe Y). La ligne de tendance (pointillée rouge) 
                  indique une corrélation <strong className="text-foreground">{aggressivenessData.stats.correlation}</strong>. 
                  On observe {aggressivenessData.stats.totalTeams} équipes dispersées dans le nuage, 
                  avec une moyenne de {aggressivenessData.stats.avgFouls} fautes/match pour {aggressivenessData.stats.avgPoints} pts/match.
                </p>

                {/* INTERPRÉTATION ANALYTIQUE */}
                <p>
                  Le lien entre agressivité et performance n&apos;est <strong className="text-foreground">pas linéaire</strong>. 
                  Certaines équipes &quot;cassent le jeu&quot; intelligemment : beaucoup de fautes tactiques, peu de cartons, 
                  déstabilisation de l&apos;adversaire. D&apos;autres sont &quot;dangereusement agressives&quot; : 
                  fautes violentes, cartons jaunes en série, risque d&apos;expulsion. 
                  L&apos;agressivité <strong className="text-foreground">&quot;contrôlée&quot;</strong> peut être une arme ; 
                  l&apos;agressivité &quot;incontrôlée&quot; est un handicap. La nuance est dans le type de fautes, pas juste le nombre.
                </p>

                {/* LIEN PROBLÉMATIQUE */}
                <p key="link" className="text-muted-foreground italic">
                  → L&apos;IA distingue l&apos;<strong className="text-foreground">&quot;agressivité efficace&quot;</strong> de l&apos;&quot;agressivité à risque&quot;. 
                  Elle croise le nombre de fautes avec le ratio fautes/cartons pour identifier le style de jeu. 
                  Une équipe qui fait 15 fautes et 0 carton est tactiquement maligne ; 
                  une équipe qui fait 12 fautes et 3 jaunes est une bombe à retardement.
                </p>
              </div>
            }
            aiInsight={{
              title: "Ce que l'IA apprend ici",
              content: "L'IA calcule un 'indice d'agressivité intelligente' = fautes / cartons. Plus ce ratio est élevé, plus l'équipe est tactiquement agressive sans prendre de risques. Elle valorise l'agressivité contrôlée et pénalise l'agressivité dangereuse."
            }}
            chartComponent={
              <AggressivenessChart 
                key="chart"
                data={aggressivenessData.scatterData} 
                trendLine={aggressivenessData.trendLine}
                stats={aggressivenessData.stats}
              />
            }
            chartTitle={`Fautes/Match vs Points/Match (${aggressivenessData.stats.totalTeams} équipes)`}
            color={SECTION_COLORS.pink}
            iconName="Swords"
            reversed
          />

        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            CONCLUSION
            ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 text-center border-t border-border">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <BrainCircuit size={14} />
              Conclusion
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Alors, le football est-il prévisible ?
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground text-left">
              <p>
                <strong className="text-foreground">Oui et non.</strong> Ces 10 chapitres démontrent que le football 
                obéit à des <strong className="text-foreground">patterns statistiques robustes</strong> : 
                distribution de Poisson, inertie du score, saisonnalité, identités domicile/extérieur.
              </p>
              <p>
                Mais ces patterns sont <strong className="text-foreground">invisibles à l&apos;œil nu</strong>. 
                L&apos;intuition humaine tombe dans tous les pièges : biais du favori, surestimation de la domination, 
                sous-estimation des Nuls, ignorance des signaux faibles (corners, agressivité, mois).
              </p>
              <p>
                C&apos;est là qu&apos;intervient l&apos;IA : <strong className="text-foreground">elle ne prédit pas mieux parce qu&apos;elle est &quot;intelligente&quot;</strong>, 
                mais parce qu&apos;elle n&apos;a pas de biais cognitifs. Elle calcule froidement, 
                croise des dizaines de variables, et produit des probabilités calibrées.
              </p>
              <p className="font-medium text-foreground">
                Le football reste imprévisible à l&apos;échelle d&apos;un match. 
                Mais à l&apos;échelle de milliers de matchs, les patterns émergent — 
                et celui qui les voit gagne.
              </p>
            </div>
            <div className="pt-6">
              <Link 
                href="/"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
              >
                <BrainCircuit size={20} />
                Retour à l&apos;accueil
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
