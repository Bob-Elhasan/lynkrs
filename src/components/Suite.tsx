const PRODUCTS = [
  {
    rn: "01",
    stage: "Diagnostics",
    title: "Growth Diagnostics",
    voice: '"I just need to know if I am doing well."',
    body: "A proper look at your site, SEO, customer journey and channels, plus a 90 day plan that names what is actually holding you back.",
  },
  {
    rn: "02",
    stage: "Launchpad",
    title: "Growth Launchpad",
    voice: '"I want to start this properly."',
    body: "Monthly strategy, SEO, lead generation and a dashboard you will actually read.",
  },
  {
    rn: "03",
    stage: "Accelerate",
    title: "Growth Accelerate",
    voice: '"Time to speed things up."',
    body: "Funnel and CRM work, media oversight and nurture, built to bring the cost of a customer down and revenue up.",
  },
  {
    rn: "04",
    stage: "Scale",
    title: "Growth Scale",
    voice: '"Let us go big."',
    body: "Tracking, automation, written processes and reporting your board will understand.",
  },
];

export default function Suite() {
  return (
    <section className="band" id="suite">
      <div className="shell">
        <div className="meta rv">
          <span className="idx">05</span>
          <span className="lbl">The Growth Suite</span>
        </div>
        <div className="head">
          <h2 className="rv">Four products. Four stages of growth.</h2>
          <p className="rv" data-delay="80">
            Start wherever you are. Each one hands over cleanly to the next.
          </p>
        </div>
        <div className="suite-grid">
          {PRODUCTS.map((p, i) => (
            <div className="pcard rv" key={p.rn} data-delay={i * 70}>
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
