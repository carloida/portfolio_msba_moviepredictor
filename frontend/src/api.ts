import type { GenreTrendResponse, LlmInsightRequest, LlmInsightResponse, ModelInfo, MovieInput, PredictionResponse, ScenarioResponse } from "./types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep the fallback message when the backend returns non-JSON errors.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function predictMovie(input: MovieInput): Promise<PredictionResponse> {
  return request<PredictionResponse>("/predict", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function predictScenario(original: MovieInput, adjusted: MovieInput): Promise<ScenarioResponse> {
  return request<ScenarioResponse>("/predict-scenarios", {
    method: "POST",
    body: JSON.stringify({ original, adjusted })
  });
}

export function getGenreTrends(): Promise<GenreTrendResponse> {
  return request<GenreTrendResponse>("/genre-trends");
}

export function getModelInfo(): Promise<ModelInfo> {
  return request<ModelInfo>("/model-info");
}

export function generateLlmInsights(payload: LlmInsightRequest): Promise<LlmInsightResponse> {
  return request<LlmInsightResponse>("/llm-insights", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
