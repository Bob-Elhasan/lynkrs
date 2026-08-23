const COSTS = [
  {
    n: "01",
    title: "Wasted spend",
    body: "Media runs without a clear brief, so the budget goes out and very little comes back.",
  },
  {
    n: "02",
    title: "Rising costs",
    body: "Nobody checks what the content actually earns, so winning a customer keeps getting dearer.",
  },
  {
    n: "03",
    title: "Starting over",
    body: "SEO chases traffic instead of revenue, and every month begins from scratch.",
  },
  {
    n: "04",
    title: "No room to grow",
    body: "A good month looks great in a report, but there is nothing underneath it to build on.",
  },
];

export default function Problem() {
  return (
    <section className="band" id="problem">
      <div className="shell">
        <div className="meta rv">
          <span className="idx">01</span>
          <span className="lbl">The problem</span>
        </div>
        <div className="head">
          <h2 className="rv">
            Most marketing does not fail because nobody is working hard. It fails because nothing is joined
            up.
          </h2>
          <p className="rv" data-delay="80">
            Different agencies, different targets, and nobody owning the result. You end up paying for that
            in four places at once.
          </p>
        </div>
        <div className="costs">
          {COSTS.map((c, i) => (
            <div className="cost rv" key={c.n} data-delay={i * 70}>
              <span className="n">{c.n}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
        <p className="problem-note rv" data-delay="280">
          Marketing turns into a cost you tolerate instead of an investment you make.
        </p>
      </div>
    </section>
  );
}
