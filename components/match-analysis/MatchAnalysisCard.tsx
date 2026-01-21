import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AITrainingDataRow, MatchHistoryRow } from "@/types/database";
import { AttackDefenseChart } from "./AttackDefenseChart";

function initials(team: string) {
  const cleaned = (team ?? "").trim();
  if (!cleaned) return "??";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? cleaned[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] : cleaned[1];
  return `${first}${second ?? ""}`.toUpperCase();
}

function formatDateFr(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function safeNumber(n: number | null | undefined, fallback = 0) {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function pickFavoriteIndex(cotes: Array<number | null>) {
  const numeric = cotes.map((c) => (typeof c === "number" && c > 0 ? c : Infinity));
  const min = Math.min(...numeric);
  if (!Number.isFinite(min) || min === Infinity) return -1;
  return numeric.findIndex((v) => v === min);
}

type Props = {
  match: AITrainingDataRow;
  h2h: MatchHistoryRow[];
};

export function MatchAnalysisCard({ match, h2h }: Props) {
  const homePts = safeNumber(match.home_forme_pts_last5, 0);
  const awayPts = safeNumber(match.away_forme_pts_last5, 0);
  const total = Math.max(1, homePts + awayPts);
  const homeShare = Math.round((homePts / total) * 100);

  const homeBadgeVariant = homePts > 10 ? "success" : "secondary";
  const awayBadgeVariant = awayPts > 10 ? "success" : "secondary";

  const cotes = [match.cote_dom_clean, match.cote_nul_clean, match.cote_ext_clean];
  const favoriteIdx = pickFavoriteIndex(cotes);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">{initials(match.hometeam)}</Avatar>
              <Avatar className="h-10 w-10 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                {initials(match.awayteam)}
              </Avatar>
            </div>
            <div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Match</div>
              <div className="text-base font-semibold">
                {match.hometeam} <span className="text-zinc-400">vs</span>{" "}
                {match.awayteam}
              </div>
            </div>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatDateFr(match.date)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-6">
        {/* B. Baromètre de forme */}
        <section className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Baromètre de forme (5 matchs)</div>
            <div className="flex items-center gap-2">
              <Badge variant={homeBadgeVariant}>{homePts}/15 pts</Badge>
              <Badge variant={awayBadgeVariant}>{awayPts}/15 pts</Badge>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>{match.hometeam}</span>
              <span>{match.awayteam}</span>
            </div>
            <Progress value={homeShare} />
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{homeShare}% domicile</span>
              <span>{100 - homeShare}% extérieur</span>
            </div>
          </div>
        </section>

        {/* C. Attaque/Défense */}
        <section className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Comparateur Attaque / Défense</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Moyennes sur les 5 derniers matchs
            </div>
          </div>
          <AttackDefenseChart
            homeTeam={match.hometeam}
            awayTeam={match.awayteam}
            homeAtt={safeNumber(match.home_moy_buts_marques_last5)}
            awayAtt={safeNumber(match.away_moy_buts_marques_last5)}
            homeDef={safeNumber(match.home_moy_buts_encaisse_last5)}
            awayDef={safeNumber(match.away_moy_buts_encaisse_last5)}
          />
        </section>

        {/* D. Cotes */}
        <section className="grid gap-2">
          <div className="text-sm font-semibold">Cotes (1 / N / 2)</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "1", value: match.cote_dom_clean },
              { label: "N", value: match.cote_nul_clean },
              { label: "2", value: match.cote_ext_clean },
            ].map((c, idx) => {
              const isFav = idx === favoriteIdx;
              const v = typeof c.value === "number" && Number.isFinite(c.value) ? c.value : null;
              return (
                <div
                  key={c.label}
                  className={[
                    "rounded-lg border p-3",
                    isFav
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/25"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
                  ].join(" ")}
                >
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">{c.label}</div>
                  <div className="mt-1 text-lg font-semibold">
                    {v === null ? "—" : v.toFixed(2)}
                  </div>
                  {isFav && (
                    <div className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      Favori
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {favoriteIdx === -1 && (
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Cotes indisponibles ou incomplètes.
            </div>
          )}
        </section>

        {/* E. H2H */}
        <section className="grid gap-2">
          <div className="text-sm font-semibold">Historique H2H (3 derniers)</div>

          {h2h.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
              Aucune confrontation trouvée entre ces deux équipes.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Domicile</TableHead>
                  <TableHead>Extérieur</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {h2h.map((row, i) => (
                  <TableRow key={`${row.date}-${row.hometeam}-${row.awayteam}-${i}`}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateFr(row.date)}
                    </TableCell>
                    <TableCell>{row.hometeam}</TableCell>
                    <TableCell>{row.awayteam}</TableCell>
                    <TableCell className="text-right font-medium">
                      {safeNumber(row.fthg, 0)} - {safeNumber(row.ftag, 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </CardContent>
    </Card>
  );
}


