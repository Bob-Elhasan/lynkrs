import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import { ProblemIntro, ProblemCost, ProblemNote, COSTS } from "@/components/Problem";
import Positioning from "@/components/Positioning";
import Philosophy from "@/components/Philosophy";
import Method from "@/components/Method";
import Suite from "@/components/Suite";
import Modules from "@/components/Modules";
import Partnership from "@/components/Partnership";
import Closer from "@/components/Closer";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import LeadFlow from "@/components/lead/LeadFlow";
import Scene, { Panel } from "@/components/Scene";

/* One prism carries the site. `turn` is cumulative quarter-turns from the top,
   so the camera always knows which way to swing; the four costs take four
   consecutive faces, which is the sequence the storyboard turns through. */

export default function Home() {
  return (
    <>
      {/* nav rides above the scene rather than on it */}
      <Header />

      <Scene>
        <Panel turn={0}>
          <Hero />
        </Panel>
        <Panel turn={1}>
          <Statement />
        </Panel>

        <Panel turn={2}>
          <ProblemIntro />
        </Panel>
        {COSTS.map((c, i) => (
          <Panel turn={3 + i} className="panel-blue" key={c.n}>
            <ProblemCost index={i} />
          </Panel>
        ))}
        <Panel turn={7} className="panel-note">
          <ProblemNote />
        </Panel>

        <Panel turn={8}>
          <Positioning />
        </Panel>
        <Panel turn={9}>
          <Philosophy />
        </Panel>
        <Panel turn={10}>
          <Method />
        </Panel>
        <Panel turn={11}>
          <Suite />
        </Panel>
        <Panel turn={12}>
          <Modules />
        </Panel>
        <Panel turn={13}>
          <Partnership />
        </Panel>
        <Panel turn={14}>
          <Closer />
        </Panel>
        <Panel turn={15}>
          <Footer />
        </Panel>
      </Scene>

      <Reveal />
      <LeadFlow />
    </>
  );
}
