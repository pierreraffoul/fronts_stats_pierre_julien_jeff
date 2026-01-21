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
  radarData: Array<Record<string, number | string>>;
  teamLabels: Array<{
    label: string;
    name: string;
    type: string;
  }>;
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export function HomeAwayRadar({ radarData, teamLabels }: HomeAwayRadarProps) {
  if (radarData.length === 0 || teamLabels.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
        Données insuffisantes pour générer le graphique.
      </div>
    );
  }

  // Extraire les clés des équipes (toutes les clés sauf "subject")
  const teamKeys = radarData.length > 0
    ? Object.keys(radarData[0]).filter((k) => k !== "subject")
    : [];

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
        {teamKeys.map((teamKey, index) => {
          const teamLabel = teamLabels.find((t) => t.label === teamKey);
          return (
            <Radar
              key={teamKey}
              name={teamLabel?.name || teamKey}
              dataKey={teamKey}
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

