"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

interface DeleteButtonProps {
  onConfirm: () => void;
  label?: string;
  title?: string;
  message?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Delete button with a premium confirm dialog.
 * Usage:
 *   <DeleteButton onConfirm={() => deleteItem(id)} />
 */
export function DeleteButton({
  onConfirm,
  label = "Delete",
  title = "Delete permanently?",
  message = "This action cannot be undone. The item will be removed from the public site immediately.",
  compact = false,
  className = "",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`p-1.5 text-[#737373] hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-all ${className}`}
          title={label}
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <ConfirmDialog
          open={open}
          title={title}
          message={message}
          confirmLabel="Delete Permanently"
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-rose-300 bg-rose-950/30 border border-rose-900/50 rounded-xl hover:bg-rose-900/40 hover:border-rose-800 transition-all ${className}`}
      >
        <Trash2 className="w-4 h-4" />
        {label}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        confirmLabel="Delete Permanently"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
