import { AlertTriangle, BarChart3, CheckCircle2, Info } from "lucide-react";
import { budgetDistributionData, type BudgetDistributionStats } from "../data/budgetDistribution";
import { displayGenre, formatMoney } from "../genreAssets";

type BudgetContext = {
  stats: BudgetDistributionStats;
  source: "genre-year" | "genre-all" | "global-year" | "global-all";
  yearGroup: string;
};

type Props = {
  budget: number;
  genre: string;
  releaseYear: number;
};

const maxVisualBudget = budgetDistributionData.binEdges[budgetDistributionData.binEdges.length - 1];

export default function BudgetDistributionCard({ budget, genre, releaseYear }: Props) {
  const context = selectBudgetContext(genre, releaseYear);
  const status = budgetStatus(budget, context.stats);
  const maxCount = Math.max(...context.stats.histogram, 1);
  const markerPosition = budgetPosition(budget);
  const typicalStart = budgetPosition(context.stats.p10);
  const typicalEnd = budgetPosition(context.stats.p90);
  const iqrStart = budgetPosition(context.stats.p25);
  const iqrEnd = budgetPosition(context.stats.p75);

  return (
    <section className="rounded-lg border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <BarChart3 className="h-5 w-5 shrink-0 text-nusOrange" />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-nusNavy">Budget context for {displayGenre(genre)}</h3>
            <p className="text-xs leading-5 text-muted">
              {sourceLabel(context.source)} - {context.yearGroup} - n={context.stats.sampleSize}
            </p>
          </div>
        </div>
        <StatusBadge tone={status.tone} text={status.label} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-lg border border-line bg-white p-3">
          <div className="relative h-16 border-b border-line">
            <div
              className="absolute bottom-0 top-0 rounded bg-orange-100"
              style={{ left: `${typicalStart * 100}%`, width: `${Math.max((typicalEnd - typicalStart) * 100, 1)}%` }}
            />
            <div
              className="absolute bottom-0 top-0 rounded bg-orange-200"
              style={{ left: `${iqrStart * 100}%`, width: `${Math.max((iqrEnd - iqrStart) * 100, 1)}%` }}
            />
            <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1">
              {context.stats.histogram.map((count, index) => (
                <div className="flex flex-1 items-end" key={`${index}-${count}`}>
                  <div
                    className="w-full rounded-t bg-slate-300"
                    style={{ height: `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 0)}%` }}
                    title={`${formatMoney(budgetDistributionData.binEdges[index])} to ${formatMoney(budgetDistributionData.binEdges[index + 1])}: ${count} films`}
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 top-0 w-0.5 bg-nusNavy" style={{ left: `${markerPosition * 100}%` }}>
              <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-nusNavy ring-4 ring-white" />
            </div>
          </div>

          <div className="mt-2 flex justify-between text-[10px] font-semibold text-muted">
            <span>{formatMoney(budgetDistributionData.binEdges[0])}</span>
            <span>{formatMoney(1_000_000)}</span>
            <span>{formatMoney(10_000_000)}</span>
            <span>{formatMoney(100_000_000)}</span>
            <span>{formatMoney(maxVisualBudget)}+</span>
          </div>
        </div>

        <div className="grid content-start gap-2 sm:grid-cols-2">
          <Metric label="Budget" value={formatMoney(budget)} />
          <Metric label="Median" value={formatMoney(context.stats.p50)} />
          <Metric label="Middle 50%" value={`${formatMoney(context.stats.p25)}-${formatMoney(context.stats.p75)}`} />
          <Metric label="Typical" value={`${formatMoney(context.stats.p10)}-${formatMoney(context.stats.p90)}`} />
        </div>
      </div>

      <div className={`mt-3 rounded-lg border px-3 py-2 ${status.panelClass}`}>
        <div className="flex items-start gap-2">
          {status.tone === "ok" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          )}
          <p className="text-xs leading-5 text-muted">
            <span className="font-semibold text-ink">{status.title}.</span> {status.shortMessage}
            {context.source !== "genre-year" ? (
              <>
                {" "}
                <Info className="mb-0.5 inline h-3.5 w-3.5 text-blue-700" /> Sparse genre/year data, using{" "}
                {sourceLabel(context.source).toLowerCase()}.
              </>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}

function selectBudgetContext(genre: string, releaseYear: number): BudgetContext {
  const normalizedGenre = genre === "\\N" ? "Unknown" : genre;
  const yearGroup = yearGroupFor(releaseYear);
  const genreMap = budgetDistributionData.genres as Record<string, (typeof budgetDistributionData.genres)[keyof typeof budgetDistributionData.genres]>;
  const genreStats = genreMap[normalizedGenre];
  const genreYearGroups = genreStats?.yearGroups as Record<string, BudgetDistributionStats> | undefined;
  const genreYear = genreYearGroups?.[yearGroup];

  if (genreYear && genreYear.sampleSize >= budgetDistributionData.minimumYearGroupSample) {
    return { stats: genreYear, source: "genre-year", yearGroup };
  }

  if (genreStats?.allYears && genreStats.allYears.sampleSize >= budgetDistributionData.minimumGenreSample) {
    return { stats: genreStats.allYears, source: "genre-all", yearGroup: "all years" };
  }

  const globalYear = budgetDistributionData.global.yearGroups[yearGroup];
  if (globalYear && globalYear.sampleSize >= budgetDistributionData.minimumYearGroupSample) {
    return { stats: globalYear, source: "global-year", yearGroup };
  }

  return { stats: budgetDistributionData.global.allYears, source: "global-all", yearGroup: "all years" };
}

function budgetStatus(budget: number, stats: BudgetDistributionStats) {
  if (budget < stats.p10) {
    return {
      label: "Below usual range",
      title: "Budget is unusually low",
      shortMessage: `Below the historical 10th percentile (${formatMoney(stats.p10)}).`,
      tone: "warn" as const,
      panelClass: "border-amber-200 bg-amber-50"
    };
  }

  if (budget > stats.p90) {
    return {
      label: "Above usual range",
      title: "Budget is unusually high",
      shortMessage: `Above the historical 90th percentile (${formatMoney(stats.p90)}).`,
      tone: "warn" as const,
      panelClass: "border-amber-200 bg-amber-50"
    };
  }

  return {
    label: "Within typical range",
    title: "Budget is in the historical range",
    shortMessage: `Inside the 10th-90th percentile range; median is around ${formatMoney(stats.p50)}.`,
    tone: "ok" as const,
    panelClass: "border-emerald-200 bg-emerald-50"
  };
}

function yearGroupFor(year: number) {
  if (year < 2000) return "Before 2000";
  if (year <= 2004) return "2000-2004";
  if (year <= 2009) return "2005-2009";
  if (year <= 2014) return "2010-2014";
  if (year <= 2019) return "2015-2019";
  return "2020 onwards";
}

function budgetPosition(value: number) {
  return clamp(
    (Math.log10(clamp(value, 100_000, maxVisualBudget)) - Math.log10(100_000)) /
      (Math.log10(maxVisualBudget) - Math.log10(100_000)),
    0,
    1
  );
}

function sourceLabel(source: BudgetContext["source"]) {
  switch (source) {
    case "genre-year":
      return "Genre + year band";
    case "genre-all":
      return "Genre all years";
    case "global-year":
      return "All genres in year band";
    default:
      return "All films";
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function StatusBadge({ text, tone }: { text: string; tone: "ok" | "warn" }) {
  return (
    <span
      className={`max-w-[8.5rem] rounded-full px-3 py-1 text-[10px] font-bold uppercase leading-4 tracking-wide ${
        tone === "ok" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {text}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-ink">{value}</p>
    </div>
  );
}
