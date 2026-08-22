import { Effect } from "@/components/animate-ui/effect";
import { ScrollScale, Parallax } from "@/components/animate-ui/scroll-scrub";
import { Magnetic } from "@/components/animate-ui/magnetic";

export default function Closer() {
  return (
    <section className="closer" id="contact">
      <Parallax speed={0.15} className="orb orb-blue orb-1" aria-hidden="true" />
      <div className="shell">
        <Effect asChild fade slide>
          <p className="eyebrow">Ready when you are</p>
        </Effect>
        <ScrollScale asChild>
          <h2>
            Turn marketing spend into <span className="hl">sustainable, scalable</span> growth.
          </h2>
        </ScrollScale>
        <Effect asChild fade slide delay={100}>
          <p className="sub">Tell us the objective. We&apos;ll tell you what it takes — and then we&apos;ll go do it.</p>
        </Effect>
        <Effect asChild fade slide delay={200}>
          <div className="acts">
            <Magnetic asChild>
              <a className="btn btn-onDark" href="#">
                Book a growth audit
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic asChild>
              <a className="btn btn-lineDark" href="#suite">
                Explore the Growth™ Suite
              </a>
            </Magnetic>
          </div>
        </Effect>
      </div>
    </section>
  );
}
