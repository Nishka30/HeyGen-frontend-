"use client";

import Link from "next/link";
import { ArrowRight, Video, UserCircle2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Create AI Avatars & 
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {" "}
            Translate Videos
          </span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Choose your virtual avatar, make it speak your script, and translate videos into multiple languages while preserving the original voice.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 rounded-xl bg-card border">
            <UserCircle2 className="w-12 h-12 mb-4 mx-auto text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">AI Avatars</h3>
            <p className="text-muted-foreground">
              Select from diverse avatars, customize their voice, and bring your scripts to life
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border">
            <Languages className="w-12 h-12 mb-4 mx-auto text-cyan-500" />
            <h3 className="text-xl font-semibold mb-2">Video Translation</h3>
            <p className="text-muted-foreground">
              Transform your videos into multiple languages while maintaining the original style
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
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