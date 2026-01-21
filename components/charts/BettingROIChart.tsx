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
    range: string;
    profit: number;
    totalBets: number;
    winRate: number;
  }>;
  globalStats: {
    totalBets: number;
    totalProfit: number;
    avgProfitPerBet: number;
  };
};

const COLORS = {
  success: "#10b981",
  danger: "#ef4444",
  neutral: "#737373",
};

export function BettingROIChart({ data, globalStats }: BettingROIChartProps) {
  return (
    <div className="space-y-4">
      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="text-center">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total de paris</div>
          <div className="mt-1 text-2xl font-bold">{globalStats.totalBets.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Profit total</div>
          <div className={`mt-1 text-2xl font-bold ${globalStats.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {globalStats.totalProfit >= 0 ? '+' : ''}{globalStats.totalProfit.toFixed(2)}€
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Profit moyen/paris</div>
          <div className={`mt-1 text-2xl font-bold ${globalStats.avgProfitPerBet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {globalStats.avgProfitPerBet >= 0 ? '+' : ''}{globalStats.avgProfitPerBet.toFixed(2)}€
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            dataKey="range"
            className="text-xs"
            tick={{ fill: "currentColor" }}
            label={{ value: "Tranche de cote du favori", position: "insideBottom", offset: -5 }}
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
              const entry = data.find(d => d.range === label);
              return `Cote: ${label} | ${entry?.totalBets || 0} paris | ${entry?.winRate || 0}% réussite`;
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
    </div>
  );
}

