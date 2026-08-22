const COSTS = [
  {
    n: "COST 01",
    title: "Reduced efficiency",
    body: "Media spend runs without strategic direction — budget out the door, little to show for it.",
  },
  {
    n: "COST 02",
    title: "Inflated CAC",
    body: "Content gets produced with no performance feedback, so acquisition costs climb instead of fall.",
  },
  {
    n: "COST 03",
    title: "Slow learning",
    body: "SEO chases traffic, not revenue. Every month effectively restarts from zero.",
  },
];

export default function Problem() {
  return (
    <section className="problem" id="problem">
      <div className="shell">
        <div className="meta">
          <span className="idx">01</span>
          <span className="lbl">The problem</span>
        </div>
        <div className="problem-head">
          <h2 className="rv">
            Most marketing doesn&apos;t fail from lack of activity. It fails from fragmentation.
          </h2>
          <p className="rv">
            Different agencies, different objectives, no shared accountability. The hidden cost shows up
            everywhere at once.
          </p>
        </div>
        <div className="costs rv">
          {COSTS.map((c) => (
            <div className="cost" key={c.n}>
              <span className="n">{c.n}</span>
              <span className="plus">+</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
          <div className="cost wide">
            <span className="n">THE RESULT</span>
            <h3>Marketing becomes a cost — not an investment.</h3>
            <p>Short-term wins with no system underneath. Nothing compounds, nothing scales.</p>
          </div>
          <div className="cost">
            <span className="n">COST 04</span>
            <span className="plus">+</span>
            <h3>Limited scalability</h3>
            <p>Spikes look good in a report, but there&apos;s no infrastructure to carry them to the next stage.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
