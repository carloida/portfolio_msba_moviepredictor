import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getGenreTrends } from "../api";
import type { GenreTrendRecord, MovieInput } from "../types";

type Props = {
  baselineInput: MovieInput;
};

export default function GenreTrendExplorer({ baselineInput }: Props) {
  const [records, setRecords] = useState<GenreTrendRecord[]>([]);
  const [message, setMessage] = useState("Loading genre trend data...");
  const [available, setAvailable] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(baselineInput.primary_genre);

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
          {(genres.length ? genres : [selectedGenre]).map((genre) => <option key={genre}>{genre}</option>)}
        </select>
      </div>

      {!available && <div className="mt-6 rounded-lg border border-line bg-panel p-5 text-sm leading-6 text-muted">{message}</div>}

      {available && (
        <div className="mt-6 grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <TrendChart title="Hit Rate Over Time" data={data} dataKey="hit_rate" formatter={(value) => `${Math.round(Number(value) * 100)}%`} />
            <TrendChart title="Average Gross Margin" data={data} dataKey="average_gross_margin" formatter={(value) => `${Math.round(Number(value) * 100)}%`} />
            <TrendChart title="Average Production Budget" data={data} dataKey="average_production_budget" formatter={(value) => `$${Math.round(Number(value) / 1_000_000)}M`} />
            <TrendChart title="Number of Movies" data={data} dataKey="movie_count" formatter={(value) => `${value}`} />
          </div>
          <div className="card bg-panel p-5">
            <h3 className="text-lg font-bold text-nusNavy">{selectedGenre} interpretation</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {selectedGenre === "Horror"
                ? "Horror has historically been attractive because it can achieve profitability with lower production budgets. However, the trend chart should be interpreted as historical evidence, not a guarantee that the genre will remain strong in the future."
                : `${selectedGenre} performance should be read as historical evidence about budget, margin, and hit-rate patterns. It is useful for screening and sensitivity analysis, but it does not guarantee future audience demand.`}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function TrendChart({ title, data, dataKey, formatter }: { title: string; data: GenreTrendRecord[]; dataKey: keyof GenreTrendRecord; formatter: (value: unknown) => string }) {
  return (
    <div className="card p-5">
      <h3 className="text-base font-bold text-nusNavy">{title}</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
