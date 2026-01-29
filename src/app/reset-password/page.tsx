"use client";

import { useState, FormEvent } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { convertErrorToMessage } from "@/lib/utils/error-handler";
import { logError } from "@/lib/utils/logger";

export default function ResetPassword() {
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
      logError("Password reset failed", error, { email });
      const message = convertErrorToMessage(
        error,
        "Failed to send reset email. Please try again."
      );
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
