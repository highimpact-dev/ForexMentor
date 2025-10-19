"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageCircle, ChartLine } from "lucide-react";

export function SolutionSection() {
  const solutions = [
    {
      number: "1",
      icon: Sparkles,
      title: "AI Psychology Coach",
      description:
        "Get real-time feedback on your emotional state before you risk a dime. Our AI identifies and helps you break costly psychological patterns.",
    },
    {
      number: "2",
      icon: MessageCircle,
      title: "Social Accountability System",
      description:
        "Never trade alone again. Get matched with a partner to stay disciplined, join group challenges, and learn from a supportive community.",
    },
    {
      number: "3",
      icon: ChartLine,
      title: "Guided Paper Trading",
      description:
        "Practice your strategy with a smart platform that analyzes your psychological performance, not just your P&L.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Introducing ForexMentor AI
          </h2>
          <p className="text-xl text-neutral-400 mt-4">
            Your All-in-One Psychology & Accountability Coach
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                      {solution.number}
                    </div>
                    <Icon className="w-8 h-8 text-neutral-300" />
                  </div>
                  <h3 className="text-2xl font-semibold text-neutral-100 mb-4">
                    {solution.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed flex-grow">
                    {solution.description}
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
