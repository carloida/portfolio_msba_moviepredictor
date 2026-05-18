import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts";
import type { PredictionResponse } from "../types";

type Props = {
  prediction: PredictionResponse | null;
  loading: boolean;
  error: string | null;
};

export default function PredictionResultCard({ prediction, loading, error }: Props) {
  const probability = prediction ? Math.round(prediction.hit_probability * 100) : 0;
  const chartData = [{ name: "Probability", value: probability }];

  return (
    <aside className="card flex min-h-[520px] flex-col p-5 sm:p-6">
      <div className="border-b border-line pb-5">
        <h2 className="text-2xl font-bold text-nusNavy">Prediction Result</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Results are calibrated against the model decision threshold, not against guaranteed box office outcomes.
        </p>
      </div>

      {loading && (
        <div className="mt-8 rounded-lg border border-line bg-panel p-5 text-sm font-medium text-muted">
          Running the saved preprocessing and classifier pipeline...
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !prediction && (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-panel p-6 text-center">
          <p className="text-lg font-semibold text-nusNavy">No prediction yet</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Fill the movie profile or choose a sample profile, then run the predictor.
          </p>
        </div>
      )}

      {prediction && !loading && (
        <div className="mt-6 flex flex-1 flex-col gap-5">
          <div className="rounded-lg bg-nusNavy p-6 text-white">
            <p className="text-sm font-semibold text-white/70">Hit probability</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-6xl font-bold">{probability}%</p>
              <span className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-nusNavy">{prediction.prediction_label}</span>
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 12, top: 15, bottom: 10 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                  <LabelList dataKey="value" position="right" formatter={(value: number) => `${value}%`} className="fill-nusNavy text-sm font-bold" />
                  <Cell fill="#EF7C00" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Risk level" value={prediction.risk_level} />
            <Metric label="Decision threshold" value={`${Math.round(prediction.threshold_used * 100)}%`} />
            <Metric label="Model used" value={prediction.model_used} />
            <Metric label="Target" value="Gross margin >= 40%" />
          </div>
          <div className="rounded-lg border border-line bg-panel p-4">
            <p className="text-sm font-semibold text-ink">Business interpretation</p>
            <p className="mt-2 text-sm leading-6 text-muted">{prediction.business_interpretation}</p>
          </div>
          <p className="text-xs leading-5 text-muted">This is a decision-support estimate, not a guaranteed box office forecast.</p>
        </div>
      )}
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
