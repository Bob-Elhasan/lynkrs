import Scene, { Step, StepMeta } from "@/components/Scene";

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
    <Scene id="method" className="method" depth="380vh">
      <StepMeta idx="04" label="How we work" />
      <Step from={0.03} to={0.13}>
        <h2 className="scene-h2 tight">Five steps, one system.</h2>
      </Step>

      <div className="scene-steps">
        {STEPS.map((s, i) => {
          const start = 0.18 + i * 0.155;
          return (
            <Step key={s.title} from={start} to={start + 0.1} travel={28}>
              <div className="step">
                <span className="sn">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            </Step>
          );
        })}
      </div>
    </Scene>
  );
}
