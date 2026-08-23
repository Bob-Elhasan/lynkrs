import Logo from "./Logo";

export default function Footer() {
  return (
    <footer>
      <div className="shell">
        <div className="foot-grid">
          <div className="foot-brand">
            <Logo className="foot-wordmark" />
            <p>
              A growth agency. We join strategy, execution and reporting into one system, so marketing
              earns its keep.
            </p>
          </div>
          <div className="foot-col">
            <h4>Agency</h4>
            <a href="#problem">The problem</a>
            <a href="#method">How we work</a>
            <a href="#partner">Together</a>
          </div>
          <div className="foot-col">
            <h4>Work</h4>
            <a href="#suite">Growth Suite</a>
            <a href="#modules">What we run</a>
            <a href="#contact">Start a conversation</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Lynkrs</span>
          <span>Growth is designed, not guessed</span>
        </div>
      </div>
    </footer>
  );
}
