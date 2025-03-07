import { LandingHero } from "@/components/landing-hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="h-full">
      <Navbar />
      <LandingHero />
    </div>
  );
}