import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { predictMovie, predictScenario } from "../api";
import { displayGenre, formatMoney, genreOptions, imageForGenre } from "../genreAssets";
import type { MovieInput, PredictionResponse, ScenarioResponse } from "../types";

type Props = {
  baselineInput: MovieInput;
  baselinePrediction: PredictionResponse | null;
};

export default function ScenarioSimulator({ baselineInput, baselinePrediction }: Props) {
  const [adjusted, setAdjusted] = useState<MovieInput>(baselineInput);
  const [scenario, setScenario] = useState<ScenarioResponse | null>(null);
  const [timing, setTiming] = useState<Array<{ year: number; probability: number; label: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAdjusted(baselineInput);
    setScenario(null);
  }, [baselineInput]);

  async function runScenario() {
    setLoading(true);
    setError(null);
    try {
      const response = await predictScenario(baselineInput, adjusted);
      setScenario(response);
      const yearResults = await Promise.all(
        [2010, 2015, 2020, 2025, 2030].map(async (year) => {
          const result = await predictMovie({ ...adjusted, release_year: year });
          return {
            year,
            probability: Math.round(result.hit_probability * 100),
            label: year > 2026 ? "Model extrapolation" : "Historical range scenario"
          };
        })
      );
      setTiming(yearResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scenario request failed.");
    } finally {
      setLoading(false);
    }
  }

  const chartData = scenario
    ? [
        { name: "Original", probability: Math.round(scenario.original.hit_probability * 100) },
        { name: "Adjusted", probability: Math.round(scenario.adjusted.hit_probability * 100) }
      ]
    : [];

  return (
    <section id="scenario" className="border-y border-line bg-panel py-12">
      <div className="section-shell">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-nusNavy">Scenario Simulator</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Adjust key assumptions and compare the model response against the original movie profile.
          </p>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="card overflow-hidden">
            <div className="grid md:grid-cols-2">
              <ScenarioImageCard title="Original profile" movie={baselineInput} probability={baselinePrediction?.hit_probability} />
              <ScenarioImageCard title="Adjusted profile" movie={adjusted} probability={scenario?.adjusted.hit_probability} />
            </div>
            <div className="p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Control label="Production Budget" value={adjusted.production_budget} onChange={(next) => setAdjusted({ ...adjusted, production_budget: next })} min={100000} max={250000000} step={100000} />
              <label className="block">
                <span className="field-label">Primary Genre</span>
                <select className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm" value={adjusted.primary_genre} onChange={(e) => setAdjusted({ ...adjusted, primary_genre: e.target.value })}>
                  {genreOptions.map((genre) => <option key={genre}>{displayGenre(genre)}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="field-label">Release Year</span>
                <input className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm" type="number" min={1900} max={2035} value={adjusted.release_year} onChange={(e) => setAdjusted({ ...adjusted, release_year: Number(e.target.value) })} />
              </label>
            </div>
            <button onClick={runScenario} disabled={!baselinePrediction || loading} className="mt-6 w-full rounded-lg bg-nusNavy px-5 py-3 text-sm font-bold text-white transition hover:bg-[#002f61] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Running scenario..." : "Run Scenario"}
            </button>
            {!baselinePrediction && <p className="mt-3 text-xs text-muted">Run the main prediction first to establish an original baseline.</p>}
            </div>
          </div>
          <div className="card p-5">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {!scenario && !error && <p className="rounded-lg border border-dashed border-line bg-panel p-5 text-sm text-muted">Scenario comparison will appear here after a baseline prediction and adjusted run.</p>}
            {scenario && (
              <div className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Metric label="Original" value={`${Math.round(scenario.original.hit_probability * 100)}%`} />
                  <Metric label="Adjusted" value={`${Math.round(scenario.adjusted.hit_probability * 100)}%`} />
                  <Metric label="Change" value={`${scenario.probability_change >= 0 ? "+" : ""}${Math.round(scenario.probability_change * 100)} pts`} />
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="probability" fill="#EF7C00" radius={[8, 8, 0, 0]}>
                        <LabelList dataKey="probability" position="top" formatter={(value: number) => `${value}%`} className="fill-nusNavy text-sm font-bold" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="rounded-lg border border-line bg-panel p-4 text-sm leading-6 text-muted">{scenario.interpretation}</p>
                {timing.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-nusNavy">Market Timing Sensitivity</h3>
                    <div className="mt-3 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timing}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="year" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="probability" fill="#003D7C" radius={[8, 8, 0, 0]}>
                            <LabelList dataKey="probability" position="top" formatter={(value: number) => `${value}%`} className="fill-nusNavy text-sm font-bold" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted">
                      Future-year scenarios show how the trained model responds to release year changes. They do not guarantee future box office trends.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScenarioImageCard({ title, movie, probability }: { title: string; movie: MovieInput; probability?: number }) {
  return (
    <div className="relative min-h-[230px] overflow-hidden border-b border-line md:border-b-0 md:border-r">
      <img src={imageForGenre(movie.primary_genre)} alt={`${displayGenre(movie.primary_genre)} genre artwork`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      <div className="relative z-10 flex min-h-[230px] flex-col justify-end p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{title}</p>
        <h3 className="mt-2 text-2xl font-bold">{displayGenre(movie.primary_genre)}</h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <OverlayMetric label="Year" value={String(movie.release_year)} />
          <OverlayMetric label="Budget" value={formatMoney(movie.production_budget)} />
          <OverlayMetric label="Runtime" value={`${movie.runtime_minutes} min`} />
          <OverlayMetric label="Probability" value={probability === undefined ? "Pending" : `${Math.round(probability * 100)}%`} />
        </div>
      </div>
    </div>
  );
}

function OverlayMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/14 p-3 text-white ring-1 ring-white/25 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function Control({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; step: number }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="mt-3 w-full" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <input className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm" type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-xl font-bold text-nusNavy">{value}</p>
    </div>
  );
}
