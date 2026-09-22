"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  error?: string;
};

const inputBaseClasses =
  "w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500";

/**
 * Password field with accessible show/hide toggle (app-eval Auth UX gate).
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = "Password", error, className = "", id, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    const Icon = isVisible ? EyeOff : Eye;

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isVisible ? "text" : "password"}
            className={clsx(
              inputBaseClasses,
              error && "border-red-500",
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-gray-500 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
