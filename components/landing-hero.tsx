"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-6xl font-bold tracking-tight">
          Transform Your Videos into
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {" "}
            Any Language
          </span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Instantly translate your videos into multiple languages while preserving
          the original voice and style. Powered by HeyGen AI technology.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/register">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}