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

/* One endless prism carries the site, and the camera rides it.

   `turn` is cumulative quarter-turns, so the camera always knows which way to
   swing; the four costs take four consecutive faces, which is the sequence the
   storyboard turns through. `bend` and `climb` steer the tube itself across the
   span after each panel — sideways and up/down in degrees.

   The route sweeps rather than spirals: bends alternate sign so the tube leans
   one way, comes back, and never coils into itself. The problem section is the
   one sustained curve, three spans leaning the same way — held to 18 degrees
   each, because at 30 the accumulated quarter-turn folded the tube back across
   the camera mid-ride. */

/** The problem's sustained lean: three spans curving the same way, then out. */
const COST_BEND = [-18, -18, -18, 16];
const COST_CLIMB = [0, 6, 0, -10];

export default function Home() {
  return (
    <>
      {/* nav rides above the scene rather than on it */}
      <Header />

      <Scene>
        <Panel turn={0}>
          <Hero />
        </Panel>
        <Panel turn={1} bend={14} climb={-8}>
          <Statement />
        </Panel>

        <Panel turn={2} bend={-16} climb={10}>
          <ProblemIntro />
        </Panel>
        {COSTS.map((c, i) => (
          <Panel
            turn={3 + i}
            bend={COST_BEND[i]}
            climb={COST_CLIMB[i]}
            className="panel-blue"
            key={c.n}
          >
            <ProblemCost index={i} />
          </Panel>
        ))}
        <Panel turn={7} bend={20} climb={8} className="panel-note">
          <ProblemNote />
        </Panel>

        <Panel turn={8} bend={14} climb={-6}>
          <Positioning />
        </Panel>
        <Panel turn={9} bend={-18} climb={10}>
          <Philosophy />
        </Panel>
        <Panel turn={10} bend={-14}>
          <Method />
        </Panel>
        <Panel turn={11} bend={16} climb={-8}>
          <Suite />
        </Panel>
        <Panel turn={12} bend={18} climb={8}>
          <Modules />
        </Panel>
        <Panel turn={13} bend={-14} climb={-8}>
          <Partnership />
        </Panel>
        <Panel turn={14} bend={-12} climb={6}>
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
