"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type EfficiencyScatterPlotProps = {
  scatterData: Array<{ x: number; y: number }>;
  trendLine: Array<{ x: number; y: number }>;
  sampleSize: number;
  totalMatches: number;
};

const COLORS = {
  primary: "#3b82f6",
};

export function EfficiencyScatterPlot({
  scatterData,
  trendLine,
  sampleSize,
  totalMatches,
}: EfficiencyScatterPlotProps) {
  return (
    <div className="space-y-4">
      {totalMatches > sampleSize && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
          <strong>Note :</strong> Affichage de {sampleSize.toLocaleString()} matchs sur {totalMatches.toLocaleString()} disponibles 
          (échantillon pour la lisibilité du graphique). Les calculs de tendance utilisent l'ensemble des données.
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          type="number"
          dataKey="x"
          name="Tirs Cadrés"
          className="text-xs"
          tick={{ fill: "currentColor" }}
          label={{ value: "Tirs Cadrés Domicile", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Buts"
          className="text-xs"
          tick={{ fill: "currentColor" }}
          label={{ value: "Buts Marqués Domicile", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
          }}
          formatter={(value: number, name: string) => [
            `${value}${name === "Buts" ? " buts" : " tirs"}`,
            name,
          ]}
        />
        <Scatter
          name="Matchs"
          data={scatterData}
          fill={COLORS.primary}
          opacity={0.6}
        />
        <Legend />
      </ScatterChart>
    </ResponsiveContainer>
    </div>
  );
}

