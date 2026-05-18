import { ArrowRight, LineChart } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="top" className="border-b border-line bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_56%,#fff4e8_100%)]">
      <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-nusOrange">Portfolio analytics product</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-nusNavy sm:text-5xl lg:text-6xl">
            Movie Hit Predictor
          </h1>
          <p className="mt-5 max-w-2xl text-xl font-medium text-ink">
            An analytics-driven decision support tool for early-stage movie investment screening.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Estimate whether a movie has a strong probability of reaching a profitable gross margin threshold using
            budget, genre, release timing, runtime, and director profile features.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#prediction"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-nusNavy px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#002f61]"
            >
              Try the Predictor <ArrowRight size={18} />
            </a>
            <a
              href="#methodology"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 py-3 text-sm font-semibold text-nusNavy transition hover:border-nusOrange hover:text-nusOrange"
            >
              View Methodology
            </a>
          </div>
        </div>
        <div className="card overflow-hidden bg-white">
          <div className="border-b border-line bg-nusNavy p-5 text-white">
            <div className="flex items-center gap-3">
              <LineChart />
              <div>
                <p className="text-sm text-white/70">Decision support view</p>
                <h2 className="text-xl font-semibold">Investment screening signals</h2>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {[
              ["Target", "Gross margin >= 40%"],
              ["Prediction", "Likely Hit vs Likely Flop"],
              ["Use case", "Early concept screening"],
              ["Trend view", "Historical genre performance"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-line bg-panel p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                <p className="mt-2 text-lg font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
