import { Effect, Effects } from "@/components/animate-ui/effect";
import { Parallax } from "@/components/animate-ui/scroll-scrub";

const FLOW = [
  "You set the objectives",
  "Lynkrs assesses the situation",
  "We agree on the KPIs together",
  "Lynkrs does whatever it takes to hit them",
];

export default function Partnership() {
  return (
    <section className="partner" id="partner">
      <Parallax speed={0.2} className="orb orb-blue orb-1" aria-hidden="true" />
      <div className="shell">
        <div className="meta">
          <span className="idx">07</span>
          <span className="lbl">Partnership model</span>
        </div>
        <div className="partner-grid">
          <Effect asChild fade slide>
            <div className="partner-copy">
              <h2>We don&apos;t chase volume. We build growth.</h2>
              <p>
                Most agencies work on a strict retainer —{" "}
                <span className="strike">flat rate, service vs. value, rate card</span>. It adds dependencies
                and blockages, so we abolished the model entirely.
              </p>
              <p>We operate as a strategic extension of your team. Here&apos;s how it runs:</p>
            </div>
          </Effect>
          <div className="flow">
            {/* fade + blur only: .flow-step has its own CSS :hover translateX, which a
                Motion-owned transform (from slide/zoom) would permanently override */}
            <Effects asChild fade blur holdDelay={80}>
              {FLOW.map((step, i) => (
                <div className={`flow-step${i === FLOW.length - 1 ? " final" : ""}`} key={step}>
                  <span className="fk"></span>
                  <span>{step}</span>
                </div>
              ))}
            </Effects>
          </div>
        </div>
      </div>
    </section>
  );
}
