"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  homeTeam: string;
  awayTeam: string;
  homeAtt: number;
  awayAtt: number;
  homeDef: number;
  awayDef: number;
};

export function AttackDefenseChart({
  homeTeam,
  awayTeam,
  homeAtt,
  awayAtt,
  homeDef,
  awayDef,
}: Props) {
  const data = [
    { metric: "Attaque", home: homeAtt, away: awayAtt },
    { metric: "Défense", home: homeDef, away: awayDef },
  ];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="metric" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={32}
            domain={[0, "dataMax"]}
          />
          <Tooltip
            cursor={{ opacity: 0.12 }}
            formatter={(value: unknown) =>
              typeof value === "number" ? value.toFixed(2) : `${value}`
            }
          />
          <Legend />
          <Bar name={homeTeam} dataKey="home" fill="#0f172a" radius={[6, 6, 0, 0]} />
          <Bar name={awayTeam} dataKey="away" fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


