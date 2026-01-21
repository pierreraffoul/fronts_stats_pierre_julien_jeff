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
  data: Array<{ x: number; y: number; team?: string }>;
  trendLine: Array<{ x: number; y: number }>;
};

const COLORS = {
  primary: "#3b82f6",
};

export function EfficiencyScatterPlot({
  data,
  trendLine,
}: EfficiencyScatterPlotProps) {
  return (
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
          data={data}
          fill={COLORS.primary}
          opacity={0.6}
        />
        <Scatter
          name="Tendance"
          data={trendLine}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2}
          line
        />
        <Legend />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

