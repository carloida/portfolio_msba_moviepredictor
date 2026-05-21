# Movie Hit Predictor

Movie Hit Predictor is a full-stack analytics portfolio application for early-stage movie investment screening. It estimates whether a movie profile has a strong probability of reaching a profitable gross margin threshold using budget, runtime, genre, release timing, and director profile features.

## Overview

The project is designed as a professional NUS MSBA portfolio product. It combines a React dashboard frontend with a Python FastAPI machine learning backend. The frontend is Vercel-ready, while the ML backend is designed for Render, Railway, Fly.io, or Hugging Face Spaces.

## Business Problem

Movie investment decisions are risky because budget and concept decisions often happen before final revenue is known. This tool provides an early screening layer that supports investment prioritization, scenario analysis, and commercial review.

## Target Definition

The model target is based on gross margin:

```text
gross_margin = (Worldwide gross $ - Production budget $) / Production budget $
```

A movie is classified as a Hit when:

```text
gross_margin >= 0.40
```

Worldwide gross, domestic gross, and gross margin are not collected in the prediction form because they are outcome variables.

## Model Pipeline Summary

The backend loads `backend/model/movie_hit_model_package.joblib` once at startup. The package is expected to contain:

- `best_model`
- `best_model_name`
- `best_threshold`
- `preprocessor`
- `selected_indices`
- `selected_features`
- `numeric_features`
- `categorical_features`
- `hit_margin_threshold`

Prediction flow:

1. Receive raw movie input from the frontend.
2. Convert input into a pandas DataFrame using the exact training column names.
3. Apply the saved preprocessor.
4. Keep selected columns using `selected_indices`.
5. Run `best_model.predict_proba()`.
6. Compare the hit probability against `best_threshold`.
7. Return probability, classification, risk level, model name, threshold, and business interpretation.

## Input Features

User-facing inputs:

- Production Budget
- Runtime
- Release Year
- Director Age
- Primary Genre
- Director Professions

Budget Category is calculated automatically from Production Budget.

The saved model package was originally trained with audience signal columns. The current API does not expose those fields to users because they may be unavailable or leakage-prone for early-stage screening. Until the model is retrained without them, the backend fills neutral default values internally to keep the saved preprocessing pipeline compatible.

## Output Explanation

The prediction endpoint returns:

- Hit probability
- Likely Hit or Likely Flop
- Decision threshold used
- Model used
- Risk level
- Business interpretation

Risk levels:

- `>= 0.70`: Strong candidate
- `>= threshold and < 0.70`: Moderate candidate
- `< threshold and >= 0.35`: Borderline / needs caution
- `< 0.35`: High risk

## Genre Trend Explorer

The Genre Trend Explorer uses `backend/data/movie_statistic_dataset.csv` when available. It computes historical genre-level summaries by year group:

- Hit rate
- Average gross margin
- Average production budget
- Number of movies

This module is historical trend analysis and sensitivity testing. It does not guarantee future audience demand.

## Important Limitations

- The model is trained on historical data.
- It estimates probability, not certainty.
- It does not know future audience behavior unless external future trend data is added.
- Genre trends are historical summaries, not guaranteed forecasts.
- Streaming behavior, marketing spend, competition, distribution, and cultural events may affect actual performance.

## Run Backend Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at `http://localhost:8000`.

## Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` from `frontend/.env.example`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

## Deploy Frontend to Vercel

1. Push project to GitHub.
2. Import the `frontend` folder into Vercel.
3. Set build command:
   ```text
   npm run build
   ```
4. Set output directory:
   ```text
   dist
   ```
5. Add environment variable:
   ```text
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

## Deploy Backend to Render

1. Create a new Web Service.
2. Connect GitHub repo.
3. Set root directory to `backend`.
4. Set build command:
   ```text
   pip install -r requirements.txt
   ```
5. Set start command:
   ```text
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. Add environment variable:
   ```text
   FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
   ```
7. Make sure `movie_hit_model_package.joblib` is inside `backend/model/`.

## Deploy Backend to Railway

1. Create new project from GitHub.
2. Set root directory to `backend`.
3. Use the `Procfile`.
4. Add environment variable:
   ```text
   FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
   ```
5. Make sure `movie_hit_model_package.joblib` is inside `backend/model/`.

## Environment Variables

Frontend:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Backend:

```text
FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
OPENAI_API_KEY=your_api_key_here
```

## LLM Insights Environment Setup

The LLM Insights feature is served by the FastAPI backend. The frontend never calls OpenAI directly and does not need an OpenAI API key.

Local backend setup:

Save the OpenAI API key in:

```text
backend/.env
```

with:

```text
OPENAI_API_KEY=your_api_key_here
```

For this local Codex workspace, the same API key value can be copied from the QRM project file:

```text
C:\Users\carlo\Documents\Codex\2026-05-21\you-are-working-on-my-github\portfolio_msba_QRMportfolio\.env.local
```

The key itself must not be committed, printed, or hard coded.

Frontend setup:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Backend deployment:

- Render: add `OPENAI_API_KEY` in backend service environment variables.
- Railway: add `OPENAI_API_KEY` in backend service variables.
- Fly.io: run `fly secrets set OPENAI_API_KEY=...`.
- Hugging Face Spaces: add `OPENAI_API_KEY` in repository secrets.

Vercel frontend:

Do not add `OPENAI_API_KEY` to Vercel. Only add:

```text
VITE_API_BASE_URL=https://your-backend-url.com
```

Security warning:

- Do not use `VITE_OPENAI_API_KEY`.
- Do not hard code API keys.
- Do not commit `backend/.env`.

## Folder Structure

```text
movie-hit-predictor/
  backend/
    main.py
    requirements.txt
    Procfile
    runtime.txt
    model/
      movie_hit_model_package.joblib
    data/
      movie_statistic_dataset.csv
  frontend/
    package.json
    tailwind.config.js
    postcss.config.js
    index.html
    vercel.json
    .env.example
    src/
      api.ts
      types.ts
      App.tsx
      main.tsx
      index.css
      components/
```

## Portfolio Positioning

This app demonstrates a practical business analytics workflow: define a financially meaningful target, prevent leakage by excluding outcome variables from user input, deploy a trained model behind a clear API, and present results as decision support rather than certainty.
