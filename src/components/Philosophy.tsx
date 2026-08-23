const ROWS = [
  { rn: "01", title: "Numbers should answer to the business", tag: "Not vanity metrics" },
  { rn: "02", title: "A report should settle a question, not fill a page", tag: "Signal over noise" },
  { rn: "03", title: "Good ideas can still be held to account", tag: "Ideas with a job" },
  { rn: "04", title: "Growth that lasts beats growth that spikes", tag: "Short and long term" },
];

export default function Philosophy() {
  return (
    <section className="band" id="philosophy">
      <div className="shell">
        <div className="meta rv">
          <span className="idx">03</span>
          <span className="lbl">How we think</span>
        </div>
        <div className="phil-list">
          {ROWS.map((r, i) => (
            <div className="phil-row rv" key={r.rn} data-delay={i * 70}>
              <span className="rn">{r.rn}</span>
              <h3>{r.title}</h3>
              <span className="tag">{r.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
