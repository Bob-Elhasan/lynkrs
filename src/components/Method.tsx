import { Effect } from "@/components/animate-ui/effect";
import { ScrollFill } from "@/components/animate-ui/scroll-scrub";
import { MethodStep } from "@/components/MethodStep";

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
            <Effect asChild fade slide>
              <div className="sticky">
                <h2>Five steps, one system.</h2>
                <p>
                  Structured, transparent, goal-oriented and performance-driven — from first diagnosis to the
                  decision to scale.
                </p>
              </div>
            </Effect>
          </div>
          <div className="steps">
            <div className="timeline-track" aria-hidden="true" />
            <ScrollFill className="timeline-fill" />
            {STEPS.map((s, i) => (
              <MethodStep key={s.title} index={i} title={s.title} body={s.body} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
