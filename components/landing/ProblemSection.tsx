"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Users, TrendingUp } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: Brain,
      title: "Emotional Trading",
      description:
        "Revenge trading after a loss? Jumping into trades out of FOMO? These impulses destroy more accounts than bad strategies.",
      gradient: "from-red-500/20 to-orange-500/20",
    },
    {
      icon: Users,
      title: "Total Isolation",
      description:
        "Learning alone is demotivating. With no one to review your trades or keep you disciplined, it's easy to develop bad habits and quit.",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: TrendingUp,
      title: "Information Overload",
      description:
        "Standard platforms give you endless charts and tools but zero guidance on how to manage your mindset—the most critical factor for success.",
      gradient: "from-purple-500/20 to-pink-500/20",
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
            Why Do 85% of Traders Quit?
          </h2>
          <p className="text-xl text-neutral-400 mt-4">(It's Not Their Strategy.)</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border border-neutral-800 bg-gradient-to-b ${problem.gradient} backdrop-blur-sm hover:border-neutral-700 transition-all duration-300`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-neutral-900/50 mb-6">
                    <Icon className="w-8 h-8 text-neutral-300" />
                  </div>
                  <h3 className="text-2xl font-semibold text-neutral-100 mb-4">
                    {problem.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
