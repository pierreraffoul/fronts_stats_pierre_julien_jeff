"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type SeasonalGoalsChartProps = {
  data: Array<{
    name: string;
    fullName: string;
    avgGoals: number;
    matches: number;
  }>;
  stats: {
    maxMonth: string;
    maxAvg: number;
    minMonth: string;
    minAvg: number;
    variation: number;
  };
};

export function SeasonalGoalsChart({ data, stats }: SeasonalGoalsChartProps) {
  const avgOverall = data.reduce((acc, d) => acc + d.avgGoals, 0) / data.filter(d => d.matches > 0).length;

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold">
          Variation : +{stats.variation} buts entre {stats.minMonth} et {stats.maxMonth}
        </p>
        <p className="text-xs mt-1">
          Max : {stats.maxMonth} ({stats.maxAvg} buts/match) | Min : {stats.minMonth} ({stats.minAvg} buts/match)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            dataKey="name"
            className="text-xs"
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "currentColor" }}
            domain={[2, 3.5]}
            label={{ value: "Buts / Match", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`${value} buts/match`, "Moyenne"]}
            labelFormatter={(label) => {
              const entry = data.find(d => d.name === label);
              return entry ? `${entry.fullName} (${entry.matches} matchs)` : label;
            }}
          />
          <ReferenceLine 
            y={Math.round(avgOverall * 100) / 100} 
            stroke="#6366f1" 
            strokeDasharray="5 5"
            label={{ value: `Moy: ${Math.round(avgOverall * 100) / 100}`, position: "right", fill: "#6366f1" }}
          />
          <Line
            type="monotone"
            dataKey="avgGoals"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


