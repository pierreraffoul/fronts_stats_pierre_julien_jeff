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
} from "recharts";

type GoalsDistributionChartProps = {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  stats: {
    totalMatches: number;
    avgGoals: number;
    mode: string;
  };
};

export function GoalsDistributionChart({ data, stats }: GoalsDistributionChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold">
          Moyenne : {stats.avgGoals} buts/match | Mode : {stats.mode}
        </p>
        <p className="text-xs mt-1">
          Distribution suivant une loi de Poisson (λ ≈ {stats.avgGoals})
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
            label={{ value: "Nombre de matchs", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [
              `${value} matchs (${((value / stats.totalMatches) * 100).toFixed(1)}%)`,
              "Fréquence"
            ]}
          />
          <Bar dataKey="value" name="Nombre de matchs" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value === maxValue ? "#10b981" : "#6366f1"}
                opacity={entry.value === maxValue ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



