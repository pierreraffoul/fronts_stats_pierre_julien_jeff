"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type DrawAnomalyChartProps = {
  data: Array<{
    name: string;
    drawRate: number;
    total: number;
  }>;
  avgDrawRate: number;
};

export function DrawAnomalyChart({ data, avgDrawRate }: DrawAnomalyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
        Données de saison non disponibles.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <defs>
          <linearGradient id="drawGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tick={{ fill: "currentColor" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "currentColor" }}
          domain={[0, 40]}
          label={{ value: "% de Matchs Nuls", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value}%`, "Taux de nuls"]}
          labelFormatter={(label) => {
            const entry = data.find(d => d.name === label);
            return entry ? `${label} (${entry.total} matchs)` : label;
          }}
        />
        <ReferenceLine 
          y={avgDrawRate} 
          stroke="#ef4444" 
          strokeDasharray="5 5" 
          label={{ value: `Moy: ${avgDrawRate}%`, position: "right", fill: "#ef4444" }}
        />
        <Area
          type="monotone"
          dataKey="drawRate"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#drawGradient)"
          name="Taux de nuls"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}



