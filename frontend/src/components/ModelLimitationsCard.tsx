const limitations = [
  "The model is trained on historical data.",
  "It estimates probability, not certainty.",
  "It does not know future audience behavior unless external future trend data is added.",
  "Genre trends are historical summaries, not guaranteed forecasts.",
  "Streaming behavior, marketing spend, competition, distribution, and cultural events may affect actual performance."
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
