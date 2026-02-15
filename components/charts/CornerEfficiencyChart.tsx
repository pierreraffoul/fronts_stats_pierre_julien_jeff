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

type CornerEfficiencyChartProps = {
  data: Array<{
    name: string;
    ratio: number;
    goals: number;
    corners: number;
    matches: number;
  }>;
  avgRatio: number;
};

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];

export function CornerEfficiencyChart({ data, avgRatio }: CornerEfficiencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
        Données de corners (hc/ac) non disponibles dans la base de données.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold">Ratio moyen global : {avgRatio} but/corner</p>
        <p className="text-xs mt-1">Top 5 des équipes les plus efficaces sur coup de pied arrêté</p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 80, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            type="number"
            className="text-xs"
            tick={{ fill: "currentColor" }}
            domain={[0, 'auto']}
          />
          <YAxis
            dataKey="name"
            type="category"
            className="text-xs"
            tick={{ fill: "currentColor" }}
            width={75}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
            }}
            formatter={(value: number | undefined, name: string | undefined, props: any) => {
              const { goals, corners, matches } = props?.payload || {};
              return [
                `${value ?? 0} but/corner`,
                `${goals ?? 0} buts sur ${corners ?? 0} corners (${matches ?? 0} matchs)`
              ];
            }}
          />
          <Bar dataKey="ratio" name="Ratio Buts/Corners" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
              dataKey="ratio"
              position="right"
              className="fill-zinc-700 dark:fill-zinc-300 text-xs font-semibold"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



