import Scene, { Step } from "@/components/Scene";

export default function Statement() {
  return (
    <Scene className="statement" depth="240vh">
      <Step from={0.06} to={0.22}>
        <p className="scene-quote">You&apos;re busy running the business.</p>
      </Step>
      <Step from={0.3} to={0.46}>
        <p className="scene-quote">
          <span className="em">We run the growth.</span>
        </p>
      </Step>
      <Step from={0.54} to={0.72}>
        <p className="scene-quote muted">
          Strategy, media, content and SEO under one objective: structured, measurable and scalable.
        </p>
      </Step>
    </Scene>
  );
}
