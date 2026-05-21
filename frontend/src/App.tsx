import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MovieInputForm, { defaultMovieInput } from "./components/MovieInputForm";
import PredictionResultCard from "./components/PredictionResultCard";
import LlmInsightsCard, { buildLlmInsightPayload } from "./components/LlmInsightsCard";
import ScenarioSimulator from "./components/ScenarioSimulator";
import GenreTrendExplorer from "./components/GenreTrendExplorer";
import MethodologySection from "./components/MethodologySection";
import ModelLimitationsCard from "./components/ModelLimitationsCard";
import Footer from "./components/Footer";
import { generateLlmInsights, getGenreTrends, predictMovie } from "./api";
import type { GenreTrendRecord, LlmInsightRequest, MovieInput, PredictionResponse } from "./types";

export default function App() {
  const [movieInput, setMovieInput] = useState<MovieInput>(defaultMovieInput);
  const [baselineInput, setBaselineInput] = useState<MovieInput>(defaultMovieInput);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genreTrendRecords, setGenreTrendRecords] = useState<GenreTrendRecord[]>([]);
  const [showLlmConfirm, setShowLlmConfirm] = useState(false);
  const [llmInsight, setLlmInsight] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState("");
  const [insightStale, setInsightStale] = useState(false);

  useEffect(() => {
    getGenreTrends()
      .then((response) => {
        if (response.available) {
          setGenreTrendRecords(response.data);
        }
      })
      .catch(() => {
        setGenreTrendRecords([]);
      });
  }, []);

  const currentGenreTrend = useMemo(() => {
    return buildCurrentGenreTrendContext(genreTrendRecords, baselineInput.primary_genre);
  }, [genreTrendRecords, baselineInput.primary_genre]);

  function handleMovieInputChange(nextInput: MovieInput) {
    setMovieInput(nextInput);
    if (llmInsight) {
      setInsightStale(true);
    }
  }

  async function handlePredict(input: MovieInput) {
    setMovieInput(input);
    setLoading(true);
    setError(null);
    try {
      const result = await predictMovie(input);
      setPrediction(result);
      setBaselineInput(input);
      if (llmInsight) {
        setInsightStale(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The backend is unavailable. Check that FastAPI is running.");
    } finally {
      setLoading(false);
    }
  }

  async function generateLlmInsight() {
    if (!prediction) {
      return;
    }

    setLlmLoading(true);
    setLlmError("");

    try {
      const payload = buildLlmInsightPayload(baselineInput, prediction, currentGenreTrend);
      const data = await generateLlmInsights(payload);
      setLlmInsight(data.insight);
      setInsightStale(false);
    } catch (err) {
      setLlmError(err instanceof Error ? err.message : "Failed to generate LLM insight.");
    } finally {
      setLlmLoading(false);
      setShowLlmConfirm(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <section id="prediction" className="section-shell grid gap-6 py-12 lg:grid-cols-[1.15fr_0.85fr]">
          <MovieInputForm value={movieInput} onChange={handleMovieInputChange} onSubmit={handlePredict} loading={loading} />
          <div className="grid gap-6">
            <PredictionResultCard movieInput={movieInput} prediction={prediction} loading={loading} error={error} />
            <LlmInsightsCard
              movieInput={baselineInput}
              prediction={prediction}
              insight={llmInsight}
              loading={llmLoading}
              error={llmError}
              stale={insightStale}
              showConfirm={showLlmConfirm}
              onOpenConfirm={() => setShowLlmConfirm(true)}
              onCancel={() => setShowLlmConfirm(false)}
              onConfirm={generateLlmInsight}
            />
          </div>
        </section>
        <ScenarioSimulator baselineInput={baselineInput} baselinePrediction={prediction} />
        <GenreTrendExplorer baselineInput={baselineInput} />
        <MethodologySection />
        <section id="about" className="section-shell py-12">
          <ModelLimitationsCard />
        </section>
      </main>
      <Footer />
    </div>
  );
}

function buildCurrentGenreTrendContext(records: GenreTrendRecord[], genre: string): LlmInsightRequest["genreTrend"] {
  const rows = records
    .filter((record) => record.primary_genre === genre)
    .sort((a, b) => a.year_group_order - b.year_group_order);

  const latest = rows[rows.length - 1];
  if (!latest) {
    return undefined;
  }

  return {
    hitRate: latest.hit_rate,
    averageGrossMargin: latest.average_gross_margin,
    averageProductionBudget: latest.average_production_budget,
    sampleSize: latest.movie_count,
    yearGroup: latest.year_group
  };
}
