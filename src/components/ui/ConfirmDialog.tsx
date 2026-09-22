"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/Button";
import { logError } from "@/lib/utils/logger";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

/**
 * Accessible confirmation dialog using the native HTML dialog element.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      confirmButtonRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onCloseRef.current();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      dialogRef.current?.close();
    } catch (error) {
      logError("Confirm action failed", error);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto max-w-md w-[calc(100%-2rem)] rounded-lg border-0 bg-white p-6 shadow-xl backdrop:bg-black/50"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <h2
        id="dialog-title"
        className="text-xl font-semibold text-gray-900 mb-2"
      >
        {title}
      </h2>
      <p id="dialog-description" className="text-gray-600 mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-end">
        <Button
          variant="secondary"
          onClick={() => dialogRef.current?.close()}
        >
          {cancelLabel}
        </Button>
        <button
          ref={confirmButtonRef}
          type="button"
          onClick={handleConfirm}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            variant === "danger"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-primary-700 text-white hover:bg-primary-800"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
