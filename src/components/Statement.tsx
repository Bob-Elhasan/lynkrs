import { Effect } from "@/components/animate-ui/effect";

export default function Statement() {
  return (
    <section className="statement">
      <div className="shell statement-grid">
        <div className="statement-side">
          Our
          <br />
          promise
          <br />—
        </div>
        <Effect asChild fade slide>
          <p>
            You&apos;re busy running the business. <span className="em">We run the growth;</span> strategy,
            media, content and SEO operating under one objective:{" "}
            <span className="muted">structured, measurable and scalable.</span>
          </p>
        </Effect>
      </div>
    </section>
  );
}
