import { ButtonHTMLAttributes } from "react";

interface ReloadButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "global" | "feature";
  label?: string;
}

/**
 * Reload button for error boundaries.
 * Triggers full page reload to recover from error states.
 */
export function ReloadButton({ 
  variant = "global", 
  label = "Reload page",
  className,
  ...props 
}: ReloadButtonProps) {
  const baseClasses = "transition-colors";
  const variantClasses = {
    global: "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600",
    feature: "rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200",
  };

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}
      {...props}
    >
      {label}
    </button>
  );
}
