import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Flight from "@/components/Flight";
import Problem from "@/components/Problem";
import Positioning from "@/components/Positioning";
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
      <Header />
      <Hero />
      <Statement />
      {/* Scroll-scrubbed 3D flight — carries the growth philosophy in-scene. */}
      <Flight />
      <Problem />
      <Positioning />
      <Method />
      <Rail />
      <Modules />
      <Partnership />
      <Closer />
      <Footer />
      <SiteFX />
    </>
  );
}
