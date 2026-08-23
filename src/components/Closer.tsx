export default function Closer() {
  return (
    <section className="closer" id="contact">
      <div className="shell">
        <p className="eyebrow rv">Ready when you are</p>
        <h2 className="rv" data-delay="70">
          Turn marketing spend into growth you can rely on.
        </h2>
        <p className="sub rv" data-delay="140">
          Tell us what you are aiming at. We will tell you what it takes, then go and do it.
        </p>
        <div className="acts rv" data-delay="210">
          <a className="btn btn-onDark" href="#contact">
            Book a growth audit
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a className="btn btn-lineDark" href="#suite">
            See the Growth Suite
          </a>
        </div>
      </div>
    </section>
  );
}
