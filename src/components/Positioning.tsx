import Scene, { Step, StepMeta, StepRule } from "@/components/Scene";

export default function Positioning() {
  return (
    <Scene className="position" depth="300vh">
      <StepMeta idx="02" label="Our positioning" />
      {/* The sentence lands in three scroll-driven beats. */}
      <Step from={0.04} to={0.18}>
        <p className="scene-quote">We don&apos;t optimise isolated channels.</p>
      </Step>
      <Step from={0.24} to={0.4}>
        <p className="scene-quote">
          We design and operate <span className="hl">growth systems</span>.
        </p>
      </Step>
      <Step from={0.46} to={0.6}>
        <p className="scene-quote muted">
          Performance is predictable, learning is continuous, and spend becomes an investment.
        </p>
      </Step>
      <StepRule from={0.62} to={0.72} />
      <Step from={0.7} to={0.84}>
        <p className="scene-lede">
          From campaigns to growth systems. Every channel supports the same objective; every decision is
          guided by data and accountability.
        </p>
      </Step>
      <Step from={0.86} to={0.97} travel={20}>
        <p className="scene-sig">Growth is designed, not guessed.</p>
      </Step>
    </Scene>
  );
}
