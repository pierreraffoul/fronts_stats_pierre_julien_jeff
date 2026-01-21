"use client";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MatchHistoryRow } from "@/types/database";

type GlobalStatsProps = {
  matches: MatchHistoryRow[];
};

// Couleurs pour les graphiques
const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  pie: ["#3b82f6", "#f59e0b", "#10b981"],
};

// Fonction utilitaire pour sécuriser les nombres
function safeNumber(n: number | null | undefined, fallback = 0): number {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : fallback;
}

// BLOC 1 : Évolution du jeu (Line Chart)
function EvolutionChart({ matches }: { matches: MatchHistoryRow[] }) {
  // Grouper par saison et calculer la moyenne de buts par match
  const seasonData = matches.reduce((acc, match) => {
    const saison = match.saison || "Inconnue";
    if (!acc[saison]) {
      acc[saison] = { saison, totalButs: 0, nbMatchs: 0 };
    }
    const buts = safeNumber(match.fthg) + safeNumber(match.ftag);
    acc[saison].totalButs += buts;
    acc[saison].nbMatchs += 1;
    return acc;
  }, {} as Record<string, { saison: string; totalButs: number; nbMatchs: number }>);

  const chartData = Object.values(seasonData)
    .map((d) => ({
      saison: d.saison,
      moyenneButs: d.nbMatchs > 0 ? Number((d.totalButs / d.nbMatchs).toFixed(2)) : 0,
    }))
    .sort((a, b) => a.saison.localeCompare(b.saison));

  const maxSeason = chartData.reduce(
    (max, d) => (d.moyenneButs > max.moyenneButs ? d : max),
    chartData[0] || { saison: "", moyenneButs: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>L'Évolution du Jeu</CardTitle>
        <CardDescription>
          Évolution de la moyenne de buts par match au fil des saisons
          {maxSeason.saison && (
            <span className="block mt-1 font-medium text-zinc-900 dark:text-zinc-100">
              Saison la plus prolifique : {maxSeason.saison} ({maxSeason.moyenneButs} buts/match)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              dataKey="saison"
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "currentColor" }}
              label={{ value: "Buts/match", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="moyenneButs"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Moyenne de buts"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// BLOC 2 : Le Mythe de l'Avantage Domicile (Pie Chart)
function HomeAdvantageChart({ matches }: { matches: MatchHistoryRow[] }) {
  const resultCounts = matches.reduce(
    (acc, match) => {
      const result = match.ftr;
      if (result === "H") acc.home += 1;
      else if (result === "D") acc.draw += 1;
      else if (result === "A") acc.away += 1;
      return acc;
    },
    { home: 0, draw: 0, away: 0 }
  );

  const total = resultCounts.home + resultCounts.draw + resultCounts.away;
  const pieData = [
    { name: "Victoire Domicile", value: resultCounts.home, percentage: total > 0 ? ((resultCounts.home / total) * 100).toFixed(1) : "0" },
    { name: "Match Nul", value: resultCounts.draw, percentage: total > 0 ? ((resultCounts.draw / total) * 100).toFixed(1) : "0" },
    { name: "Victoire Extérieur", value: resultCounts.away, percentage: total > 0 ? ((resultCounts.away / total) * 100).toFixed(1) : "0" },
  ];

  const renderLabel = (entry: { name: string; percentage: string }) => {
    return `${entry.name}: ${entry.percentage}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Le Mythe de l'Avantage Domicile</CardTitle>
        <CardDescription>
          Répartition des résultats sur l'ensemble de la base de données
          <span className="block mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Class Imbalance : Les victoires à domicile dominent, mais les surprises existent
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => renderLabel(props as any)}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// BLOC 3 : La Faillite des Favoris (Bar Chart)
function FavoriteFailureChart({ matches }: { matches: MatchHistoryRow[] }) {
  // Fonction pour déterminer la tranche de cote
  function getCoteRange(cote: number): string {
    if (cote < 1.5) return "1.0-1.5";
    if (cote < 2.0) return "1.5-2.0";
    if (cote < 2.5) return "2.0-2.5";
    return "2.5+";
  }

  // Analyser chaque match
  const rangeData: Record<
    string,
    { wins: number; losses: number; total: number }
  > = {};

  matches.forEach((match) => {
    const coteDom = safeNumber(match.cote_dom_clean, Infinity);
    const coteExt = safeNumber(match.cote_ext_clean, Infinity);
    const result = match.ftr;

    // Déterminer le favori (cote la plus basse)
    let favoriteWon = false;
    let coteFavorite = Infinity;

    if (coteDom < coteExt) {
      coteFavorite = coteDom;
      favoriteWon = result === "H";
    } else if (coteExt < coteDom) {
      coteFavorite = coteExt;
      favoriteWon = result === "A";
    } else {
      // Cotes égales ou manquantes, on skip
      return;
    }

    if (coteFavorite === Infinity) return;

    const range = getCoteRange(coteFavorite);
    if (!rangeData[range]) {
      rangeData[range] = { wins: 0, losses: 0, total: 0 };
    }

    rangeData[range].total += 1;
    if (favoriteWon) {
      rangeData[range].wins += 1;
    } else {
      rangeData[range].losses += 1;
    }
  });

  const chartData = Object.entries(rangeData)
    .map(([range, data]) => ({
      range,
      "Victoire Favori (%)": data.total > 0 ? Number(((data.wins / data.total) * 100).toFixed(1)) : 0,
      "Surprise (%)": data.total > 0 ? Number(((data.losses / data.total) * 100).toFixed(1)) : 0,
      total: data.total,
    }))
    .sort((a, b) => a.range.localeCompare(b.range));

  return (
    <Card>
      <CardHeader>
        <CardTitle>La Faillite des Favoris</CardTitle>
        <CardDescription>
          Taux de réussite du favori selon sa cote
          <span className="block mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Même à 1.50, le favori perd souvent. L'IA doit trouver la valeur là où l'humain voit une évidence.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              dataKey="range"
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "currentColor" }}
              label={{ value: "Pourcentage (%)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="Victoire Favori (%)" fill={COLORS.success} />
            <Bar dataKey="Surprise (%)" fill={COLORS.danger} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// BLOC 4 : Corrélation "Domination vs Réalisme" (Scatter Plot)
function DominationVsRealityChart({ matches }: { matches: MatchHistoryRow[] }) {
  // Prendre un échantillon de 500 matchs aléatoires
  const sampleSize = 500;
  const validMatches = matches.filter(
    (m) => safeNumber(m.hst) > 0 && safeNumber(m.fthg) >= 0
  );

  // Mélanger et prendre un échantillon
  const shuffled = [...validMatches].sort(() => Math.random() - 0.5);
  const sampled = shuffled.slice(0, Math.min(sampleSize, shuffled.length));

  const scatterData = sampled.map((match) => ({
    x: safeNumber(match.hst),
    y: safeNumber(match.fthg),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domination vs Réalisme</CardTitle>
        <CardDescription>
          Corrélation entre tirs cadrés et buts marqués (échantillon de {sampled.length} matchs)
          <span className="block mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Dominer n'est pas gagner. La non-linéarité que l'IA doit apprendre.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              type="number"
              dataKey="x"
              name="Tirs Cadrés"
              className="text-xs"
              tick={{ fill: "currentColor" }}
              label={{ value: "Tirs Cadrés Domicile", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Buts"
              className="text-xs"
              tick={{ fill: "currentColor" }}
              label={{ value: "Buts Marqués Domicile", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
              }}
            />
            <Scatter
              name="Matchs"
              data={scatterData}
              fill={COLORS.primary}
              opacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Composant principal
export function GlobalStats({ matches }: GlobalStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <EvolutionChart matches={matches} />
      <HomeAdvantageChart matches={matches} />
      <FavoriteFailureChart matches={matches} />
      <DominationVsRealityChart matches={matches} />
    </div>
  );
}

