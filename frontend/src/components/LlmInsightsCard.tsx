import type { LlmInsightRequest, MovieInput, PredictionResponse } from "../types";

type Props = {
  movieInput: MovieInput;
  prediction: PredictionResponse | null;
  insight: string;
  loading: boolean;
  error: string;
  stale: boolean;
  showConfirm: boolean;
  onOpenConfirm: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LlmInsightsCard({
  prediction,
  insight,
  loading,
  error,
  stale,
  showConfirm,
  onOpenConfirm,
  onCancel,
  onConfirm
}: Props) {
  const canGenerate = Boolean(prediction) && !loading;

  return (
    <>
      <section className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-nusOrange">LLM Insights</p>
            <h2 className="mt-2 text-2xl font-bold text-nusNavy">LLM Insights</h2>
          </div>
          <button
            type="button"
            disabled={!canGenerate}
            onClick={onOpenConfirm}
            className="rounded-lg bg-nusNavy px-4 py-2 text-sm font-bold text-white transition hover:bg-[#002f61] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Generate LLM Insights
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {!prediction && (
            <p className="rounded-lg border border-dashed border-line bg-panel p-4 text-sm leading-6 text-muted">
              Run a prediction first to generate LLM insights.
            </p>
          )}

          {prediction && !insight && !loading && !error && (
            <p className="rounded-lg border border-line bg-panel p-4 text-sm leading-6 text-muted">
              Generate a short AI-assisted interpretation of the current movie prediction.
            </p>
          )}

          {loading && (
            <p className="rounded-lg border border-line bg-panel p-4 text-sm font-medium text-muted">
              Generating LLM insights...
            </p>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              <p className="font-semibold">Unable to generate LLM insights. Please check the backend API key, quota, or server logs.</p>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          )}

          {insight && !loading && (
            <div className="rounded-lg border border-line bg-panel p-4">
              <p className="text-sm font-bold text-nusNavy">LLM Insights</p>
              <p className="mt-2 text-sm leading-6 text-muted">{insight}</p>
            </div>
          )}

          {stale && insight && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-800">
              Movie inputs changed. Regenerate insights to reflect the latest prediction.
            </p>
          )}
        </div>
      </section>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="llm-confirm-title">
          <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
            <h3 id="llm-confirm-title" className="text-xl font-bold text-nusNavy">Generate LLM Insights</h3>
            <p className="mt-3 text-sm leading-6 text-muted">This will call the OpenAI API and consume AI tokens. Continue?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-nusNavy transition hover:border-nusOrange hover:text-nusOrange">
                Cancel
              </button>
              <button type="button" onClick={onConfirm} disabled={loading} className="rounded-lg bg-nusOrange px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d96f00] disabled:cursor-not-allowed disabled:opacity-60">
                Generate Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function buildLlmInsightPayload(movieInput: MovieInput, prediction: PredictionResponse, genreTrend: LlmInsightRequest["genreTrend"]): LlmInsightRequest {
  return {
    movieInput: {
      productionBudget: movieInput.production_budget,
      runtime: movieInput.runtime_minutes,
      releaseYear: movieInput.release_year,
      directorAge: movieInput.director_age,
      primaryGenre: movieInput.primary_genre,
      directorProfessions: movieInput.director_professions,
      budgetCategory: calculateBudgetCategory(movieInput.production_budget)
    },
    prediction: {
      hitProbability: prediction.hit_probability,
      classification: prediction.prediction_label,
      threshold: prediction.threshold_used,
      riskLevel: prediction.risk_level,
      modelName: prediction.model_used,
      businessInterpretation: prediction.business_interpretation
    },
    genreTrend,
    projectContext: "Movie Hit Predictor is a portfolio decision-support app for early-stage movie investment screening. The LLM interprets the current model output only and does not change the prediction."
  };
}

function calculateBudgetCategory(budget: number) {
  if (budget < 1_000_000) return "Micro";
  if (budget < 10_000_000) return "Low";
  if (budget < 40_000_000) return "Mid";
  if (budget < 80_000_000) return "UpperMid";
  if (budget < 200_000_000) return "Big";
  return "Mega";
}
