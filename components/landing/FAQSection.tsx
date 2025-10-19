"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is this real money?",
      answer:
        "No, ForexMentor AI is a psychology-focused paper trading platform designed to help you build the right habits before you go live.",
    },
    {
      question: "What markets can I trade?",
      answer:
        "Our platform supports all major Forex pairs, cryptocurrencies, and stock indices.",
    },
    {
      question: "How does the AI work?",
      answer:
        "Our AI uses GPT-4 to analyze your emotional log data against your trading performance to identify personalized patterns and provide actionable advice.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time, no questions asked.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-neutral-950">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-800/30 transition"
              >
                <span className="font-semibold text-neutral-100">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-neutral-400 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 text-neutral-400 border-t border-neutral-800">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-500 text-sm">
            © 2025 ForexMentor AI. All rights reserved.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
