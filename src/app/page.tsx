import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Problem from "@/components/Problem";
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

export default function Home() {
  return (
    <>
      <Hero />
      {/* nav sits under the hero, then sticks for the rest of the page */}
      <Header />
      <Statement />
      <Problem />
      <Positioning />
      <Philosophy />
      <Method />
      <Suite />
      <Modules />
      <Partnership />
      <Closer />
      <Footer />
      <Reveal />
      <LeadFlow />
    </>
  );
}
