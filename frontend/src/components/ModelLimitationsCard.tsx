const limitations = [
  "The model is trained on historical movie data, so it estimates probability rather than certainty.",
  "Marketing spend, distribution strategy, theatrical competition, streaming exposure, and cultural events are not included.",
  "Approval index and vote count are used as early-feedback proxies, but true pre-release deployment should use test-screening results or pre-launch engagement.",
  "Genre trends are historical summaries, not guaranteed forecasts.",
  "Future improvements should add social media signals, plot or script features, cast-marketability features, and periodic retraining as new films are released.",
  "A production version should monitor model drift and refresh the pipeline through scheduled batch updates or MLOps automation."
];

export default function ModelLimitationsCard() {
  return (
    <div className="card overflow-hidden">
      <div className="bg-nusNavy p-5 text-white">
        <h2 className="text-2xl font-bold">Model Limitations</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">
          The tool is designed for screening and scenario discussion, not as a final investment decision.
        </p>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-2">
        {limitations.map((item) => (
          <div key={item} className="rounded-lg border border-line bg-panel p-4 text-sm leading-6 text-muted">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
