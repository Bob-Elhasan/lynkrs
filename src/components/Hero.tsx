import { Effect } from "@/components/animate-ui/effect";
import { Parallax } from "@/components/animate-ui/scroll-scrub";
import { Magnetic } from "@/components/animate-ui/magnetic";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <Parallax speed={0.3} className="orb orb-blue orb-1" aria-hidden="true" />
      <Parallax speed={-0.2} className="orb orb-paper orb-2" aria-hidden="true" />
      <div className="shell">
        <Effect asChild fade slide inView={false}>
          <div className="hero-top">
            <p className="hero-kick">
              Performance-led growth agency. We turn marketing into a <b>business driver</b>.
            </p>
            <p className="hero-est">
              Strategy · Media · Content · SEO
              <br />— one system —
            </p>
          </div>
        </Effect>
        <Effect asChild fade slide inView={false} delay={100}>
          <h1 className="hero-h1">
            We know a website <span className="lead">matters</span>. But we&apos;re too busy{" "}
            <span className="wm">
              serving
              <span className="annot hand a-how">
                how?
                <svg viewBox="0 0 80 64" fill="none">
                  <path d="M68 8C48 12 22 30 8 56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M8 56l16-4M8 56l4-15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </span>{" "}
            our{" "}
            <span className="wm uline">
              clients
              <svg viewBox="0 0 200 12" preserveAspectRatio="none">
                <path
                  d="M3 7C55 1 150 11 197 4"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 300,
                    strokeDashoffset: 300,
                    animation: "draw 1s .7s cubic-bezier(.4,0,.2,1) forwards",
                  }}
                />
              </svg>
              <span className="annot hand a-who">
                who?
                <svg viewBox="0 0 78 66" fill="none">
                  <path d="M64 58C44 50 18 30 10 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M10 8l16 5M10 8l3 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </span>
            .
          </h1>
        </Effect>
        <Effect asChild fade slide inView={false} delay={200}>
          <div className="hero-foot">
            <p className="hero-lede">
              So the site slips. The marketing fragments. And growth turns into guesswork.
              <br /> <b>We fix that by running growth as one system, not scattered campaigns.</b>
            </p>
            <div className="hero-cta">
              <Magnetic asChild>
                <a className="btn btn-primary" href="#contact">
                  Book a growth audit
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
              <div className="scrollhint">
                <span className="dot">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Scroll to see how
              </div>
            </div>
          </div>
        </Effect>
      </div>
    </section>
  );
}
