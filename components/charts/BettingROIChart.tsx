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
  ReferenceLine,
  Cell,
} from "recharts";

type BettingROIChartProps = {
  data: Array<{
    name: string;
    profit: number;
    count: number;
  }>;
};

const COLORS = {
  success: "#10b981",
  danger: "#ef4444",
  neutral: "#737373",
};

export function BettingROIChart({ data }: BettingROIChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
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
          label={{ value: "Profit Cumulé (€)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
          }}
          formatter={(value: number | undefined) => value !== undefined ? `${value}€` : ""}
          labelFormatter={(label) => {
            const entry = data.find(d => d.name === label);
            if (!entry) return label;
            return `${label} | ${entry.count} paris`;
          }}
        />
        <ReferenceLine y={0} stroke={COLORS.neutral} strokeDasharray="3 3" />
        <Bar dataKey="profit" name="Profit Cumulé">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.profit >= 0 ? COLORS.success : COLORS.danger}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

