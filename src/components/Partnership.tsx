const FLOW = [
  "You set the objectives",
  "We look at where things stand",
  "We agree the numbers together",
  "We do what it takes to hit them",
];

export default function Partnership() {
  return (
    <section className="band" id="partner">
      <div className="shell">
        <div className="meta rv">
          <span className="idx">07</span>
          <span className="lbl">How we work together</span>
        </div>
        <div className="partner-grid">
          <div className="partner-copy">
            <h2 className="rv">We do not chase volume. We build growth.</h2>
            <p className="rv" data-delay="70">
              Most agencies run on a strict retainer.{" "}
              <span className="strike">Flat rate, service against value, a rate card.</span> It creates
              dependencies and bottlenecks, so we got rid of it.
            </p>
            <p className="rv" data-delay="140">
              We work as an extension of your team. Here is how that runs.
            </p>
          </div>
          <div className="flow">
            {FLOW.map((step, i) => (
              <div
                className={`flow-step rv${i === FLOW.length - 1 ? " final" : ""}`}
                key={step}
                data-delay={i * 70}
              >
                <span className="fk">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
