import { Effects } from "@/components/animate-ui/effect";

const ROWS = [
  { rn: "01", title: "Performance must serve business objectives", tag: "Not vanity metrics" },
  { rn: "02", title: "Data should guide decisions, not fill reports", tag: "Signal over noise" },
  { rn: "03", title: "Creativity works best when it's accountable", tag: "Ideas with a job" },
  { rn: "04", title: "Sustainable growth balances results with equity", tag: "Short & long term" },
];

export default function Philosophy() {
  return (
    <section className="phil">
      <div className="shell">
        <div className="meta">
          <span className="idx">03</span>
          <span className="lbl">Growth philosophy</span>
        </div>
        <div className="phil-list">
          <Effects asChild fade slide holdDelay={70}>
            {ROWS.map((r) => (
              <div className="phil-row" key={r.rn}>
                <span className="rn">{r.rn}</span>
                <h3>{r.title}</h3>
                <span className="tag">{r.tag}</span>
              </div>
            ))}
          </Effects>
        </div>
      </div>
    </section>
  );
}
