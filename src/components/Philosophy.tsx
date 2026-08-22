import Scene, { Step, StepMeta } from "@/components/Scene";

const ROWS = [
  { rn: "01", title: "Performance must serve business objectives", tag: "Not vanity metrics" },
  { rn: "02", title: "Data should guide decisions, not fill reports", tag: "Signal over noise" },
  { rn: "03", title: "Creativity works best when it's accountable", tag: "Ideas with a job" },
  { rn: "04", title: "Sustainable growth balances results with equity", tag: "Short & long term" },
];

export default function Philosophy() {
  return (
    <Scene id="philosophy" className="phil" depth="320vh">
      <StepMeta idx="03" label="Growth philosophy" />
      <div className="scene-rows">
        {ROWS.map((r, i) => {
          const start = 0.08 + i * 0.2;
          return (
            <Step key={r.rn} from={start} to={start + 0.12} travel={30}>
              <div className="phil-row">
                <span className="rn">{r.rn}</span>
                <h3>{r.title}</h3>
                <span className="tag">{r.tag}</span>
              </div>
            </Step>
          );
        })}
      </div>
    </Scene>
  );
}
