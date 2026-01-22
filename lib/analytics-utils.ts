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

// ═══════════════════════════════════════════════════════════════════════════════
// 1. LA FAILLITE DU FAVORI (BarChart)
// Profit cumulé si on parie 10€ sur le favori (cote la plus basse)
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateBettingROI(matches: EnrichedMatch[]) {
  const brackets = [
    { min: 1.0, max: 1.3, label: "Hyper Favori (1.0-1.3)", profit: 0, count: 0 },
    { min: 1.3, max: 1.7, label: "Favori Solide (1.3-1.7)", profit: 0, count: 0 },
    { min: 1.7, max: 2.2, label: "Incertain (1.7-2.2)", profit: 0, count: 0 },
    { min: 2.2, max: 100, label: "Outsider (2.2+)", profit: 0, count: 0 },
  ];

  matches.forEach((m) => {
    const favoriteIsHome = (m.cote_dom_clean || 99) < (m.cote_ext_clean || 99);
    const odds = favoriteIsHome ? m.cote_dom_clean : m.cote_ext_clean;
    
    if (!odds) return;

    const bracket = brackets.find((b) => odds >= b.min && odds < b.max);
    if (bracket) {
      bracket.count++;
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

// ═══════════════════════════════════════════════════════════════════════════════
// 2. L'ANOMALIE DES MATCHS NULS (AreaChart)
// % de Matchs Nuls par saison
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateDrawAnomaly(matches: EnrichedMatch[]) {
  // Groupe par saison
  const seasonStats: Record<string, { total: number; draws: number }> = {};

  matches.forEach((m) => {
    const saison = m.saison || "Inconnue";
    if (!seasonStats[saison]) {
      seasonStats[saison] = { total: 0, draws: 0 };
    }
    seasonStats[saison].total++;
    if (m.ftr === 'D') {
      seasonStats[saison].draws++;
    }
  });

  // Trier par saison
  const sortedSeasons = Object.keys(seasonStats).sort();
  
  const chartData = sortedSeasons.map(saison => ({
    name: saison,
    drawRate: seasonStats[saison].total > 0 
      ? Math.round((seasonStats[saison].draws / seasonStats[saison].total) * 1000) / 10
      : 0,
    total: seasonStats[saison].total
  }));

  // Calcul moyenne globale
  const totalMatches = matches.length;
  const totalDraws = matches.filter(m => m.ftr === 'D').length;
  const avgDrawRate = totalMatches > 0 ? Math.round((totalDraws / totalMatches) * 1000) / 10 : 0;

  return {
    chartData,
    stats: {
      avgDrawRate,
      totalDraws,
      totalMatches
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DOMINATION VS RÉALISME (ScatterChart)
// Tirs Cadrés (X) vs Buts (Y)
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateEfficiencyData(matches: EnrichedMatch[]) {
  const sample = matches
    .filter(m => m.hst != null && m.fthg != null && m.hst > 0)
    .sort(() => 0.5 - Math.random())
    .slice(0, 400);

  const totalShots = sample.reduce((acc, m) => acc + (m.hst || 0), 0);
  const totalGoals = sample.reduce((acc, m) => acc + (m.fthg || 0), 0);
  const avgRatio = totalShots > 0 ? totalGoals / totalShots : 0;
  
  const trendLine = [
    { x: 0, y: 0 },
    { x: 15, y: 15 * avgRatio }
  ];

  return {
    scatterData: sample.map(m => ({ 
      x: m.hst || 0, 
      y: m.fthg || 0, 
      team: m.hometeam 
    })),
    trendLine,
    sampleSize: sample.length,
    totalMatches: matches.length,
    conversionRate: Math.round(avgRatio * 100)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. LA TRANSFORMATION DES CORNERS (BarChart)
// Top 5 équipes avec le meilleur ratio (Buts / Corners)
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateCornerEfficiency(matches: EnrichedMatch[]) {
  // Aggrège par équipe (dom + ext)
  const teamStats: Record<string, { goals: number; corners: number; matches: number }> = {};

  matches.forEach((m) => {
    // Stats domicile
    if (m.hc != null && m.fthg != null) {
      if (!teamStats[m.hometeam]) {
        teamStats[m.hometeam] = { goals: 0, corners: 0, matches: 0 };
      }
      teamStats[m.hometeam].goals += m.fthg;
      teamStats[m.hometeam].corners += m.hc;
      teamStats[m.hometeam].matches++;
    }

    // Stats extérieur
    if (m.ac != null && m.ftag != null) {
      if (!teamStats[m.awayteam]) {
        teamStats[m.awayteam] = { goals: 0, corners: 0, matches: 0 };
      }
      teamStats[m.awayteam].goals += m.ftag;
      teamStats[m.awayteam].corners += m.ac;
      teamStats[m.awayteam].matches++;
    }
  });

  // Calcul du ratio et tri
  const rankings = Object.entries(teamStats)
    .filter(([, stats]) => stats.corners >= 50) // Minimum 50 corners pour être significatif
    .map(([team, stats]) => ({
      name: team,
      ratio: stats.corners > 0 ? Math.round((stats.goals / stats.corners) * 100) / 100 : 0,
      goals: stats.goals,
      corners: stats.corners,
      matches: stats.matches
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 5);

  // Moyenne globale
  const totalGoals = Object.values(teamStats).reduce((acc, s) => acc + s.goals, 0);
  const totalCorners = Object.values(teamStats).reduce((acc, s) => acc + s.corners, 0);
  const avgRatio = totalCorners > 0 ? Math.round((totalGoals / totalCorners) * 100) / 100 : 0;

  return {
    chartData: rankings,
    stats: {
      avgRatio,
      totalCorners,
      totalGoals
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. L'IMPACT DE LA FATIGUE / SAISONNALITÉ (LineChart)
// Moyenne de buts par match selon le mois
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateSeasonalGoals(matches: EnrichedMatch[]) {
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  // Ordre de la saison de foot : Août -> Mai
  const seasonOrder = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4]; // Index des mois (0 = Janvier)

  const monthStats: Record<number, { goals: number; matches: number }> = {};
  seasonOrder.forEach(m => {
    monthStats[m] = { goals: 0, matches: 0 };
  });

  matches.forEach((m) => {
    const date = new Date(m.date);
    const month = date.getMonth();
    
    if (monthStats[month] !== undefined) {
      const totalGoals = (m.fthg || 0) + (m.ftag || 0);
      monthStats[month].goals += totalGoals;
      monthStats[month].matches++;
    }
  });

  const chartData = seasonOrder.map(monthIndex => ({
    name: monthNames[monthIndex].slice(0, 3), // Abréviation
    fullName: monthNames[monthIndex],
    avgGoals: monthStats[monthIndex].matches > 0 
      ? Math.round((monthStats[monthIndex].goals / monthStats[monthIndex].matches) * 100) / 100
      : 0,
    matches: monthStats[monthIndex].matches
  }));

  // Trouver le mois le plus prolifique
  const maxMonth = chartData.reduce((a, b) => a.avgGoals > b.avgGoals ? a : b);
  const minMonth = chartData.filter(m => m.matches > 0).reduce((a, b) => a.avgGoals < b.avgGoals ? a : b);

  return {
    chartData,
    stats: {
      maxMonth: maxMonth.fullName,
      maxAvg: maxMonth.avgGoals,
      minMonth: minMonth.fullName,
      minAvg: minMonth.avgGoals,
      variation: Math.round((maxMonth.avgGoals - minMonth.avgGoals) * 100) / 100
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. LE MYTHE DE LA REMONTADA (PieChart)
// Répartition Victoire/Nul/Défaite quand l'équipe perd à la mi-temps
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateHalfTimeComebacks(matches: EnrichedMatch[]) {
  // Matchs où Home perdait à la mi-temps
  const losingAtHT = matches.filter(m => m.htr === 'A');
  const total = losingAtHT.length;
  
  const wins = losingAtHT.filter(m => m.ftr === 'H').length;
  const draws = losingAtHT.filter(m => m.ftr === 'D').length;
  const losses = losingAtHT.filter(m => m.ftr === 'A').length;

  return {
    chartData: [
      { name: "Défaite Confirmée", value: losses, fill: "#ef4444" },
      { name: "Match Nul (Sauvé)", value: draws, fill: "#f59e0b" },
      { name: "Victoire (Remontada)", value: wins, fill: "#10b981" },
    ],
    stats: { 
      total, 
      wins, 
      draws,
      losses,
      winRate: total > 0 ? ((wins/total)*100).toFixed(1) : "0",
      drawRate: total > 0 ? ((draws/total)*100).toFixed(1) : "0"
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. L'EFFET 'CYGNE NOIR' / CARTON ROUGE (BarChart Comparatif)
// % Victoire à 11 vs % Victoire avec un Rouge
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateRedCardImpact(matches: EnrichedMatch[]) {
  // Analyse des matchs domicile
  const homeAtEleven = matches.filter(m => !m.hr || m.hr === 0);
  const homeWithRed = matches.filter(m => m.hr && m.hr > 0);

  const winRateAtEleven = homeAtEleven.length > 0
    ? (homeAtEleven.filter(m => m.ftr === 'H').length / homeAtEleven.length) * 100
    : 0;

  const winRateWithRed = homeWithRed.length > 0
    ? (homeWithRed.filter(m => m.ftr === 'H').length / homeWithRed.length) * 100
    : 0;

  // Analyse des matchs extérieur aussi
  const awayAtEleven = matches.filter(m => !m.ar || m.ar === 0);
  const awayWithRed = matches.filter(m => m.ar && m.ar > 0);

  const awayWinRateAtEleven = awayAtEleven.length > 0
    ? (awayAtEleven.filter(m => m.ftr === 'A').length / awayAtEleven.length) * 100
    : 0;

  const awayWinRateWithRed = awayWithRed.length > 0
    ? (awayWithRed.filter(m => m.ftr === 'A').length / awayWithRed.length) * 100
    : 0;

  return {
    chartData: [
      { name: "Dom. à 11", value: Math.round(winRateAtEleven * 10) / 10, fill: "#3b82f6" },
      { name: "Dom. avec Rouge", value: Math.round(winRateWithRed * 10) / 10, fill: "#ef4444" },
      { name: "Ext. à 11", value: Math.round(awayWinRateAtEleven * 10) / 10, fill: "#8b5cf6" },
      { name: "Ext. avec Rouge", value: Math.round(awayWinRateWithRed * 10) / 10, fill: "#f97316" },
    ],
    stats: {
      matchesAtEleven: homeAtEleven.length,
      matchesWithRed: homeWithRed.length,
      dropRateHome: Math.round((winRateAtEleven - winRateWithRed) * 10) / 10,
      dropRateAway: Math.round((awayWinRateAtEleven - awayWinRateWithRed) * 10) / 10
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. L'IDENTITÉ DOMICILE/EXTÉRIEUR (RadarChart)
// Comparaison 3 équipes types
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateHomeAwayComparison(matches: EnrichedMatch[]) {
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
      "Buts Dom (x10)": Math.round(goalsHome * 10),
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

// ═══════════════════════════════════════════════════════════════════════════════
// 9. LA LOI DE POISSON (BarChart Histogramme)
// Distribution du nombre total de buts (0, 1, 2, 3, 4, 5+)
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateGoalDistribution(matches: EnrichedMatch[]) {
  const distribution: Record<string, number> = {
    "0 but": 0,
    "1 but": 0,
    "2 buts": 0,
    "3 buts": 0,
    "4 buts": 0,
    "5+ buts": 0,
  };

  matches.forEach((m) => {
    const totalGoals = (m.fthg || 0) + (m.ftag || 0);
    
    if (totalGoals === 0) distribution["0 but"]++;
    else if (totalGoals === 1) distribution["1 but"]++;
    else if (totalGoals === 2) distribution["2 buts"]++;
    else if (totalGoals === 3) distribution["3 buts"]++;
    else if (totalGoals === 4) distribution["4 buts"]++;
    else distribution["5+ buts"]++;
  });

  const totalGoalsSum = matches.reduce((acc, m) => acc + (m.fthg || 0) + (m.ftag || 0), 0);
  const avgGoals = matches.length > 0 ? totalGoalsSum / matches.length : 0;

  const mode = Object.entries(distribution).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return {
    chartData: Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      fill: name === "2 buts" || name === "3 buts" ? "#10b981" : "#6366f1"
    })),
    stats: {
      totalMatches: matches.length,
      avgGoals: Math.round(avgGoals * 100) / 100,
      mode
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. AGRESSIVITÉ VS RÉSULTATS (ScatterChart)
// Moyenne de Fautes (X) vs Points Moyens (Y)
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateAggressivenessData(matches: EnrichedMatch[]) {
  // Aggrège par équipe
  const teamStats: Record<string, { 
    fouls: number; 
    points: number; 
    matches: number;
    wins: number;
    draws: number;
  }> = {};

  matches.forEach((m) => {
    // Stats domicile
    if (m.hf != null) {
      if (!teamStats[m.hometeam]) {
        teamStats[m.hometeam] = { fouls: 0, points: 0, matches: 0, wins: 0, draws: 0 };
      }
      teamStats[m.hometeam].fouls += m.hf;
      teamStats[m.hometeam].matches++;
      
      if (m.ftr === 'H') {
        teamStats[m.hometeam].points += 3;
        teamStats[m.hometeam].wins++;
      } else if (m.ftr === 'D') {
        teamStats[m.hometeam].points += 1;
        teamStats[m.hometeam].draws++;
      }
    }

    // Stats extérieur
    if (m.af != null) {
      if (!teamStats[m.awayteam]) {
        teamStats[m.awayteam] = { fouls: 0, points: 0, matches: 0, wins: 0, draws: 0 };
      }
      teamStats[m.awayteam].fouls += m.af;
      teamStats[m.awayteam].matches++;
      
      if (m.ftr === 'A') {
        teamStats[m.awayteam].points += 3;
        teamStats[m.awayteam].wins++;
      } else if (m.ftr === 'D') {
        teamStats[m.awayteam].points += 1;
        teamStats[m.awayteam].draws++;
      }
    }
  });

  // Transformation en données scatter
  const scatterData = Object.entries(teamStats)
    .filter(([, stats]) => stats.matches >= 20) // Minimum 20 matchs
    .map(([team, stats]) => ({
      team,
      x: Math.round((stats.fouls / stats.matches) * 10) / 10, // Fautes moyennes
      y: Math.round((stats.points / stats.matches) * 100) / 100, // Points moyens
      matches: stats.matches
    }));

  // Calcul corrélation simple
  const avgFouls = scatterData.reduce((acc, d) => acc + d.x, 0) / scatterData.length;
  const avgPoints = scatterData.reduce((acc, d) => acc + d.y, 0) / scatterData.length;

  // Ligne de tendance (régression linéaire simplifiée)
  let numerator = 0;
  let denominator = 0;
  scatterData.forEach(d => {
    numerator += (d.x - avgFouls) * (d.y - avgPoints);
    denominator += Math.pow(d.x - avgFouls, 2);
  });
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = avgPoints - slope * avgFouls;

  const minX = Math.min(...scatterData.map(d => d.x));
  const maxX = Math.max(...scatterData.map(d => d.x));

  const trendLine = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept }
  ];

  return {
    scatterData,
    trendLine,
    stats: {
      avgFouls: Math.round(avgFouls * 10) / 10,
      avgPoints: Math.round(avgPoints * 100) / 100,
      correlation: slope > 0 ? "positive" : slope < 0 ? "négative" : "nulle",
      totalTeams: scatterData.length
    }
  };
}
