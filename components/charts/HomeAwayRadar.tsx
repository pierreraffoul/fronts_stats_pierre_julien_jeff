"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type HomeAwayRadarProps = {
  data: Array<Record<string, number | string>>;
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export function HomeAwayRadar({ data }: HomeAwayRadarProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
        Données insuffisantes pour générer le graphique.
      </div>
    );
  }

  // Extraire les clés des métriques (toutes les clés sauf "subject" et "fullMark")
  const metricKeys = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== "subject" && k !== "fullMark")
    : [];

  // Transformer les données : chaque équipe devient une série sur le radar
  // Chaque point du radar représente une métrique
  const radarData = metricKeys.map((metricKey) => {
    const point: Record<string, number | string> = { subject: metricKey };
    data.forEach((entry) => {
      const teamName = entry.subject as string;
      point[teamName] = entry[metricKey] as number;
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={radarData}>
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
        {data.map((entry, index) => {
          const teamName = entry.subject as string;
          return (
            <Radar
              key={teamName}
              name={teamName}
              dataKey={teamName}
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.3}
            />
          );
        })}
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
  );
}

