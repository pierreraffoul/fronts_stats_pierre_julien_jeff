"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type HalfTimeFullTimeChartProps = {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  stats: {
    total: number;
    wins: number;
    winRate: string;
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
    <div className="space-y-4">
      <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold">Taux de remontada : {stats.winRate}%</p>
        <p className="text-xs mt-1">({stats.wins} remontadas sur {stats.total} matchs menés à la mi-temps)</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
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
    </div>
  );
}

