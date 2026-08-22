import { Effect } from "@/components/animate-ui/effect";
import { ScrollScale } from "@/components/animate-ui/scroll-scrub";

export default function Positioning() {
  return (
    <section className="position">
      <div className="shell">
        <div className="meta">
          <span className="idx">02</span>
          <span className="lbl">Our positioning</span>
        </div>
        <ScrollScale asChild>
          <p className="position-quote">
            We don&apos;t optimise isolated channels. We design and operate{" "}
            <span className="hl">growth systems</span> — where performance is predictable, learning is
            continuous, and spend becomes an investment.
          </p>
        </ScrollScale>
        <div className="position-foot">
          <Effect asChild fade slide>
            <p className="position-note">
              From campaigns to growth systems. Every channel supports the same objective; every decision is
              guided by data and accountability.
            </p>
          </Effect>
          <Effect asChild fade slide delay={100}>
            <p className="position-sig">Growth is designed, not guessed.</p>
          </Effect>
        </div>
      </div>
    </section>
  );
}
