const PRODUCTS = [
  {
    rn: "01",
    stage: "Diagnostics",
    title: "Growth™ Diagnostics",
    voice: '"I just need to know if I\'m doing well."',
    body: "Audits across website, SEO, journey and channels — plus a 90-day roadmap that names the bottlenecks.",
  },
  {
    rn: "02",
    stage: "Launchpad",
    title: "Growth™ Launchpad",
    voice: '"I want to start this properly."',
    body: "Monthly strategy, SEO operations, lead generation and a KPI dashboard for the runway phase.",
  },
  {
    rn: "03",
    stage: "Accelerate",
    title: "Growth™ Accelerate",
    voice: '"Time to speed things up."',
    body: "Funnel and CRM optimisation, media oversight and nurturing built to lower CAC and lift revenue.",
  },
  {
    rn: "04",
    stage: "Scale",
    title: "Growth™ Scale",
    voice: '"Let\'s go big."',
    body: "Tracking, automation, SOPs and executive dashboards — the infrastructure predictable scaling needs.",
  },
];

export default function Suite() {
  return (
    <section className="suite" id="suite">
      <div className="shell">
        <div className="meta">
          <span className="idx">05</span>
          <span className="lbl">The Growth™ Suite</span>
        </div>
        <div className="suite-head">
          <h2 className="rv">Four products. Four stages of growth.</h2>
          <p className="rv sub">Start wherever you are — each one hands off cleanly to the next.</p>
        </div>
        <div className="suite-grid">
          {PRODUCTS.map((p) => (
            <div className="pcard rv" key={p.rn}>
              <div className="pcard-top">
                <span className="stage">{p.stage}</span>
                <span className="rn">{p.rn}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="voice">{p.voice}</p>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
