"use client";

import { LandingHero } from "@/components/landing-hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <LandingHero />
    </main>
  );
}