"use client";

import type { ReactNode } from "react";
import AdminModal from "./AdminModal";

type AdminConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: "danger" | "success" | "warning";
  loading?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
};

export default function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  intent = "danger",
  loading = false,
  children,
  onConfirm,
  onClose,
}: AdminConfirmModalProps) {
  const intentClass =
    intent === "success"
      ? "border-green-500/30 bg-green-500/15 text-green-300"
      : intent === "warning"
        ? "border-yellow-500/30 bg-yellow-500/15 text-yellow-200"
        : "border-red-500/30 bg-red-500/15 text-red-200";

  return (
    <AdminModal open={open} onClose={loading ? () => undefined : onClose} title={title} widthClassName="max-w-md">
      <p className="text-sm leading-6 text-white/70">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${intentClass}`}
        >
          {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
          {loading ? "Processing..." : confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}
