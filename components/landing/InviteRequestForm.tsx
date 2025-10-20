"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { validateEmail, isMotivationSuspicious } from "@/lib/security";

type Step = 1 | 2 | 3;

export function InviteRequestForm() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tradingExperience, setTradingExperience] = useState<
    "never" | "less_than_3_months" | "3_to_12_months" | "1_plus_years"
  >("never");
  const [primaryChallenge, setPrimaryChallenge] = useState<
    "emotional_decisions" | "lack_of_discipline" | "no_accountability" | "information_overload"
  >("emotional_decisions");
  const [motivation, setMotivation] = useState("");
  const [canCommit, setCanCommit] = useState(false);
  const [referralSource, setReferralSource] = useState<
    "social_media" | "friend" | "article" | "search" | "other"
  >("social_media");

  const submitRequest = useMutation(api.inviteRequests.submitRequest);

  const handleNext = () => {
    setError(null);

    if (step === 1) {
      // Validate email and name
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
      if (!email.trim()) {
        setError("Please enter your email");
        return;
      }
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || "Invalid email");
        return;
      }
    } else if (step === 2) {
      // Validate motivation
      if (motivation.length < 50) {
        setError("Please write at least 50 characters about your motivation");
        return;
      }
      if (motivation.length > 300) {
        setError("Please keep your motivation under 300 characters");
        return;
      }
      if (isMotivationSuspicious(motivation)) {
        setError("Please provide a genuine motivation");
        return;
      }
    }

    setStep((prev) => Math.min(3, prev + 1) as Step);
  };

  const handlePrevious = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Get IP address from client (we'll use a simple method)
      let ipAddress = "unknown";
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        ipAddress = data.ip;
      } catch {
        // Fallback if IP detection fails
        ipAddress = "127.0.0.1";
      }

      const result = await submitRequest({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        tradingExperience,
        primaryChallenge,
        motivation: motivation.trim(),
        canCommit,
        referralSource,
        ipAddress,
        userAgent: navigator.userAgent,
      });

      if ("error" in result && !result.success) {
        setError(result.error);
      } else if ("success" in result && result.success) {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("There was an error submitting your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section
        id="invite-request"
        className="py-20 px-4 bg-background relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-purple-600/5"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-neutral-100 mb-2">
              Request Submitted!
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              We've received your invite request. You'll hear from us within 24-48 hours
              via email with your invite code or next steps.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="invite-request"
      className="py-20 px-4 bg-background relative overflow-hidden"
    >
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
            Request Your Invite
          </h2>
          <p className="text-xl text-neutral-400">
            Answer a few questions to get early access to ForexMentor AI
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-12 bg-blue-600"
                  : s < step
                  ? "w-8 bg-green-600"
                  : "w-8 bg-neutral-700"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Trading Experience *
                  </label>
                  <select
                    value={tradingExperience}
                    onChange={(e) =>
                      setTradingExperience(
                        e.target.value as typeof tradingExperience
                      )
                    }
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  >
                    <option value="never">Never traded before</option>
                    <option value="less_than_3_months">Less than 3 months</option>
                    <option value="3_to_12_months">3-12 months</option>
                    <option value="1_plus_years">1+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Your Biggest Challenge *
                  </label>
                  <select
                    value={primaryChallenge}
                    onChange={(e) =>
                      setPrimaryChallenge(e.target.value as typeof primaryChallenge)
                    }
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  >
                    <option value="emotional_decisions">
                      Emotional decisions (FOMO, revenge trading)
                    </option>
                    <option value="lack_of_discipline">Lack of discipline</option>
                    <option value="no_accountability">No accountability</option>
                    <option value="information_overload">Information overload</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 2: Motivation */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Why do you want to join ForexMentor AI? *
                  </label>
                  <textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    required
                    minLength={50}
                    maxLength={300}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none"
                    placeholder="Tell us about your trading goals and why you want to improve your psychology... (50-300 characters)"
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    {motivation.length}/300 characters (minimum 50)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    How did you hear about us? *
                  </label>
                  <select
                    value={referralSource}
                    onChange={(e) =>
                      setReferralSource(e.target.value as typeof referralSource)
                    }
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  >
                    <option value="social_media">Social Media</option>
                    <option value="friend">Friend or colleague</option>
                    <option value="article">Article or blog post</option>
                    <option value="search">Search engine</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Commitment */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-100 mb-4">
                    One Last Thing...
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    ForexMentor AI works best when you're committed to improving your
                    trading psychology. This means logging your trades, emotions, and
                    following the AI's guidance consistently.
                  </p>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="commitment"
                      checked={canCommit}
                      onChange={(e) => setCanCommit(e.target.checked)}
                      required
                      className="mt-1 w-5 h-5 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-2 focus:ring-blue-600"
                    />
                    <label htmlFor="commitment" className="text-neutral-300">
                      I commit to logging my trades and emotions for at least 30 days
                      to get the most out of ForexMentor AI *
                    </label>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong>What happens next?</strong> We'll review your request
                    within 24-48 hours. If approved, you'll receive an invite code
                    that can be used 5 times—perfect for bringing your trading friends
                    along!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-900/20 border border-red-800/50 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isLoading}
                className="flex-1 h-12 rounded-lg bg-neutral-800 text-neutral-200 font-semibold hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`${
                  step === 1 ? "w-full" : "flex-1"
                } h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-900 transition`}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !canCommit}
                className="flex-1 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            )}
          </div>

          <p className="text-sm text-neutral-500 text-center mt-4">
            By submitting, you agree to our privacy policy and terms of service.
          </p>
        </form>
      </div>
    </section>
  );
}
