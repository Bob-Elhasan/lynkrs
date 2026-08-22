const STEPS = [
  {
    title: "Discovery & diagnosis",
    body: "We map the current state — channels, funnel, revenue structure — before touching a single campaign.",
  },
  {
    title: "Strategy & alignment",
    body: "One objective. Every channel pointed at it, with shared accountability across the board.",
  },
  {
    title: "Execution & testing",
    body: "Media, content and SEO run as a single system — tested and iterated in the open.",
  },
  {
    title: "Continuous optimisation",
    body: "Learning compounds. Nothing runs on autopilot, nothing waits for the quarterly review.",
  },
  {
    title: "Performance & scaling decisions",
    body: "We scale what's proven and cut what isn't — with the numbers on the table.",
  },
];

export default function Method() {
  return (
    <section className="method" id="method">
      <div className="shell">
        <div className="meta">
          <span className="idx">04</span>
          <span className="lbl">How we work</span>
        </div>
        <div className="method-grid">
          <div className="method-intro">
            <div className="sticky rv">
              <h2>Five steps, one system.</h2>
              <p>
                Structured, transparent, goal-oriented and performance-driven — from first diagnosis to the
                decision to scale.
              </p>
            </div>
          </div>
          <div className="steps rv">
            {STEPS.map((s) => (
              <div className="step" key={s.title}>
                <span className="sn"></span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
