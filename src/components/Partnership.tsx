const FLOW = [
  "You set the objectives",
  "Lynkrs assesses the situation",
  "We agree on the KPIs together",
  "Lynkrs does whatever it takes to hit them",
];

export default function Partnership() {
  return (
    <section className="partner" id="partner">
      <div className="shell">
        <div className="meta">
          <span className="idx">07</span>
          <span className="lbl">Partnership model</span>
        </div>
        <div className="partner-grid">
          <div className="partner-copy rv">
            <h2>We don&apos;t chase volume. We build growth.</h2>
            <p>
              Most agencies work on a strict retainer —{" "}
              <span className="strike">flat rate, service vs. value, rate card</span>. It adds dependencies
              and blockages, so we abolished the model entirely.
            </p>
            <p>We operate as a strategic extension of your team. Here&apos;s how it runs:</p>
          </div>
          <div className="flow">
            {FLOW.map((step, i) => (
              <div className={`flow-step stg${i === FLOW.length - 1 ? " final" : ""}`} key={step}>
                <span className="fk"></span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
