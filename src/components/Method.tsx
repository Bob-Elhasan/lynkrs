const STEPS = [
  {
    title: "Find out where you actually are",
    body: "We map your channels, your funnel and where the money really comes from, before touching a single campaign.",
  },
  {
    title: "Agree on one goal",
    body: "Everything points at the same number, and everyone owns it together.",
  },
  {
    title: "Build and test in the open",
    body: "Media, content and SEO run as one. You see what we are trying and what it did.",
  },
  {
    title: "Keep sharpening it",
    body: "What we learn this month shapes the next one. Nothing sits on autopilot.",
  },
  {
    title: "Decide what to scale",
    body: "We back what is working and stop what is not, with the numbers on the table.",
  },
];

export default function Method() {
  return (
    <section className="band band-tint" id="method">
      <div className="shell">
        <div className="meta rv">
          <span className="idx">04</span>
          <span className="lbl">How we work</span>
        </div>
        <div className="method-grid">
          <div className="method-intro">
            <h2 className="rv">Five steps, one system.</h2>
            <p className="rv" data-delay="80">
              Clear, open and pointed at a result. From the first look at your numbers to the call on what
              to scale.
            </p>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div className="step rv" key={s.title} data-delay={i * 70}>
                <span className="sn">{String(i + 1).padStart(2, "0")}</span>
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
