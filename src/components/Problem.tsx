import Scene, { Step, StepMeta, StepRule } from "@/components/Scene";

const COSTS = [
  {
    n: "COST 01",
    title: "Reduced efficiency",
    body: "Media spend runs without strategic direction — budget out the door, little to show for it.",
  },
  {
    n: "COST 02",
    title: "Inflated CAC",
    body: "Content gets produced with no performance feedback, so acquisition costs climb instead of fall.",
  },
  {
    n: "COST 03",
    title: "Slow learning",
    body: "SEO chases traffic, not revenue. Every month effectively restarts from zero.",
  },
  {
    n: "COST 04",
    title: "Limited scalability",
    body: "Spikes look good in a report, but there's no infrastructure to carry them to the next stage.",
  },
];

export default function Problem() {
  return (
    <Scene id="problem" className="problem" depth="340vh">
      <StepMeta idx="01" label="The problem" />
      <Step from={0.04} to={0.16}>
        <h2 className="scene-h2">
          Most marketing doesn&apos;t fail from lack of activity. It fails from fragmentation.
        </h2>
      </Step>
      <StepRule from={0.16} to={0.26} />
      <Step from={0.2} to={0.3}>
        <p className="scene-lede">
          Different agencies, different objectives, no shared accountability. The hidden cost shows up
          everywhere at once.
        </p>
      </Step>

      {/* Each cost is dealt out by a further slice of the scroll. */}
      <div className="scene-costs">
        {COSTS.map((c, i) => {
          const start = 0.36 + i * 0.13;
          return (
            <Step key={c.n} from={start} to={start + 0.09} travel={26}>
              <div className="cost">
                <span className="n">{c.n}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </Step>
          );
        })}
      </div>

      <Step from={0.9} to={0.99} travel={22}>
        <p className="scene-kicker">
          Marketing becomes a cost — not an investment. Nothing compounds, nothing scales.
        </p>
      </Step>
    </Scene>
  );
}
