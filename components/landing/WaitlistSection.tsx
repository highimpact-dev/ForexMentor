"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, CheckCircle2 } from "lucide-react";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await joinWaitlist({ email, name });
      setIsSubmitted(true);
      setEmail("");
      setName("");
    } catch (error) {
      console.error("Error joining waitlist:", error);
      alert("There was an error joining the waitlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-purple-600/5"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-4">
            Ready to Master Your Trading Psychology?
          </h2>
          <p className="text-xl text-neutral-400">
            Join hundreds of other traders building the discipline to succeed.
          </p>
        </motion.div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-neutral-100 mb-2">
              You're on the list!
            </h3>
            <p className="text-neutral-400">
              We'll notify you when ForexMentor AI launches.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join the Waitlist"
                )}
              </button>
            </div>

            <p className="text-sm text-neutral-500 text-center mt-4">
              Be the first to know when we launch. No spam, ever.
            </p>
          </motion.form>
        )}
      </div>
    </section>
  );
}
