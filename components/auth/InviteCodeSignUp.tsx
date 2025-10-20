"use client";

import React, { useState, useEffect } from "react";
import { SignUp, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { normalizeCode, formatCodeForDisplay } from "@/lib/inviteCodeGenerator";

export function InviteCodeSignUp() {
  const [inviteCode, setInviteCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const { user } = useUser();
  const useInviteCode = useMutation(api.inviteCodes.useInviteCode);

  // When user successfully signs up with Clerk, record invite code usage
  useEffect(() => {
    if (user && isCodeValid && inviteCode) {
      const recordUsage = async () => {
        try {
          const normalizedCode = normalizeCode(inviteCode);
          const email = user.primaryEmailAddress?.emailAddress || "";

          await useInviteCode({
            code: normalizedCode,
            userId: user.id,
            email,
          });
        } catch (error) {
          console.error("Error recording invite code usage:", error);
        }
      };

      recordUsage();
    }
  }, [user, isCodeValid, inviteCode, useInviteCode]);

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationError(null);

    try {
      const normalizedCode = normalizeCode(inviteCode);

      if (normalizedCode.length !== 8) {
        setValidationError("Invite code must be 8 characters");
        setIsValidating(false);
        return;
      }

      // Call validation query via fetch since we need it before auth
      const response = await fetch("/api/validate-invite-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizedCode }),
      });

      const result = await response.json();

      if (result.isValid) {
        setIsCodeValid(true);
        setShowSignUp(true);
      } else {
        setValidationError(result.reason || "Invalid invite code");
      }
    } catch (error) {
      console.error("Error validating code:", error);
      setValidationError("Failed to validate invite code. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  if (showSignUp && isCodeValid) {
    return (
      <div>
        <div className="mb-6 p-4 bg-green-900/20 border border-green-800/50 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-300 font-medium">
              Invite code accepted: {formatCodeForDisplay(normalizeCode(inviteCode))}
            </p>
            <p className="text-xs text-green-400 mt-1">
              Complete your registration below
            </p>
          </div>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-foreground">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Join ForexMentor and start your trading journey
        </p>
        <div className="mt-8">
          <SignUp
            redirectUrl="/dashboard"
            appearance={{
              baseTheme: undefined,
              elements: {
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground text-sm normal-case",
                card: "bg-card border-border shadow-lg",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton:
                  "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border",
                formFieldInput: "bg-background border-border text-foreground",
                formFieldLabel: "text-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
                identityPreviewText: "text-foreground",
                formFieldSuccessText: "text-green-600 dark:text-green-400",
                formFieldErrorText: "text-red-600 dark:text-red-400",
              },
              variables: {
                colorPrimary: "hsl(var(--primary))",
                colorBackground: "hsl(var(--background))",
                colorText: "hsl(var(--foreground))",
                colorTextSecondary: "hsl(var(--muted-foreground))",
                colorInputBackground: "hsl(var(--background))",
                colorInputText: "hsl(var(--foreground))",
                borderRadius: "0.5rem",
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center text-3xl font-extrabold text-foreground mb-2">
        Enter Your Invite Code
      </h2>
      <p className="text-center text-sm text-muted-foreground mb-8">
        You need an invite code to create an account
      </p>

      <div className="max-w-md mx-auto bg-card border border-border rounded-lg shadow-lg p-6">
        <form onSubmit={handleValidateCode} className="space-y-4">
          <div>
            <label
              htmlFor="inviteCode"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Invite Code
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              maxLength={9}
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition font-mono text-lg tracking-wider text-center"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Enter the 8-character code from your email
            </p>
          </div>

          {validationError && (
            <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{validationError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating || inviteCode.length < 8}
            className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating...
              </>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Don't have an invite code?{" "}
            <a href="/#invite-request" className="text-primary hover:text-primary/80 font-medium">
              Request one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
