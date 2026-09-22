"use client";

import { useState, FormEvent } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  convertErrorToMessage,
  getErrorCode,
  isKnownFirebaseAuthError,
} from "@/lib/utils/error-handler";
import { logError, logWarning } from "@/lib/utils/logger";

export function ResetPasswordPageClient() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      const message = convertErrorToMessage(
        error,
        "Failed to send reset email. Please try again."
      );
      if (isKnownFirebaseAuthError(error)) {
        logWarning("Password reset rejected", { code: getErrorCode(error) });
      } else {
        logError("Password reset failed", error, { email });
      }
      setErrorMessage(message);
    }
  };

  return (
    <PageLayout
      title="Reset Password"
      subtitle="Enter your email to receive a password reset link"
    >
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {status === "error" && <ErrorMessage message={errorMessage} />}

          {status === "success" && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
              Reset link sent! Check your email for further instructions.
            </div>
          )}

          <Button
            type="submit"
            isLoading={status === "loading"}
            disabled={status === "success"}
            className="w-full"
          >
            {status === "success" ? "Email Sent" : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
