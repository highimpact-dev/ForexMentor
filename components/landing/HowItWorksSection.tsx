"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gauge, UserCheck, LineChart } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      step: "Step 1",
      icon: Gauge,
      title: "Get Your Pre-Trade Readiness Score",
      description:
        "Before every trade, answer three simple questions. Our AI analyzes your recent emotional state, win/loss streak, and habits to give you a 0-100 score. If the risk of emotional trading is too high, we'll block the trade and save you from yourself.",
      mockup: "readiness-score",
    },
    {
      step: "Step 2",
      icon: UserCheck,
      title: "Connect with Your Accountability Partner",
      description:
        "We'll match you with another beginner in your timezone. Share trades, review each other's progress, and commit to weekly goals. Having a partner is proven to increase discipline by over 50%.",
      mockup: "partner-connect",
    },
    {
      step: "Step 3",
      icon: LineChart,
      title: "Review Your Emotional Patterns",
      description:
        "Use our Emotional Trade Replay to see exactly how anxiety, fear, or overconfidence impacts your results. Our AI will generate a weekly report with insights like, \"You lose 80% of trades on Fridays when you log 'Frustrated'.\"",
      mockup: "emotional-replay",
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            How It Works
          </h2>
        </motion.div>

        <div className="space-y-20">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-12 items-center`}
              >
                <div className="flex-1 space-y-6">
                  <div className="inline-block px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm font-semibold">
                    {item.step}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-neutral-100">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-lg text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 h-80 flex items-center justify-center">
                    <div className="text-neutral-600 text-center">
                      <Icon className="w-24 h-24 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">Visual mockup: {item.mockup}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
