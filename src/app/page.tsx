import Header from "@/components/Header";
import Hero from "@/components/Hero";
import World from "@/components/World";
import Statement from "@/components/Statement";
import Problem from "@/components/Problem";
import Positioning from "@/components/Positioning";
import Philosophy from "@/components/Philosophy";
import Method from "@/components/Method";
import Rail from "@/components/Rail";
import Modules from "@/components/Modules";
import Partnership from "@/components/Partnership";
import Closer from "@/components/Closer";
import Footer from "@/components/Footer";
import SiteFX from "@/components/SiteFX";
import Preloader from "@/components/Preloader";

export default function Home() {
  return (
    <>
      <Preloader />
      <Hero />
      {/* nav sits under the hero, then sticks for the rest of the page */}
      <Header />
      {/* one continuous 3D flight behind everything up to the CTA */}
      <World>
        <Statement />
        <Problem />
        <Positioning />
        <Philosophy />
        <Method />
        <Rail />
        <Modules />
        <Partnership />
      </World>
      <Closer />
      <Footer />
      <SiteFX />
    </>
  );
}
