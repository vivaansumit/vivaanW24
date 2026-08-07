"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Premium confirmation dialog.
 * - Focus-trapped while open
 * - Escape / backdrop click to cancel
 * - Subtle motion, sober palette
 */
export function ConfirmDialog({
  open,
  title = "Confirm action",
  message = "This cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    confirmRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                  isDanger ? "bg-rose-950/60 text-rose-400" : "bg-[#C9A227]/10 text-[#C9A227]"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#f5f5f5] leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-[#a3a3a3] mt-1 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222222]">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors rounded-full"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
                  isDanger
                    ? "bg-rose-950/80 text-rose-300 border border-rose-900/50 hover:bg-rose-900 hover:border-rose-800"
                    : "bg-[#C9A227] text-black hover:bg-[#D4AF37]"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
