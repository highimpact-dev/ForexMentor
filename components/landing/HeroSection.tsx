"use client";

import React from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  return (
    <div className="h-screen w-full flex md:items-center md:justify-center bg-background antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50"
        >
          Stop Guessing. <br /> Start Trading with an AI Co-Pilot.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 font-normal text-base md:text-lg text-neutral-300 max-w-3xl text-center mx-auto"
        >
          The first paper trading platform that combines an AI psychology coach
          with a social accountability system. Defeat the emotions that cost you
          money and build a winning discipline.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex gap-4 justify-center"
        >
          <Link
            href="#waitlist"
            className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-8 font-medium text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:bg-[length:100%_100%]"
          >
            Join the Waitlist
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
