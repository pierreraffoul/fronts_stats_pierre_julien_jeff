import type { MatchHistoryRow, Maybe } from "@/types/database";

// Extension du type pour inclure les données de mi-temps
type ExtendedMatchHistoryRow = MatchHistoryRow & {
  htr?: Maybe<string>; // 'H' (Home), 'D' (Draw), 'A' (Away)
  hthg?: Maybe<number>; // Half Time Home Goals
  htag?: Maybe<number>; // Half Time Away Goals
  ast?: Maybe<number>; // Away Shots Target
  as?: Maybe<number>; // Away Shots
};

function safeNumber(n: number | null | undefined, fallback = 0): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * CHAPITRE 1 : L'Illusion du Favori
 * Calcule le ROI global par tranches de cotes en pariant 10€ sur chaque favori
 */
export function calculateBettingROI(matches: MatchHistoryRow[]) {
  const extendedMatches = matches as ExtendedMatchHistoryRow[];
  
  // Fonction pour déterminer la tranche de cote
  function getCoteRange(cote: number): string {
    if (cote < 1.3) return "1.0-1.3";
    if (cote < 1.5) return "1.3-1.5";
    if (cote < 1.8) return "1.5-1.8";
    if (cote < 2.0) return "1.8-2.0";
    if (cote < 2.5) return "2.0-2.5";
    if (cote < 3.0) return "2.5-3.0";
    return "3.0+";
  }

  // Grouper par tranche de cote
  const rangeData: Record<
    string,
    { totalProfit: number; totalBets: number; wins: number }
  > = {};

  extendedMatches.forEach((match) => {
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
      rangeData[range] = { totalProfit: 0, totalBets: 0, wins: 0 };
    }

    const betAmount = 10;
    rangeData[range].totalBets += 1;

    if (favoriteWon) {
      rangeData[range].wins += 1;
      rangeData[range].totalProfit += betAmount * coteFavorite - betAmount; // Gain
    } else {
      rangeData[range].totalProfit -= betAmount; // Perte
    }
  });

  // Convertir en format pour le graphique
  const chartData = Object.entries(rangeData)
    .map(([range, data]) => ({
      range,
      profit: Number(data.totalProfit.toFixed(2)),
      totalBets: data.totalBets,
      winRate: data.totalBets > 0 
        ? Number(((data.wins / data.totalBets) * 100).toFixed(1))
        : 0,
    }))
    .sort((a, b) => {
      // Trier par ordre de cote croissante
      const order = ["1.0-1.3", "1.3-1.5", "1.5-1.8", "1.8-2.0", "2.0-2.5", "2.5-3.0", "3.0+"];
      return order.indexOf(a.range) - order.indexOf(b.range);
    });

  // Calculer les stats globales
  const globalStats = {
    totalBets: chartData.reduce((sum, d) => sum + d.totalBets, 0),
    totalProfit: chartData.reduce((sum, d) => sum + d.profit, 0),
    avgProfitPerBet: 0,
  };
  globalStats.avgProfitPerBet = globalStats.totalBets > 0
    ? Number((globalStats.totalProfit / globalStats.totalBets).toFixed(2))
    : 0;

  return { chartData, globalStats };
}

/**
 * CHAPITRE 2 : La "Remontada" est rare mais prévisible
 * Analyse les matchs où l'équipe à domicile perdait à la mi-temps
 */
export function calculateHalfTimeComebacks(matches: MatchHistoryRow[]) {
  const extendedMatches = matches as ExtendedMatchHistoryRow[];

  // Filtrer les matchs où l'équipe à domicile perdait à la mi-temps
  const matchesLosingAtHT = extendedMatches.filter(
    (m) => m.htr === "A" // Équipe à domicile perdait
  );

  const stats = {
    total: matchesLosingAtHT.length,
    victories: 0,
    draws: 0,
    defeats: 0,
  };

  matchesLosingAtHT.forEach((match) => {
    if (match.ftr === "H") stats.victories++;
    else if (match.ftr === "D") stats.draws++;
    else if (match.ftr === "A") stats.defeats++;
  });

  // Format pour StackedBar horizontal
  const chartData = [
    {
      name: "Matchs perdus à la mi-temps",
      Victoire: stats.total > 0 
        ? Number(((stats.victories / stats.total) * 100).toFixed(1))
        : 0,
      Nul: stats.total > 0
        ? Number(((stats.draws / stats.total) * 100).toFixed(1))
        : 0,
      Défaite: stats.total > 0
        ? Number(((stats.defeats / stats.total) * 100).toFixed(1))
        : 0,
    },
  ];

  return { chartData, stats };
}

/**
 * CHAPITRE 3 : Dominer n'est pas Gagner (L'Efficacité)
 * Scatter plot : Tirs Cadrés vs Buts Marqués
 */
export function calculateEfficiencyData(matches: MatchHistoryRow[]) {
  const extendedMatches = matches as ExtendedMatchHistoryRow[];

  // Filtrer les matchs avec des données valides
  const validMatches = extendedMatches.filter(
    (m) => safeNumber(m.hst) > 0 && safeNumber(m.fthg) >= 0
  );

  // Utiliser tous les matchs disponibles (ou un échantillon si trop nombreux pour la performance)
  // Pour un scatter plot, on peut utiliser jusqu'à 2000 points sans problème de performance
  const maxPoints = 2000;
  let sampled = validMatches;
  if (validMatches.length > maxPoints) {
    // Prendre un échantillon aléatoire si trop de données
    const shuffled = [...validMatches].sort(() => Math.random() - 0.5);
    sampled = shuffled.slice(0, maxPoints);
  }

  const scatterData = sampled.map((match) => ({
    x: safeNumber(match.hst),
    y: safeNumber(match.fthg),
  }));

  // Calculer la ligne de tendance moyenne (régression simple) sur TOUS les matchs valides
  const allScatterData = validMatches.map((match) => ({
    x: safeNumber(match.hst),
    y: safeNumber(match.fthg),
  }));
  const n = allScatterData.length;
  const sumX = allScatterData.reduce((acc, d) => acc + d.x, 0);
  const sumY = allScatterData.reduce((acc, d) => acc + d.y, 0);
  const sumXY = allScatterData.reduce((acc, d) => acc + d.x * d.y, 0);
  const sumX2 = allScatterData.reduce((acc, d) => acc + d.x * d.x, 0);

  const slope = n > 0 && sumX2 > 0 
    ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    : 0;
  const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

  // Générer des points pour la ligne de tendance
  const maxX = Math.max(...scatterData.map((d) => d.x), 0);
  const trendLine = [
    { x: 0, y: intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];

  return { 
    scatterData, 
    trendLine, 
    sampleSize: sampled.length,
    totalMatches: validMatches.length 
  };
}

/**
 * CHAPITRE 4 : La Forteresse Domicile
 * Compare 3 équipes types selon leur performance domicile/extérieur
 */
export function calculateHomeAwayComparison(matches: MatchHistoryRow[]) {
  const extendedMatches = matches as ExtendedMatchHistoryRow[];

  // Calculer les stats pour toutes les équipes
  const teamStats: Record<
    string,
    {
      homeMatches: number;
      homeWins: number;
      homeGoals: number;
      awayMatches: number;
      awayWins: number;
      awayGoals: number;
    }
  > = {};

  extendedMatches.forEach((match) => {
    const homeTeam = match.hometeam;
    const awayTeam = match.awayteam;
    const homeGoals = safeNumber(match.fthg);
    const awayGoals = safeNumber(match.ftag);

    // Stats domicile
    if (!teamStats[homeTeam]) {
      teamStats[homeTeam] = {
        homeMatches: 0,
        homeWins: 0,
        homeGoals: 0,
        awayMatches: 0,
        awayWins: 0,
        awayGoals: 0,
      };
    }
    teamStats[homeTeam].homeMatches += 1;
    if (match.ftr === "H") teamStats[homeTeam].homeWins += 1;
    teamStats[homeTeam].homeGoals += homeGoals;

    // Stats extérieur
    if (!teamStats[awayTeam]) {
      teamStats[awayTeam] = {
        homeMatches: 0,
        homeWins: 0,
        homeGoals: 0,
        awayMatches: 0,
        awayWins: 0,
        awayGoals: 0,
      };
    }
    teamStats[awayTeam].awayMatches += 1;
    if (match.ftr === "A") teamStats[awayTeam].awayWins += 1;
    teamStats[awayTeam].awayGoals += awayGoals;
  });

  // Sélectionner 3 équipes types :
  // 1. Très forte à domicile (ratio victoires domicile élevé)
  // 2. Équilibrée (bonne performance partout)
  // 3. Faible à domicile (meilleure à l'extérieur)
  const teamsWithStats = Object.entries(teamStats)
    .map(([team, stats]) => {
      const homeWinRate = stats.homeMatches > 0
        ? stats.homeWins / stats.homeMatches
        : 0;
      const awayWinRate = stats.awayMatches > 0
        ? stats.awayWins / stats.awayMatches
        : 0;
      const homeGoalAvg = stats.homeMatches > 0
        ? stats.homeGoals / stats.homeMatches
        : 0;
      const awayGoalAvg = stats.awayMatches > 0
        ? stats.awayGoals / stats.awayMatches
        : 0;

      return {
        team,
        homeWinRate,
        awayWinRate,
        homeGoalAvg,
        awayGoalAvg,
        totalMatches: stats.homeMatches + stats.awayMatches,
        homeAdvantage: homeWinRate - awayWinRate,
      };
    })
    .filter((t) => t.totalMatches >= 30); // Au moins 30 matchs pour être significatif

  // Trier et sélectionner les 3 types
  const sortedByHomeAdvantage = [...teamsWithStats].sort(
    (a, b) => b.homeAdvantage - a.homeAdvantage
  );
  const sortedByBalance = [...teamsWithStats].sort(
    (a, b) => Math.abs(a.homeWinRate - a.awayWinRate) - Math.abs(b.homeWinRate - b.awayWinRate)
  );
  const sortedByAwayAdvantage = [...teamsWithStats].sort(
    (a, b) => a.homeAdvantage - b.homeAdvantage
  );

  const selectedTeams = [
    sortedByHomeAdvantage[0], // Très forte à domicile
    sortedByBalance[0], // Équilibrée
    sortedByAwayAdvantage[0], // Faible à domicile
  ].filter(Boolean);

  // Format pour RadarChart
  const radarData = [
    {
      subject: "Victoires Domicile (%)",
      ...selectedTeams.reduce((acc, team, idx) => {
        acc[`Équipe ${idx + 1}`] = Number((team.homeWinRate * 100).toFixed(1));
        return acc;
      }, {} as Record<string, number>),
    },
    {
      subject: "Victoires Extérieur (%)",
      ...selectedTeams.reduce((acc, team, idx) => {
        acc[`Équipe ${idx + 1}`] = Number((team.awayWinRate * 100).toFixed(1));
        return acc;
      }, {} as Record<string, number>),
    },
    {
      subject: "Buts Domicile (moy)",
      ...selectedTeams.reduce((acc, team, idx) => {
        acc[`Équipe ${idx + 1}`] = Number(team.homeGoalAvg.toFixed(2));
        return acc;
      }, {} as Record<string, number>),
    },
    {
      subject: "Buts Extérieur (moy)",
      ...selectedTeams.reduce((acc, team, idx) => {
        acc[`Équipe ${idx + 1}`] = Number(team.awayGoalAvg.toFixed(2));
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  const teamLabels = selectedTeams.map((team, idx) => ({
    label: `Équipe ${idx + 1}`,
    name: team.team.length > 20 ? team.team.substring(0, 20) + "..." : team.team,
    type: idx === 0 ? "Forte à domicile" : idx === 1 ? "Équilibrée" : "Faible à domicile",
  }));

  return { radarData, teamLabels };
}

