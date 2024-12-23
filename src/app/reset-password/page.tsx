"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/Button";
import { FirebaseError } from "firebase/app";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        (error as FirebaseError).code === "auth/user-not-found"
          ? "No account found with this email"
          : "Failed to send reset email. Please try again."
      );
    }
  };

  return (
    <PageLayout
      title="Reset Password"
      subtitle="Enter your email to receive a password reset link"
    >
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {status === "error" && (
            <div className="text-sm text-red-600">{errorMessage}</div>
          )}

          {status === "success" && (
            <div className="text-sm text-green-600">
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
