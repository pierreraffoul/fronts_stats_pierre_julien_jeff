"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ZAxis,
} from "recharts";

type AggressivenessChartProps = {
  data: Array<{
    team: string;
    x: number;
    y: number;
    matches: number;
  }>;
  trendLine: Array<{ x: number; y: number }>;
  stats: {
    avgFouls: number;
    avgPoints: number;
    correlation: string;
    totalTeams: number;
  };
};

export function AggressivenessChart({ data, trendLine, stats }: AggressivenessChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
        Données de fautes (hf/af) non disponibles dans la base de données.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold">
          Corrélation {stats.correlation} | {stats.totalTeams} équipes analysées
        </p>
        <p className="text-xs mt-1">
          Moyenne : {stats.avgFouls} fautes/match → {stats.avgPoints} pts/match
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            dataKey="x"
            type="number"
            name="Fautes/Match"
            className="text-xs"
            tick={{ fill: "currentColor" }}
            domain={['auto', 'auto']}
            label={{ value: "Fautes / Match", position: "bottom", offset: 0 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name="Points/Match"
            className="text-xs"
            tick={{ fill: "currentColor" }}
            domain={['auto', 'auto']}
            label={{ value: "Points / Match", angle: -90, position: "insideLeft" }}
          />
          <ZAxis range={[60, 400]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
                    <p className="font-bold text-sm">{d.team}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {d.x} fautes/match
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {d.y} pts/match
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {d.matches} matchs analysés
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          {/* Ligne de tendance */}
          <Scatter
            data={trendLine}
            line={{ stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "5 5" }}
            shape={() => null}
            isAnimationActive={false}
          />
          {/* Points des équipes */}
          <Scatter
            data={data}
            fill="#6366f1"
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}



