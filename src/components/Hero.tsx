import { Effect } from "@/components/animate-ui/effect";
import { Parallax } from "@/components/animate-ui/scroll-scrub";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <Parallax speed={0.3} className="orb orb-blue orb-1" aria-hidden="true" />
      <Parallax speed={-0.2} className="orb orb-paper orb-2" aria-hidden="true" />
      <div className="shell">
        <Effect asChild fade slide inView={false}>
          <h1 className="hero-h1">
            We know a website <span className="lead">matters</span>. But we&apos;re too busy serving our
            clients.
          </h1>
        </Effect>
      </div>
    </section>
  );
}
