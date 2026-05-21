import os
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "movie_hit_model_package.joblib"
DATA_PATH = BASE_DIR / "data" / "movie_statistic_dataset.csv"
load_dotenv(BASE_DIR / ".env")
# Compatibility defaults for leakage-prone fields retained by the saved pipeline.
# These are training-set means, so the hidden fields have near-zero standardized contribution.
DEFAULT_AVERAGE_RATING = 6.39745053
DEFAULT_NUMBER_OF_VOTES = 134_867.648
DEFAULT_APPROVAL_INDEX = 5.01504091


app = FastAPI(
    title="Movie Hit Predictor API",
    description="FastAPI backend for early-stage movie investment screening.",
    version="1.0.0",
)


allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
frontend_origin = os.getenv("FRONTEND_ORIGIN")
if frontend_origin:
    allowed_origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model_package: Optional[Dict[str, Any]] = None
model_load_error: Optional[str] = None


def load_model_package() -> None:
    global model_package, model_load_error
    try:
        if not MODEL_PATH.exists():
            model_load_error = f"Model file not found at {MODEL_PATH}"
            model_package = None
            return
        model_package = joblib.load(MODEL_PATH)
        model_load_error = None
    except Exception as exc:
        model_package = None
        model_load_error = f"Failed to load model package: {exc}"


@app.on_event("startup")
def startup_event() -> None:
    load_model_package()


def calculate_budget_category(budget: float) -> str:
    if budget < 1_000_000:
        return "Micro"
    if budget < 10_000_000:
        return "Low"
    if budget < 40_000_000:
        return "Mid"
    if budget < 80_000_000:
        return "UpperMid"
    if budget < 200_000_000:
        return "Big"
    return "Mega"


class PredictionInput(BaseModel):
    production_budget: float = Field(..., ge=0)
    runtime_minutes: float = Field(..., ge=1)
    movie_averageRating: float = Field(DEFAULT_AVERAGE_RATING, ge=0, le=10)
    movie_numerOfVotes: float = Field(DEFAULT_NUMBER_OF_VOTES, ge=0)
    approval_Index: float = Field(DEFAULT_APPROVAL_INDEX, ge=0)
    release_year: int = Field(..., ge=1880, le=2100)
    director_age: float = Field(..., ge=0, le=120)
    primary_genre: str
    director_professions: str


class PredictionResponse(BaseModel):
    hit_probability: float
    prediction: int
    prediction_label: str
    threshold_used: float
    model_used: str
    risk_level: str
    business_interpretation: str


class ScenarioRequest(BaseModel):
    original: PredictionInput
    adjusted: PredictionInput


class LlmMovieInput(BaseModel):
    productionBudget: Optional[float] = None
    runtime: Optional[float] = None
    releaseYear: Optional[int] = None
    directorAge: Optional[float] = None
    primaryGenre: Optional[str] = None
    directorProfessions: Optional[Union[str, List[str]]] = None
    budgetCategory: Optional[str] = None


class LlmPredictionOutput(BaseModel):
    hitProbability: Optional[float] = None
    classification: Optional[str] = None
    threshold: Optional[float] = None
    riskLevel: Optional[str] = None
    modelName: Optional[str] = None
    businessInterpretation: Optional[str] = None


class LlmGenreTrendContext(BaseModel):
    hitRate: Optional[float] = None
    averageGrossMargin: Optional[float] = None
    averageProductionBudget: Optional[float] = None
    sampleSize: Optional[int] = None
    yearGroup: Optional[str] = None


class LlmInsightsRequest(BaseModel):
    movieInput: LlmMovieInput
    prediction: LlmPredictionOutput
    genreTrend: Optional[LlmGenreTrendContext] = None
    projectContext: Optional[str] = None


class LlmInsightsResponse(BaseModel):
    insight: str


def ensure_model_loaded() -> Dict[str, Any]:
    if model_package is None:
        raise HTTPException(
            status_code=503,
            detail=model_load_error or "Model package is not loaded.",
        )
    return model_package


def to_training_dataframe(movie: PredictionInput) -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "Production budget $": movie.production_budget,
                "runtime_minutes": movie.runtime_minutes,
                "movie_averageRating": movie.movie_averageRating,
                "movie_numerOfVotes": movie.movie_numerOfVotes,
                "approval_Index": movie.approval_Index,
                "release_year": movie.release_year,
                "director_age": movie.director_age,
                "primary_genre": movie.primary_genre,
                "budget_category": calculate_budget_category(movie.production_budget),
                "director_professions": movie.director_professions,
            }
        ]
    )


def risk_level_for(probability: float, threshold: float) -> str:
    if probability >= 0.70:
        return "Strong candidate"
    if probability >= threshold:
        return "Moderate candidate"
    if probability >= 0.35:
        return "Borderline / needs caution"
    return "High risk"


def interpretation_for(probability: float, threshold: float) -> str:
    if probability >= 0.70:
        return (
            "This movie profile shows a strong probability of reaching the target gross margin. "
            "It may be worth deeper commercial review, especially if marketing, distribution, "
            "and release timing are favorable."
        )
    if probability >= threshold:
        return (
            "This movie profile clears the model threshold, but the margin of confidence is moderate. "
            "It should be reviewed alongside marketing reach, competitive releases, and distribution plans."
        )
    if probability >= 0.35:
        return (
            "This movie profile is close to the decision boundary. It may need a tighter budget, stronger market evidence, "
            "or a clearer release strategy before moving forward."
        )
    return (
        "This movie profile appears high risk under the current model. The expected hit probability is low, "
        "so the investment case would need strong external evidence to justify further commitment."
    )


def run_prediction(movie: PredictionInput) -> PredictionResponse:
    package = ensure_model_loaded()
    input_df = to_training_dataframe(movie)

    try:
        preprocessor = package["preprocessor"]
        selected_indices = package["selected_indices"]
        best_model = package["best_model"]
        best_threshold = float(package["best_threshold"])

        input_processed = preprocessor.transform(input_df)
        input_lasso = input_processed[:, selected_indices]
        hit_probability = float(best_model.predict_proba(input_lasso)[:, 1][0])
        prediction = int(hit_probability >= best_threshold)
    except KeyError as exc:
        raise HTTPException(status_code=500, detail=f"Model package missing key: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    return PredictionResponse(
        hit_probability=round(hit_probability, 4),
        prediction=prediction,
        prediction_label="Likely Hit" if prediction else "Likely Flop",
        threshold_used=round(best_threshold, 4),
        model_used=str(package.get("best_model_name", "Unknown model")),
        risk_level=risk_level_for(hit_probability, best_threshold),
        business_interpretation=interpretation_for(hit_probability, best_threshold),
    )


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok" if model_package is not None else "degraded",
        "model_loaded": model_package is not None,
        "message": model_load_error,
    }


@app.get("/model-info")
def model_info() -> Dict[str, Any]:
    package = ensure_model_loaded()
    return {
        "model_name": package.get("best_model_name"),
        "threshold": package.get("best_threshold"),
        "hit_margin_threshold": package.get("hit_margin_threshold"),
        "numeric_features": package.get("numeric_features", []),
        "categorical_features": package.get("categorical_features", []),
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(movie: PredictionInput) -> PredictionResponse:
    return run_prediction(movie)


@app.post("/predict-scenarios")
def predict_scenarios(request: ScenarioRequest) -> Dict[str, Any]:
    original = run_prediction(request.original)
    adjusted = run_prediction(request.adjusted)
    delta = adjusted.hit_probability - original.hit_probability
    if delta > 0.03:
        interpretation = "The adjusted profile improves the model-estimated hit probability."
    elif delta < -0.03:
        interpretation = (
            "The adjusted profile reduces the model-estimated hit probability, suggesting the changes "
            "may need a stronger commercial rationale or a tighter investment case."
        )
    else:
        interpretation = "The adjusted profile has limited impact on the model-estimated hit probability."

    return {
        "original": original.dict(),
        "adjusted": adjusted.dict(),
        "probability_change": round(delta, 4),
        "interpretation": interpretation,
    }


def build_llm_prompt(request: LlmInsightsRequest) -> str:
    compact_summary = {
        "movieInput": request.movieInput.dict(exclude_none=True),
        "prediction": request.prediction.dict(exclude_none=True),
        "genreTrend": request.genreTrend.dict(exclude_none=True) if request.genreTrend else None,
        "projectContext": request.projectContext,
    }

    return (
        "You are interpreting the output of a movie hit prediction machine learning model.\n\n"
        "Write exactly 5 sentences.\n\n"
        "Project context:\n"
        "This is a Movie Hit Predictor portfolio project for early-stage movie investment screening. "
        "The model estimates whether a movie profile has a strong probability of reaching a profitable gross margin threshold. "
        "A movie is classified as a Hit when gross margin is at least 0.40. "
        "The model uses features such as production budget, runtime, release timing, genre, and director profile. "
        "The LLM should only interpret the current prediction output and should not change the model result.\n\n"
        "Current movie input and model output:\n"
        f"{json.dumps(compact_summary, indent=2)}\n\n"
        "Requirements:\n"
        "1. Use a clear, grounded business analytics tone.\n"
        "2. Explain what the current prediction implies for movie investment screening.\n"
        "3. Mention probability, risk level, threshold, and uncertainty if relevant.\n"
        "4. Do not claim that the movie will definitely be a hit or flop.\n"
        "5. Do not invent numbers or facts not provided in the model output.\n"
        "6. Do not recommend changing the prediction result.\n"
        "7. Keep the output to exactly 5 sentences."
    )


@app.post("/llm-insights", response_model=LlmInsightsResponse)
def llm_insights(request: LlmInsightsRequest) -> LlmInsightsResponse:
    if not request.prediction or request.prediction.hitProbability is None:
        raise HTTPException(status_code=400, detail="Prediction output is required.")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured.")

    try:
        client = OpenAI(api_key=api_key)
        response = client.responses.create(
            model="gpt-5.4-mini",
            input=build_llm_prompt(request),
            temperature=0.2,
            max_output_tokens=220,
        )
    except Exception as exc:
        print(f"OpenAI insight generation failed: {type(exc).__name__}")
        raise HTTPException(status_code=502, detail="Unable to generate LLM insights. Please check the backend API key, quota, or server logs.") from exc

    insight = getattr(response, "output_text", "").strip()
    if not insight:
        raise HTTPException(status_code=502, detail="Unable to generate LLM insights. Please check the backend API key, quota, or server logs.")

    return LlmInsightsResponse(insight=insight)


def infer_release_year(df: pd.DataFrame) -> Optional[pd.Series]:
    candidates = ["release_year", "Release year", "year", "Year", "title_year"]
    for candidate in candidates:
        if candidate in df.columns:
            return pd.to_numeric(df[candidate], errors="coerce")

    date_candidates = ["release_date", "Release date", "releaseDate", "Movie release date", "production_date"]
    for candidate in date_candidates:
        if candidate in df.columns:
            return pd.to_datetime(df[candidate], errors="coerce").dt.year
    return None


def parse_money_column(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str).str.replace(r"[$,]", "", regex=True).str.strip(),
        errors="coerce",
    )


def year_group(year: float) -> str:
    if pd.isna(year):
        return "Unknown"
    year_int = int(year)
    if year_int < 2000:
        return "Before 2000"
    if year_int <= 2004:
        return "2000 to 2004"
    if year_int <= 2009:
        return "2005 to 2009"
    if year_int <= 2014:
        return "2010 to 2014"
    if year_int <= 2019:
        return "2015 to 2019"
    return "2020 onwards"


@app.get("/genre-trends")
def genre_trends() -> Dict[str, Any]:
    if not DATA_PATH.exists():
        return {
            "available": False,
            "message": f"Historical dataset not found at {DATA_PATH}. Trend analysis requires backend/data/movie_statistic_dataset.csv.",
            "data": [],
        }

    try:
        df = pd.read_csv(DATA_PATH)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset: {exc}") from exc

    required = ["genres", "Worldwide gross $", "Production budget $"]
    missing = [column for column in required if column not in df.columns]
    if missing:
        return {
            "available": False,
            "message": f"Trend analysis requires missing columns: {', '.join(missing)}.",
            "data": [],
        }

    release_year = infer_release_year(df)
    if release_year is None:
        return {
            "available": False,
            "message": "Trend analysis requires a release year field or a release date that can be parsed.",
            "data": [],
        }

    working = df.copy()
    working["release_year"] = release_year
    working["primary_genre"] = (
        working["genres"]
        .fillna("Unknown")
        .astype(str)
        .str.split(",")
        .str[0]
        .str.strip()
        .replace("", "Unknown")
    )
    working["Production budget $"] = parse_money_column(working["Production budget $"])
    working["Worldwide gross $"] = parse_money_column(working["Worldwide gross $"])
    working = working[(working["Production budget $"] > 0) & working["Worldwide gross $"].notna()]
    working["gross_margin"] = (
        working["Worldwide gross $"] - working["Production budget $"]
    ) / working["Production budget $"]
    working["is_hit"] = working["gross_margin"] >= 0.40
    working["year_group"] = working["release_year"].apply(year_group)
    working = working[working["year_group"] != "Unknown"]

    grouped = (
        working.groupby(["primary_genre", "year_group"], dropna=False)
        .agg(
            hit_rate=("is_hit", "mean"),
            average_gross_margin=("gross_margin", "mean"),
            average_production_budget=("Production budget $", "mean"),
            movie_count=("is_hit", "size"),
        )
        .reset_index()
    )

    order = {
        "Before 2000": 0,
        "2000 to 2004": 1,
        "2005 to 2009": 2,
        "2010 to 2014": 3,
        "2015 to 2019": 4,
        "2020 onwards": 5,
    }
    grouped["year_group_order"] = grouped["year_group"].map(order)
    grouped = grouped.sort_values(["primary_genre", "year_group_order"])

    records: List[Dict[str, Any]] = []
    for row in grouped.to_dict(orient="records"):
        records.append(
            {
                "primary_genre": row["primary_genre"],
                "year_group": row["year_group"],
                "year_group_order": int(row["year_group_order"]),
                "hit_rate": round(float(row["hit_rate"]), 4),
                "average_gross_margin": round(float(row["average_gross_margin"]), 4),
                "average_production_budget": round(float(row["average_production_budget"]), 2),
                "movie_count": int(row["movie_count"]),
            }
        )

    return {
        "available": True,
        "message": "Historical genre trends loaded successfully.",
        "data": records,
    }
