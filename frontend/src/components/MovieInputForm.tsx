import { FormEvent } from "react";
import type { ReactNode } from "react";
import { displayGenre, formatMoney, genreOptions, imageForGenre } from "../genreAssets";
import type { MovieInput } from "../types";

export const defaultMovieInput: MovieInput = {
  production_budget: 12_000_000,
  runtime_minutes: 105,
  release_year: 2024,
  director_age: 42,
  primary_genre: "Horror",
  director_professions: "director,writer,producer"
};

const sampleProfiles: Array<{ name: string; input: MovieInput }> = [
  {
    name: "Low-Budget Indie Drama",
    input: {
      production_budget: 1_500_000,
      runtime_minutes: 105,
      release_year: 2024,
      director_age: 38,
      primary_genre: "Drama",
      director_professions: "director,writer"
    }
  },
  {
    name: "Big-Budget Action Film",
    input: {
      production_budget: 150_000_000,
      runtime_minutes: 135,
      release_year: 2024,
      director_age: 50,
      primary_genre: "Action",
      director_professions: "director,producer"
    }
  },
  {
    name: "Mid-Budget Horror Film",
    input: defaultMovieInput
  },
  {
    name: "Animated Family Movie",
    input: {
      production_budget: 80_000_000,
      runtime_minutes: 100,
      release_year: 2024,
      director_age: 45,
      primary_genre: "Animation",
      director_professions: "director,producer"
    }
  }
];

type Props = {
  value: MovieInput;
  onChange: (value: MovieInput) => void;
  onSubmit: (value: MovieInput) => void;
  loading: boolean;
};

function FieldShell({ label, help, children }: { label: string; help: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <div className="mt-2">{children}</div>
      <p className="helper-text">{help}</p>
    </label>
  );
}

export default function MovieInputForm({ value, onChange, onSubmit, loading }: Props) {
  function update<K extends keyof MovieInput>(key: K, next: MovieInput[K]) {
    onChange({ ...value, [key]: next });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <div className="overflow-hidden rounded-lg border border-line bg-nusNavy">
        <div className="relative min-h-[210px]">
          <img src={imageForGenre(value.primary_genre)} alt={`${displayGenre(value.primary_genre)} genre artwork`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
          <div className="relative z-10 flex min-h-[210px] flex-col justify-end p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Movie Hit Prediction</p>
            <h2 className="mt-2 text-3xl font-bold">{displayGenre(value.primary_genre)} profile</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <OverlayMetric label="Release year" value={String(value.release_year)} />
              <OverlayMetric label="Budget" value={formatMoney(value.production_budget)} />
              <OverlayMetric label="Runtime" value={`${value.runtime_minutes} min`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-b border-line pb-5">
        <p className="text-sm leading-6 text-muted">
          Enter information that could reasonably be known before release or at early investment review.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {sampleProfiles.map((profile) => (
          <button
            type="button"
            key={profile.name}
            onClick={() => onChange(profile.input)}
            className="rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-nusNavy transition hover:border-nusOrange hover:bg-white"
          >
            {profile.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <FieldShell label="Production Budget" help="Estimated production cost before box office returns.">
          <div className="flex items-center gap-3">
            <input className="w-full" type="range" min={100000} max={250000000} step={100000} value={value.production_budget} onChange={(e) => update("production_budget", Number(e.target.value))} />
            <input className="w-36 rounded-lg border border-line px-3 py-2 text-sm" type="number" value={value.production_budget} onChange={(e) => update("production_budget", Number(e.target.value))} />
          </div>
        </FieldShell>
        <FieldShell label="Runtime" help="Total movie length.">
          <input className="w-full" type="range" min={60} max={210} value={value.runtime_minutes} onChange={(e) => update("runtime_minutes", Number(e.target.value))} />
          <p className="mt-1 text-sm font-semibold text-nusNavy">{value.runtime_minutes} minutes</p>
        </FieldShell>
        <FieldShell label="Release Year" help="Market timing signal.">
          <input className="w-full rounded-lg border border-line px-3 py-2 text-sm" type="number" min={1900} max={2035} value={value.release_year} onChange={(e) => update("release_year", Number(e.target.value))} />
        </FieldShell>
        <FieldShell label="Director Age" help="Director profile feature.">
          <input className="w-full" type="range" min={20} max={90} value={value.director_age} onChange={(e) => update("director_age", Number(e.target.value))} />
          <p className="mt-1 text-sm font-semibold text-nusNavy">{value.director_age}</p>
        </FieldShell>
        <FieldShell label="Primary Genre" help="Main movie category.">
          <select className="w-full rounded-lg border border-line px-3 py-2 text-sm" value={value.primary_genre} onChange={(e) => update("primary_genre", e.target.value)}>
            {genreOptions.map((genre) => <option key={genre}>{displayGenre(genre)}</option>)}
          </select>
        </FieldShell>
        <FieldShell label="Director Professions" help="Director's professional background.">
          <input className="w-full rounded-lg border border-line px-3 py-2 text-sm" value={value.director_professions} onChange={(e) => update("director_professions", e.target.value)} placeholder="director,writer,producer" />
        </FieldShell>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-nusOrange px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d96f00] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Running prediction..." : "Predict Hit Probability"}
      </button>
    </form>
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
