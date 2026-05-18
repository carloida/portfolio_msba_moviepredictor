import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MovieInputForm, { defaultMovieInput } from "./components/MovieInputForm";
import PredictionResultCard from "./components/PredictionResultCard";
import ScenarioSimulator from "./components/ScenarioSimulator";
import GenreTrendExplorer from "./components/GenreTrendExplorer";
import MethodologySection from "./components/MethodologySection";
import ModelLimitationsCard from "./components/ModelLimitationsCard";
import Footer from "./components/Footer";
import { predictMovie } from "./api";
import type { MovieInput, PredictionResponse } from "./types";

export default function App() {
  const [movieInput, setMovieInput] = useState<MovieInput>(defaultMovieInput);
  const [baselineInput, setBaselineInput] = useState<MovieInput>(defaultMovieInput);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePredict(input: MovieInput) {
    setMovieInput(input);
    setLoading(true);
    setError(null);
    try {
      const result = await predictMovie(input);
      setPrediction(result);
      setBaselineInput(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The backend is unavailable. Check that FastAPI is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <section id="prediction" className="section-shell grid gap-6 py-12 lg:grid-cols-[1.15fr_0.85fr]">
          <MovieInputForm value={movieInput} onChange={setMovieInput} onSubmit={handlePredict} loading={loading} />
          <PredictionResultCard prediction={prediction} loading={loading} error={error} />
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
