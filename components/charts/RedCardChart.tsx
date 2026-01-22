"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

type RedCardChartProps = {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  stats: {
    matchesAtEleven: number;
    matchesWithRed: number;
    dropRateHome: number;
    dropRateAway: number;
  };
};

export function RedCardChart({ data, stats }: RedCardChartProps) {
  if (stats.matchesWithRed === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
        Données de cartons rouges (hr/ar) non disponibles dans la base de données.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold">
          Chute domicile : -{stats.dropRateHome}% | Chute extérieur : -{stats.dropRateAway}%
        </p>
        <p className="text-xs mt-1">
          Comparaison {stats.matchesAtEleven} matchs à 11 vs {stats.matchesWithRed} matchs avec rouge
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            dataKey="name"
            className="text-xs"
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "currentColor" }}
            domain={[0, 60]}
            label={{ value: "Taux de victoire (%)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`${value}%`, "Taux de victoire"]}
          />
          <Bar dataKey="value" name="Taux de victoire" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(value: number) => `${value}%`}
              className="fill-zinc-700 dark:fill-zinc-300 text-sm font-semibold"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
