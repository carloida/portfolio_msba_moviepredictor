export type MovieInput = {
  production_budget: number;
  runtime_minutes: number;
  release_year: number;
  director_age: number;
  primary_genre: string;
  director_professions: string;
};

export type PredictionResponse = {
  hit_probability: number;
  prediction: number;
  prediction_label: "Likely Hit" | "Likely Flop";
  threshold_used: number;
  model_used: string;
  risk_level: string;
  business_interpretation: string;
};

export type ScenarioResponse = {
  original: PredictionResponse;
  adjusted: PredictionResponse;
  probability_change: number;
  interpretation: string;
};

export type GenreTrendRecord = {
  primary_genre: string;
  year_group: string;
  year_group_order: number;
  hit_rate: number;
  average_gross_margin: number;
  average_production_budget: number;
  movie_count: number;
};

export type GenreTrendResponse = {
  available: boolean;
  message: string;
  data: GenreTrendRecord[];
};

export type LlmInsightRequest = {
  movieInput: {
    productionBudget: number;
    runtime: number;
    releaseYear: number;
    directorAge: number;
    primaryGenre: string;
    directorProfessions: string;
    budgetCategory: string;
  };
  prediction: {
    hitProbability: number;
    classification: string;
    threshold: number;
    riskLevel: string;
    modelName: string;
    businessInterpretation: string;
  };
  genreTrend?: {
    hitRate: number;
    averageGrossMargin: number;
    averageProductionBudget: number;
    sampleSize: number;
    yearGroup: string;
  };
  projectContext: string;
};

export type LlmInsightResponse = {
  insight: string;
};

export type ModelInfo = {
  model_name: string;
  threshold: number;
  hit_margin_threshold: number;
  numeric_features: string[];
  categorical_features: string[];
};
