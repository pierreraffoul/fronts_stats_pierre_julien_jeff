"use client";

import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MatchHistoryRow, Maybe } from "@/types/database";

type AdvancedAnalyticsDashboardProps = {
  matches: MatchHistoryRow[];
};

// Extension du type pour inclure htr si présent dans les données brutes
type ExtendedMatchHistoryRow = MatchHistoryRow & {
  htr?: Maybe<string>; // 'H' (Home), 'D' (Draw), 'A' (Away)
  hthg?: Maybe<number>; // Half Time Home Goals
  htag?: Maybe<number>; // Half Time Away Goals
  ast?: Maybe<number>; // Away Shots Target
  as?: Maybe<number>; // Away Shots
};

// Palette de couleurs professionnelle compatible Shadcn
const COLORS = {
  slate: "#64748b",
  emerald: "#10b981",
  rose: "#f43f5e",
  indigo: "#6366f1",
  amber: "#f59e0b",
  sky: "#0ea5e9",
  neutral: "#737373",
};

// Fonction utilitaire pour sécuriser les nombres
function safeNumber(n: number | null | undefined, fallback = 0): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : fallback;
}

// Fonction principale de traitement des données
function processData(matches: MatchHistoryRow[]) {
  const extendedMatches = matches as ExtendedMatchHistoryRow[];

  // ===== GRAPHIQUE 1 : Matrice de Renversement =====
  const matchesLosingAtHT = extendedMatches.filter(
    (m) => m.htr === "A" // Équipe à domicile perdait à la mi-temps
  );

  const comebackStats = {
    total: matchesLosingAtHT.length,
    victories: 0,
    draws: 0,
    defeats: 0,
  };

  matchesLosingAtHT.forEach((match) => {
    if (match.ftr === "H") comebackStats.victories++;
    else if (match.ftr === "D") comebackStats.draws++;
    else if (match.ftr === "A") comebackStats.defeats++;
  });

  const comebackData = [
    {
      name: "Remontada",
      Victoire: comebackStats.total > 0 
        ? Number(((comebackStats.victories / comebackStats.total) * 100).toFixed(1))
        : 0,
      Nul: comebackStats.total > 0
        ? Number(((comebackStats.draws / comebackStats.total) * 100).toFixed(1))
        : 0,
      Défaite: comebackStats.total > 0
        ? Number(((comebackStats.defeats / comebackStats.total) * 100).toFixed(1))
        : 0,
    },
  ];

  // ===== GRAPHIQUE 2 : Indice "Sniper" =====
  // Grouper par saison et calculer moyenne de tirs cadrés et efficacité
  const seasonStats: Record<
    string,
    { totalShots: number; totalGoals: number; matchCount: number }
  > = {};

  extendedMatches.forEach((match) => {
    const saison = match.saison || "Inconnue";
    if (!seasonStats[saison]) {
      seasonStats[saison] = { totalShots: 0, totalGoals: 0, matchCount: 0 };
    }
    const shots = safeNumber(match.hst);
    const goals = safeNumber(match.fthg);
    if (shots > 0) {
      seasonStats[saison].totalShots += shots;
      seasonStats[saison].totalGoals += goals;
      seasonStats[saison].matchCount += 1;
    }
  });

  const sniperData = Object.entries(seasonStats)
    .map(([saison, stats]) => {
      const avgShots = stats.matchCount > 0 
        ? Number((stats.totalShots / stats.matchCount).toFixed(2))
        : 0;
      const efficiency = stats.totalShots > 0
        ? Number(((stats.totalGoals / stats.totalShots) * 100).toFixed(2))
        : 0;
      return {
        saison,
        avgShots,
        efficiency,
        matchCount: stats.matchCount,
      };
    })
    .filter((d) => d.matchCount >= 10) // Au moins 10 matchs pour être significatif
    .sort((a, b) => a.saison.localeCompare(b.saison));

  // ===== GRAPHIQUE 3 : ROI Betting =====
  // Calculer le profit pour les 10 équipes les plus fréquentes à domicile
  const teamHomeStats: Record<
    string,
    { wins: number; losses: number; draws: number; totalBets: number }
  > = {};

  extendedMatches.forEach((match) => {
    const team = match.hometeam;
    if (!teamHomeStats[team]) {
      teamHomeStats[team] = { wins: 0, losses: 0, draws: 0, totalBets: 0 };
    }
    teamHomeStats[team].totalBets += 1;
    if (match.ftr === "H") teamHomeStats[team].wins += 1;
    else if (match.ftr === "D") teamHomeStats[team].draws += 1;
    else if (match.ftr === "A") teamHomeStats[team].losses += 1;
  });

  const roiData = Object.entries(teamHomeStats)
    .map(([team, stats]) => {
      // Calculer le profit moyen par match (mise de 10€)
      const betAmount = 10;
      let totalProfit = 0;

      extendedMatches
        .filter((m) => m.hometeam === team)
        .forEach((match) => {
          const cote = safeNumber(match.cote_dom_clean, 0);
          if (cote > 0) {
            if (match.ftr === "H") {
              totalProfit += betAmount * cote - betAmount; // Gain
            } else {
              totalProfit -= betAmount; // Perte
            }
          }
        });

      const avgProfit = stats.totalBets > 0 
        ? Number((totalProfit / stats.totalBets).toFixed(2))
        : 0;

      return {
        team: team.length > 15 ? team.substring(0, 15) + "..." : team,
        profit: avgProfit,
        totalBets: stats.totalBets,
        winRate: stats.totalBets > 0
          ? Number(((stats.wins / stats.totalBets) * 100).toFixed(1))
          : 0,
      };
    })
    .filter((d) => d.totalBets >= 20) // Au moins 20 matchs à domicile
    .sort((a, b) => b.totalBets - a.totalBets)
    .slice(0, 10); // Top 10

  // ===== GRAPHIQUE 4 : Polarité Domicile/Extérieur =====
  // Top 5 équipes par nombre de matchs
  const allTeamStats: Record<
    string,
    {
      homeMatches: number;
      homeWins: number;
      homeGoals: number;
      homeCleanSheets: number;
      awayMatches: number;
      awayWins: number;
      awayGoals: number;
      awayCleanSheets: number;
    }
  > = {};

  extendedMatches.forEach((match) => {
    const homeTeam = match.hometeam;
    const awayTeam = match.awayteam;
    const homeGoals = safeNumber(match.fthg);
    const awayGoals = safeNumber(match.ftag);

    // Stats domicile
    if (!allTeamStats[homeTeam]) {
      allTeamStats[homeTeam] = {
        homeMatches: 0,
        homeWins: 0,
        homeGoals: 0,
        homeCleanSheets: 0,
        awayMatches: 0,
        awayWins: 0,
        awayGoals: 0,
        awayCleanSheets: 0,
      };
    }
    allTeamStats[homeTeam].homeMatches += 1;
    if (match.ftr === "H") allTeamStats[homeTeam].homeWins += 1;
    allTeamStats[homeTeam].homeGoals += homeGoals;
    if (awayGoals === 0) allTeamStats[homeTeam].homeCleanSheets += 1;

    // Stats extérieur
    if (!allTeamStats[awayTeam]) {
      allTeamStats[awayTeam] = {
        homeMatches: 0,
        homeWins: 0,
        homeGoals: 0,
        homeCleanSheets: 0,
        awayMatches: 0,
        awayWins: 0,
        awayGoals: 0,
        awayCleanSheets: 0,
      };
    }
    allTeamStats[awayTeam].awayMatches += 1;
    if (match.ftr === "A") allTeamStats[awayTeam].awayWins += 1;
    allTeamStats[awayTeam].awayGoals += awayGoals;
    if (homeGoals === 0) allTeamStats[awayTeam].awayCleanSheets += 1;
  });

  // Sélectionner les 5 équipes avec le plus de matchs
  const topTeams = Object.entries(allTeamStats)
    .map(([team, stats]) => ({
      team,
      totalMatches: stats.homeMatches + stats.awayMatches,
      stats,
    }))
    .sort((a, b) => b.totalMatches - a.totalMatches)
    .slice(0, 5);

  // Restructurer les données pour le Radar Chart
  // Chaque métrique devient un point du radar avec une valeur pour chaque équipe
  const radarSubjects = [
    "Victoires Domicile (%)",
    "Victoires Extérieur (%)",
    "Buts Marqués Domicile",
    "Buts Marqués Extérieur",
    "Clean Sheets Domicile (%)",
  ];

  // Créer un mapping des équipes avec leurs noms courts
  const teamNames = topTeams.map(({ team }) => 
    team.length > 12 ? team.substring(0, 12) + "..." : team
  );

  const radarData = radarSubjects.map((subject) => {
    const point: Record<string, number | string> = { subject };
    topTeams.forEach(({ team, stats }, index) => {
      const teamShort = teamNames[index];
      let value = 0;
      
      if (subject === "Victoires Domicile (%)") {
        value = stats.homeMatches > 0
          ? Number(((stats.homeWins / stats.homeMatches) * 100).toFixed(1))
          : 0;
      } else if (subject === "Victoires Extérieur (%)") {
        value = stats.awayMatches > 0
          ? Number(((stats.awayWins / stats.awayMatches) * 100).toFixed(1))
          : 0;
      } else if (subject === "Buts Marqués Domicile") {
        const avgHomeGoals = stats.homeMatches > 0
          ? Number((stats.homeGoals / stats.homeMatches).toFixed(2))
          : 0;
        value = avgHomeGoals * 10; // Multiplier pour la visibilité
      } else if (subject === "Buts Marqués Extérieur") {
        const avgAwayGoals = stats.awayMatches > 0
          ? Number((stats.awayGoals / stats.awayMatches).toFixed(2))
          : 0;
        value = avgAwayGoals * 10;
      } else if (subject === "Clean Sheets Domicile (%)") {
        value = stats.homeMatches > 0
          ? Number(((stats.homeCleanSheets / stats.homeMatches) * 100).toFixed(1))
          : 0;
      }
      
      point[teamShort] = value;
    });
    return point;
  });

  return {
    comebackData,
    comebackStats,
    sniperData,
    roiData,
    radarData,
  };
}

// GRAPHIQUE 1 : Matrice de Renversement
function ComebackMatrixChart({
  data,
  stats,
}: {
  data: ReturnType<typeof processData>["comebackData"];
  stats: ReturnType<typeof processData>["comebackStats"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>La Matrice de Renversement</CardTitle>
        <CardDescription>
          Analyse des matchs où l'équipe à domicile perdait à la mi-temps (htr = 'A').
          Seulement {stats.total > 0 ? ((stats.victories / stats.total) * 100).toFixed(1) : "0"}% 
          des équipes renversent le match pour finalement gagner. Cette rareté statistique 
          justifie l'utilisation d'une IA prédictive pour détecter ces exceptions où la 
          dynamique du match peut basculer malgré un score défavorable.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.total === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
            Données de mi-temps (htr) non disponibles dans la base de données.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis type="number" domain={[0, 100]} className="text-xs" tick={{ fill: "currentColor" }} />
              <YAxis dataKey="name" type="category" className="text-xs" tick={{ fill: "currentColor" }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => `${value}%`}
              />
              <Legend />
              <Bar dataKey="Victoire" stackId="a" fill={COLORS.emerald} name="Victoire Finale" />
              <Bar dataKey="Nul" stackId="a" fill={COLORS.amber} name="Match Nul" />
              <Bar dataKey="Défaite" stackId="a" fill={COLORS.rose} name="Défaite Finale" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// GRAPHIQUE 2 : Indice "Sniper"
function SniperIndexChart({
  data,
}: {
  data: ReturnType<typeof processData>["sniperData"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>L'Indice "Sniper" : Domination vs Efficacité</CardTitle>
        <CardDescription>
          Corrélation entre la moyenne de tirs cadrés par match et l'efficacité (buts/tirs cadrés).
          Ce graphique révèle que tirer beaucoup ne garantit pas une haute efficacité. Les équipes 
          peuvent dominer statistiquement sans convertir leurs occasions, démontrant la complexité 
          non-linéaire que l'IA doit apprendre à modéliser pour prédire les résultats réels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
            Données insuffisantes pour générer le graphique.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis
                type="number"
                dataKey="avgShots"
                name="Moy. Tirs Cadrés"
                className="text-xs"
                tick={{ fill: "currentColor" }}
                label={{ value: "Moyenne de Tirs Cadrés", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                type="number"
                dataKey="efficiency"
                name="Efficacité (%)"
                className="text-xs"
                tick={{ fill: "currentColor" }}
                label={{ value: "Efficacité (Buts/Tirs Cadrés %)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value}${name.includes("Efficacité") ? "%" : ""}`,
                  name,
                  `Saison: ${props.payload.saison}`,
                ]}
              />
              <Scatter
                name="Saisons"
                data={data}
                fill={COLORS.indigo}
                opacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// GRAPHIQUE 3 : ROI Betting
function ROIBettingChart({
  data,
}: {
  data: ReturnType<typeof processData>["roiData"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Le ROI Betting : Où se trouve la "Value" ?</CardTitle>
        <CardDescription>
          Analyse du profit moyen par match pour les 10 équipes les plus fréquentes à domicile 
          (mise de 10€ par match). Ce graphique démontre que parier aveuglément sur les favoris 
          fait souvent perdre de l'argent. L'IA prédictive cherche à identifier ces inefficacités 
          du marché où la valeur réelle diffère de la cote proposée.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
            Données insuffisantes pour générer le graphique.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis
                dataKey="team"
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs"
                tick={{ fill: "currentColor" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "currentColor" }}
                label={{ value: "Profit Moyen (€)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}€`, "Profit Moyen"]}
              />
              <ReferenceLine y={0} stroke={COLORS.neutral} strokeDasharray="3 3" />
              <Bar dataKey="profit" name="Profit Moyen">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.profit >= 0 ? COLORS.emerald : COLORS.rose}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// GRAPHIQUE 4 : Polarité Domicile/Extérieur
function HomeAwayPolarityChart({
  data,
}: {
  data: ReturnType<typeof processData>["radarData"];
}) {
  const radarKeys = [
    "Victoires Domicile (%)",
    "Victoires Extérieur (%)",
    "Buts Marqués Domicile",
    "Buts Marqués Extérieur",
    "Clean Sheets Domicile (%)",
  ];

  const colors = [COLORS.indigo, COLORS.emerald, COLORS.rose, COLORS.amber, COLORS.sky];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Polarité Domicile/Extérieur</CardTitle>
        <CardDescription>
          Profil des 5 équipes les plus actives selon leur performance à domicile vs extérieur.
          Ce graphique visualise le profil "bipolaire" de certaines équipes, où l'impact 
          psychologique du terrain crée des disparités significatives. L'IA doit intégrer cette 
          dimension contextuelle pour améliorer ses prédictions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
            Données insuffisantes pour générer le graphique.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <PolarGrid className="stroke-zinc-200 dark:stroke-zinc-800" />
              <PolarAngleAxis
                dataKey="subject"
                className="text-xs"
                tick={{ fill: "currentColor" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, "dataMax"]}
                className="text-xs"
                tick={{ fill: "currentColor" }}
              />
              {data.length > 0 && Object.keys(data[0]).filter(k => k !== 'subject').map((teamName, index) => (
                <Radar
                  key={teamName}
                  name={teamName}
                  dataKey={teamName}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                />
              ))}
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// Composant principal
export function AdvancedAnalyticsDashboard({
  matches,
}: AdvancedAnalyticsDashboardProps) {
  const processed = processData(matches);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ComebackMatrixChart data={processed.comebackData} stats={processed.comebackStats} />
      <SniperIndexChart data={processed.sniperData} />
      <ROIBettingChart data={processed.roiData} />
      <HomeAwayPolarityChart data={processed.radarData} />
    </div>
  );
}

