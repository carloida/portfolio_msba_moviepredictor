import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getGenreTrends } from "../api";
import type { GenreTrendRecord, MovieInput } from "../types";

type Props = {
  baselineInput: MovieInput;
};

type GenreSummary = {
  genre: string;
  latest?: GenreTrendRecord;
  weightedHitRate: number;
  averageGrossMargin: number;
  averageBudget: number;
  movieCount: number;
};

const DEFAULT_COMPARE_GENRES = ["Horror", "Action", "Drama"];

const genreImageMap: Record<string, string> = {
  Action: "/genre-images/Action.png",
  Adventure: "/genre-images/Adventure.png",
  Animation: "/genre-images/Animation.png",
  Biography: "/genre-images/Biography.png",
  Comedy: "/genre-images/Comedy.png",
  Crime: "/genre-images/Crime.png",
  Documentary: "/genre-images/Documentary.png",
  Drama: "/genre-images/Drama.png",
  Family: "/genre-images/Family.png",
  Fantasy: "/genre-images/Fantasy.png",
  "Film-Noir": "/genre-images/Film-Noir.png",
  History: "/genre-images/History.png",
  Horror: "/genre-images/Horror.png",
  Music: "/genre-images/Music.png",
  Musical: "/genre-images/Musical.png",
  Mystery: "/genre-images/Mystery.png",
  News: "/genre-images/News.png",
  Romance: "/genre-images/Romance.png",
  "Sci-Fi": "/genre-images/Sci-Fi.png",
  Sport: "/genre-images/Sport.png",
  Thriller: "/genre-images/Thriller.png",
  War: "/genre-images/War.png",
  Western: "/genre-images/Western.png",
  "\\N": "/genre-images/Unknown.png",
  Unknown: "/genre-images/Unknown.png"
};

export default function GenreTrendExplorer({ baselineInput }: Props) {
  const [records, setRecords] = useState<GenreTrendRecord[]>([]);
  const [message, setMessage] = useState("Loading genre trend data...");
  const [available, setAvailable] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(baselineInput.primary_genre);
  const [compareGenres, setCompareGenres] = useState<string[]>(DEFAULT_COMPARE_GENRES);

  useEffect(() => {
    getGenreTrends()
      .then((response) => {
        setAvailable(response.available);
        setMessage(response.message);
        setRecords(response.data);
      })
      .catch((err) => {
        setAvailable(false);
        setMessage(err instanceof Error ? err.message : "Unable to load genre trend data.");
      });
  }, []);

  useEffect(() => {
    setSelectedGenre(baselineInput.primary_genre);
  }, [baselineInput.primary_genre]);

  const genres = useMemo(() => Array.from(new Set(records.map((record) => record.primary_genre))).sort(), [records]);
  const data = useMemo(
    () => records.filter((record) => record.primary_genre === selectedGenre).sort((a, b) => a.year_group_order - b.year_group_order),
    [records, selectedGenre]
  );
  const summary = useMemo(() => buildGenreSummary(selectedGenre, data), [data, selectedGenre]);
  const compareSummaries = useMemo(
    () =>
      compareGenres
        .filter((genre) => genres.includes(genre))
        .map((genre) => buildGenreSummary(genre, records.filter((record) => record.primary_genre === genre))),
    [compareGenres, genres, records]
  );

  function toggleCompareGenre(genre: string) {
    setCompareGenres((current) => {
      if (current.includes(genre)) {
        return current.length === 1 ? current : current.filter((item) => item !== genre);
      }
      return [...current, genre].slice(-4);
    });
  }

  return (
    <section id="genre-trends" className="section-shell py-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-nusNavy">Genre Trend Explorer</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The trend explorer shows how a genre has performed historically and how the prediction model responds to release-year scenarios. Future-year results should be interpreted as sensitivity analysis, not a true forecast of future audience demand.
          </p>
        </div>
        <select className="rounded-lg border border-line px-3 py-2 text-sm" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} disabled={!available}>
          {(genres.length ? genres : [selectedGenre]).map((genre) => <option key={genre} value={genre}>{displayGenre(genre)}</option>)}
        </select>
      </div>

      {!available && <div className="mt-6 rounded-lg border border-line bg-panel p-5 text-sm leading-6 text-muted">{message}</div>}

      {available && (
        <div className="mt-6 grid gap-6">
          <GenreFeatureCard summary={summary} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TrendChart title="Hit Rate Over Time" data={data} dataKey="hit_rate" formatter={(value) => `${Math.round(Number(value) * 100)}%`} />
            <TrendChart title="Average Gross Margin" data={data} dataKey="average_gross_margin" formatter={(value) => `${Math.round(Number(value) * 100)}%`} />
            <TrendChart title="Average Production Budget" data={data} dataKey="average_production_budget" formatter={(value) => `$${Math.round(Number(value) / 1_000_000)}M`} />
            <TrendChart title="Number of Movies" data={data} dataKey="movie_count" formatter={(value) => `${value}`} />
          </div>

          <div className="card bg-panel p-5">
            <h3 className="text-lg font-bold text-nusNavy">{displayGenre(selectedGenre)} interpretation</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {selectedGenre === "Horror"
                ? "Horror has historically been attractive because it can achieve profitability with lower production budgets. However, the trend chart should be interpreted as historical evidence, not a guarantee that the genre will remain strong in the future."
                : `${displayGenre(selectedGenre)} performance should be read as historical evidence about budget, margin, and hit-rate patterns. It is useful for screening and sensitivity analysis, but it does not guarantee future audience demand.`}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-nusNavy">Compare Genres</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Select up to four genres to compare side by side. Each card uses the assigned genre artwork and the latest available historical period.
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{compareSummaries.length} selected</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleCompareGenre(genre)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    compareGenres.includes(genre)
                      ? "border-nusOrange bg-nusOrange text-white"
                      : "border-line bg-panel text-nusNavy hover:border-nusOrange hover:bg-white"
                  }`}
                >
                  {displayGenre(genre)}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {compareSummaries.map((item) => (
                <GenreComparisonCard key={item.genre} summary={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function GenreFeatureCard({ summary }: { summary: GenreSummary }) {
  const latest = summary.latest;

  return (
    <article className="relative min-h-[360px] overflow-hidden rounded-lg border border-line bg-nusNavy shadow-soft">
      <img src={imageForGenre(summary.genre)} alt={`${displayGenre(summary.genre)} genre artwork`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
      <div className="relative z-10 flex min-h-[360px] flex-col justify-end p-6 text-white sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">Selected genre</p>
        <h3 className="mt-2 text-4xl font-bold sm:text-5xl">{displayGenre(summary.genre)}</h3>
        <div className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-4">
          <OverlayMetric label="Year group" value={latest?.year_group || "N/A"} />
          <OverlayMetric label="Avg budget" value={formatMoney(latest?.average_production_budget)} />
          <OverlayMetric label="Hit rate" value={formatPercent(latest?.hit_rate)} />
          <OverlayMetric label="Movies" value={latest ? String(latest.movie_count) : "N/A"} />
        </div>
      </div>
    </article>
  );
}

function GenreComparisonCard({ summary }: { summary: GenreSummary }) {
  const latest = summary.latest;

  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="relative h-44 overflow-hidden">
        <img src={imageForGenre(summary.genre)} alt={`${displayGenre(summary.genre)} genre artwork`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h4 className="text-xl font-bold">{displayGenre(summary.genre)}</h4>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/18 px-2 py-1 text-white ring-1 ring-white/25">{latest?.year_group || "N/A"}</span>
            <span className="rounded-full bg-white/18 px-2 py-1 text-white ring-1 ring-white/25">{formatMoney(latest?.average_production_budget)}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        <MiniMetric label="Weighted hit rate" value={formatPercent(summary.weightedHitRate)} />
        <MiniMetric label="Avg margin" value={formatPercent(summary.averageGrossMargin)} />
        <MiniMetric label="Avg budget" value={formatMoney(summary.averageBudget)} />
        <MiniMetric label="Movies" value={String(summary.movieCount)} />
      </div>
    </article>
  );
}

function TrendChart({ title, data, dataKey, formatter }: { title: string; data: GenreTrendRecord[]; dataKey: keyof GenreTrendRecord; formatter: (value: unknown) => string }) {
  return (
    <div className="card p-5">
      <h3 className="text-base font-bold text-nusNavy">{title}</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 18, right: 14, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="year_group" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={55} />
            <YAxis tickFormatter={(value) => formatter(value)} width={70} />
            <Tooltip formatter={(value) => formatter(value)} />
            <Line type="monotone" dataKey={dataKey} stroke="#EF7C00" strokeWidth={3} dot={{ r: 4, fill: "#003D7C" }}>
              <LabelList dataKey={dataKey} position="top" formatter={(value: unknown) => formatter(value)} className="fill-nusNavy text-xs font-bold" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OverlayMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/14 p-4 text-white ring-1 ring-white/25 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-panel p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-nusNavy">{value}</p>
    </div>
  );
}

function buildGenreSummary(genre: string, rows: GenreTrendRecord[]): GenreSummary {
  const sorted = [...rows].sort((a, b) => a.year_group_order - b.year_group_order);
  const movieCount = sorted.reduce((sum, row) => sum + row.movie_count, 0);

  if (!movieCount) {
    return {
      genre,
      weightedHitRate: 0,
      averageGrossMargin: 0,
      averageBudget: 0,
      movieCount: 0
    };
  }

  return {
    genre,
    latest: sorted[sorted.length - 1],
    weightedHitRate: sorted.reduce((sum, row) => sum + row.hit_rate * row.movie_count, 0) / movieCount,
    averageGrossMargin: sorted.reduce((sum, row) => sum + row.average_gross_margin * row.movie_count, 0) / movieCount,
    averageBudget: sorted.reduce((sum, row) => sum + row.average_production_budget * row.movie_count, 0) / movieCount,
    movieCount
  };
}

function imageForGenre(genre: string) {
  return genreImageMap[genre] || genreImageMap.Unknown;
}

function displayGenre(genre: string) {
  return genre === "\\N" ? "Unknown" : genre;
}

function formatPercent(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return `${Math.round(value * 100)}%`;
}

function formatMoney(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  return `$${Math.round(value / 1_000_000)}M`;
}
