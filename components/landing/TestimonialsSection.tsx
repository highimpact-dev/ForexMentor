"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "The Pre-Trade check blocked me from revenge trading three times this week. I was angry and ready to blow my virtual account, but it stopped me. Incredibly valuable.",
      author: "Alex R.",
      role: "Beginner Trader",
    },
    {
      quote:
        "My accountability partner has been a game-changer. We hold each other to our trading plans. It's the first time I've been consistent for a whole month.",
      author: "Sarah P.",
      role: "Forex Enthusiast",
    },
    {
      quote:
        "The AI insights are scary accurate. It pointed out that my win rate drops 70% after two consecutive losses. I never would have seen that pattern on my own.",
      author: "Michael B.",
      role: "Part-time Trader",
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
            From Trading in Isolation to Growing with Confidence
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm h-full flex flex-col">
                <Quote className="w-10 h-10 text-blue-500/50 mb-6" />
                <blockquote className="text-neutral-300 leading-relaxed mb-6 flex-grow italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-neutral-800 pt-4">
                  <p className="font-semibold text-neutral-100">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
