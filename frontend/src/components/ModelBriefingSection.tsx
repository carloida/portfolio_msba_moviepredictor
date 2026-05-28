import { AlertTriangle, BarChart3, CheckCircle2, Lightbulb, Target } from "lucide-react";

const modelScores = [
  { family: "Glassbox", model: "LogReg Elastic Net, unweighted", validationAuc: "0.8244", selected: true },
  { family: "Glassbox", model: "LogReg L2, unweighted", validationAuc: "0.8240" },
  { family: "Glassbox", model: "LogReg Elastic Net, weighted", validationAuc: "0.8238" },
  { family: "Glassbox", model: "LogReg L2, weighted", validationAuc: "0.8237" },
  { family: "Blackbox", model: "LightGBM weighted", validationAuc: "0.8101" },
  { family: "Blackbox", model: "LightGBM unweighted", validationAuc: "0.8077" }
];

const pipelineSteps = [
  "4,380 films from the Ultimate Film Statistics Dataset",
  "Hit label: gross margin >= 40%",
  "Train / validation / test split: 2,628 / 876 / 876 observations",
  "StandardScaler for numeric fields and OneHotEncoder for categorical fields",
  "LassoCV reduced 286 processed columns to 21 selected predictors"
];

const limitations = [
  "Marketing spend, distribution strategy, competition, streaming exposure, and cultural events are not included.",
  "Approval index and vote count are post-release variables used as proxies for early audience feedback, so a production-grade pre-release model needs better leading indicators.",
  "Historical genre and audience behavior can drift, so the model should be retrained as new films and market patterns emerge."
];

const recommendations = [
  "Add test-screening scores, trailer engagement, pre-launch social sentiment, cast-marketability, and marketing budget data.",
  "Automate periodic retraining and monitoring through an MLOps pipeline.",
  "Keep SHAP or similar explanation tools in the review workflow so model output remains interpretable for green-light discussions."
];

export default function ModelBriefingSection() {
  return (
    <section id="model-briefing" className="border-b border-line bg-white py-12">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-nusOrange">Model selection brief</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-nusNavy sm:text-4xl">
              Why the app uses Elastic-Net Logistic Regression
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              The report compared interpretable logistic regression models against LightGBM using validation ROC-AUC.
              The unweighted Elastic-Net Logistic Regression achieved the highest validation AUC while remaining easy to
              explain, so it was selected as the final classifier.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-panel p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Chosen model</p>
                <p className="mt-2 text-lg font-bold text-nusNavy">Elastic Net</p>
              </div>
              <div className="rounded-lg border border-line bg-panel p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Validation AUC</p>
                <p className="mt-2 text-lg font-bold text-nusNavy">0.8244</p>
              </div>
              <div className="rounded-lg border border-line bg-panel p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Test AUC</p>
                <p className="mt-2 text-lg font-bold text-nusNavy">0.7922</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-5">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 shrink-0 text-nusOrange" size={22} />
                <div>
                  <h3 className="font-bold text-ink">AUC in plain language</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    ROC-AUC measures how well a model ranks likely hits above likely flops across all possible
                    thresholds. A score of 0.5 is close to random ranking; scores closer to 1.0 indicate stronger
                    discrimination before choosing a final decision cutoff.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
              <div className="flex items-center gap-3 border-b border-line bg-nusNavy px-5 py-4 text-white">
                <BarChart3 size={22} />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/65">Validation comparison</p>
                  <h3 className="text-lg font-bold">Models trained and tested</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Family</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3 text-right">Validation AUC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelScores.map((row) => (
                      <tr className={row.selected ? "bg-orange-50" : "border-t border-line"} key={row.model}>
                        <td className="px-4 py-3 font-semibold text-ink">{row.family}</td>
                        <td className="px-4 py-3 text-muted">
                          <span className="inline-flex items-center gap-2">
                            {row.selected ? <CheckCircle2 className="text-nusOrange" size={16} /> : null}
                            {row.model}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-nusNavy">{row.validationAuc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <BriefCard
                icon={<CheckCircle2 className="text-nusOrange" size={22} />}
                items={pipelineSteps}
                title="Validation Design"
              />
              <BriefCard
                icon={<AlertTriangle className="text-nusOrange" size={22} />}
                items={limitations}
                title="Study Limitations"
              />
            </div>

            <BriefCard
              icon={<Lightbulb className="text-nusOrange" size={22} />}
              items={recommendations}
              title="Recommendations to Improve"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BriefCard({ icon, items, title }: { icon: JSX.Element; items: string[]; title: string }) {
  return (
    <article className="rounded-lg border border-line bg-panel p-5">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="font-bold text-nusNavy">{title}</h3>
      </div>
      <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-nusOrange" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
