import { MatchHistoryRow, AITrainingDataRow } from "@/types/database";

export type EnrichedMatch = MatchHistoryRow & {
  home_forme?: number | null;
  away_forme?: number | null;
};

// Fusionne les deux tables pour avoir les scores + la forme
export function enrichMatchesWithTrainingData(
  matches: MatchHistoryRow[],
  training: AITrainingDataRow[]
): EnrichedMatch[] {
  // Crée un map pour accès rapide par date+team
  const trainingMap = new Map();
  training.forEach((t) => {
    const key = `${t.date}-${t.hometeam}-${t.awayteam}`;
    trainingMap.set(key, t);
  });

  return matches.map((m) => {
    const key = `${m.date}-${m.hometeam}-${m.awayteam}`;
    const t = trainingMap.get(key);
    return {
      ...m,
      home_forme: t?.home_forme_pts_last5 ?? null,
      away_forme: t?.away_forme_pts_last5 ?? null,
    };
  });
}

// 1. Calcul ROI (Bar Chart)
export function calculateBettingROI(matches: EnrichedMatch[]) {
  // On groupe par tranche de cotes (ex: 1.0-1.2, 1.2-1.5, etc.)
  const brackets = [
    { min: 1.0, max: 1.3, label: "Hyper Favori (1.0-1.3)", profit: 0, count: 0 },
    { min: 1.3, max: 1.7, label: "Favori Solide (1.3-1.7)", profit: 0, count: 0 },
    { min: 1.7, max: 2.2, label: "Incertain (1.7-2.2)", profit: 0, count: 0 },
    { min: 2.2, max: 100, label: "Outsider (2.2+)", profit: 0, count: 0 },
  ];

  matches.forEach((m) => {
    // On parie toujours sur le favori (la cote la plus basse)
    const favoriteIsHome = (m.cote_dom_clean || 99) < (m.cote_ext_clean || 99);
    const odds = favoriteIsHome ? m.cote_dom_clean : m.cote_ext_clean;
    
    if (!odds) return;

    // Trouve le bon bracket
    const bracket = brackets.find((b) => odds >= b.min && odds < b.max);
    if (bracket) {
      bracket.count++;
      // Si le favori gagne
      const favWon = favoriteIsHome ? m.ftr === 'H' : m.ftr === 'A';
      
      if (favWon) {
        bracket.profit += (10 * odds) - 10;
      } else {
        bracket.profit -= 10;
      }
    }
  });

  return {
    chartData: brackets.map(b => ({ name: b.label, profit: Math.round(b.profit), count: b.count })),
    globalStats: { totalMatches: matches.length }
  };
}

// 2. Calcul Remontada (Pie Chart / Stacked)
export function calculateHalfTimeComebacks(matches: EnrichedMatch[]) {
  // Matchs où Home perdait à la mi-temps
  const losingAtHT = matches.filter(m => m.htr === 'A');
  const total = losingAtHT.length;
  
  // Résultats finaux
  const wins = losingAtHT.filter(m => m.ftr === 'H').length; // Remontada
  const draws = losingAtHT.filter(m => m.ftr === 'D').length; // Sauvetage
  const losses = losingAtHT.filter(m => m.ftr === 'A').length; // Défaite confirmée

  return {
    chartData: [
      { name: "Défaite Confirmée", value: losses, fill: "#ef4444" }, // Rouge
      { name: "Match Nul (Sauvé)", value: draws, fill: "#f59e0b" },  // Jaune
      { name: "Victoire (Remontada)", value: wins, fill: "#10b981" }, // Vert
    ],
    stats: { total, wins, winRate: total > 0 ? ((wins/total)*100).toFixed(1) : "0" }
  };
}

// 3. Calcul Efficacité (Scatter)
export function calculateEfficiencyData(matches: EnrichedMatch[]) {
  // On prend un échantillon aléatoire pour la lisibilité
  const sample = matches
    .filter(m => m.hst != null && m.fthg != null && m.hst > 0)
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 400);

  // Ligne de tendance simple (Moyenne)
  const totalShots = sample.reduce((acc, m) => acc + (m.hst || 0), 0);
  const totalGoals = sample.reduce((acc, m) => acc + (m.fthg || 0), 0);
  const avgRatio = totalShots > 0 ? totalGoals / totalShots : 0;
  
  const trendLine = [
    { x: 0, y: 0 },
    { x: 15, y: 15 * avgRatio } // Projection linéaire théorique
  ];

  return {
    scatterData: sample.map(m => ({ 
      x: m.hst || 0, 
      y: m.fthg || 0, 
      team: m.hometeam 
    })),
    trendLine,
    sampleSize: sample.length,
    totalMatches: matches.length
  };
}

// 4. Calcul Radar Home/Away
export function calculateHomeAwayComparison(matches: EnrichedMatch[]) {
  // On prend 3 équipes types : PSG (Fort), une équipe moyenne, une équipe faible
  // Idéalement, calcule les stats réelles. Ici on filtre manuellement pour l'exemple
  const teamsToAnalyze = ["Paris SG", "Rennes", "Metz"]; 
  
  const radarData = teamsToAnalyze.map(team => {
    const homeMatches = matches.filter(m => m.hometeam === team);
    const awayMatches = matches.filter(m => m.awayteam === team);
    
    const winRateHome = homeMatches.length > 0 
      ? (homeMatches.filter(m => m.ftr === 'H').length / homeMatches.length) * 100 
      : 0;
    const winRateAway = awayMatches.length > 0
      ? (awayMatches.filter(m => m.ftr === 'A').length / awayMatches.length) * 100 
      : 0;
    const goalsHome = homeMatches.length > 0
      ? (homeMatches.reduce((acc, m) => acc + (m.fthg || 0), 0) / homeMatches.length)
      : 0;
    const goalsAway = awayMatches.length > 0
      ? (awayMatches.reduce((acc, m) => acc + (m.ftag || 0), 0) / awayMatches.length)
      : 0;

    return {
      subject: team,
      "Victoire Dom (%)": Math.round(winRateHome),
      "Victoire Ext (%)": Math.round(winRateAway),
      "Buts Dom (x10)": Math.round(goalsHome * 10), // x10 pour l'échelle radar
      "Buts Ext (x10)": Math.round(goalsAway * 10),
      fullMark: 100
    };
  });

  return {
    radarData,
    teamLabels: [
      { name: "Paris SG", label: "Le Caïd", type: "Fort partout" },
      { name: "Rennes", label: "L'Équilibré", type: "Stable" },
      { name: "Metz", label: "En danger", type: "Faible Extérieur" }
    ]
  };
}
