"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type EmailType =
  | "invite_code"
  | "request_received_pending"
  | "request_received_flagged"
  | "request_rejected";

const emailTypes: { value: EmailType; label: string; description: string }[] = [
  {
    value: "invite_code",
    label: "Invite Code Email",
    description: "Welcome email with invite code for approved users",
  },
  {
    value: "request_received_pending",
    label: "Request Received (Pending)",
    description: "Confirmation email for pending invite requests",
  },
  {
    value: "request_received_flagged",
    label: "Request Received (Flagged)",
    description: "Confirmation email for flagged invite requests",
  },
  {
    value: "request_rejected",
    label: "Request Rejected",
    description: "Rejection notification with reason",
  },
];

export function EmailTester() {
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState<EmailType>("invite_code");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const sendTestEmail = useAction(api.emails.sendTestEmail);

  const handleSendTest = async () => {
    if (!email) {
      setStatus("error");
      setErrorMessage("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const result = await sendTestEmail({
        to: email,
        emailType,
      });

      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to send test email");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Testing
        </CardTitle>
        <CardDescription>
          Send test emails to verify templates and delivery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="test-email">Recipient Email</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending"}
          />
          <p className="text-sm text-muted-foreground">
            Enter the email address where you want to receive the test email
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-type">Email Template</Label>
          <Select
            value={emailType}
            onValueChange={(value) => setEmailType(value as EmailType)}
            disabled={status === "sending"}
          >
            <SelectTrigger id="email-type">
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              {emailTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {status === "success" && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Test email sent successfully! Check your inbox.
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="border-red-200 bg-red-50 text-red-900">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSendTest}
            disabled={status === "sending"}
            className="flex-1"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <h4 className="text-sm font-semibold mb-2">Template Preview</h4>
          <p className="text-sm text-muted-foreground">
            {emailTypes.find((t) => t.value === emailType)?.description}
          </p>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p>
              <strong>From:</strong> ForexMentor &lt;onboarding@resend.dev&gt;
            </p>
            <p>
              <strong>Subject:</strong> [TEST]{" "}
              {emailType === "invite_code" &&
                "🎉 Your ForexMentor Invite Code is Ready!"}
              {(emailType === "request_received_pending" ||
                emailType === "request_received_flagged") &&
                "We've Received Your ForexMentor Invite Request"}
              {emailType === "request_rejected" &&
                "Update on Your ForexMentor Invite Request"}
            </p>
            <p className="mt-2">
              <strong>Note:</strong> All test emails are prefixed with [TEST]
              and use sample data
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
