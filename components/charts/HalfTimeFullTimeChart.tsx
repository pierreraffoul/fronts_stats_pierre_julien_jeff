"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type HalfTimeFullTimeChartProps = {
  data: Array<{
    name: string;
    Victoire: number;
    Nul: number;
    Défaite: number;
  }>;
  stats: {
    total: number;
    victories: number;
    draws: number;
    defeats: number;
  };
};

const COLORS = {
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

export function HalfTimeFullTimeChart({ data, stats }: HalfTimeFullTimeChartProps) {
  if (stats.total === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
        Données de mi-temps (htr) non disponibles dans la base de données.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          type="number"
          domain={[0, 100]}
          className="text-xs"
          tick={{ fill: "currentColor" }}
          label={{ value: "Pourcentage (%)", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          dataKey="name"
          type="category"
          className="text-xs"
          tick={{ fill: "currentColor" }}
          width={150}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
          }}
          formatter={(value: number) => `${value}%`}
        />
        <Legend />
        <Bar dataKey="Victoire" stackId="a" fill={COLORS.success} name="Victoire Finale" />
        <Bar dataKey="Nul" stackId="a" fill={COLORS.warning} name="Match Nul" />
        <Bar dataKey="Défaite" stackId="a" fill={COLORS.danger} name="Défaite Finale" />
      </BarChart>
    </ResponsiveContainer>
  );
}

