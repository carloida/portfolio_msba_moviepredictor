const sections = [
  {
    title: "Business Problem",
    body: "Movie investment decisions are risky because budget decisions often happen before final revenue is known. This tool provides an early screening layer that estimates whether a movie profile has the characteristics of a financially successful film."
  },
  {
    title: "Target Definition",
    body: "A movie is classified as a Hit when gross margin reaches at least 40%."
  },
  {
    title: "Modeling Approach",
    body: "The portfolio app uses early-stage screening fields such as budget, runtime, genre, timing, and director profile features. Categorical variables are encoded, numeric variables are processed, LASSO-based selection is used to keep the most relevant features, and the final classifier is selected based on validation performance."
  },
  {
    title: "Why Some Fields Are Excluded",
    body: "Worldwide gross, domestic gross, and gross margin are excluded from user input because they represent outcome information. Including them in prediction would defeat the purpose of early-stage screening and may create leakage."
  },
  {
    title: "Practical Use Case",
    body: "The app can support early movie concept screening, investment prioritization, scenario analysis, and portfolio-style comparison of movie profiles."
  }
];

export default function MethodologySection() {
  return (
    <section id="methodology" className="border-y border-line bg-panel py-12">
      <div className="section-shell">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-nusNavy">Methodology</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The app separates historical target creation from user-facing prediction inputs to keep the screening workflow practical.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="card p-5">
              <h3 className="text-lg font-bold text-nusNavy">{section.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{section.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
