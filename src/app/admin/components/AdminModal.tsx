"use client";

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
};

export default function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  widthClassName = "max-w-2xl",
}: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-[91] w-full ${widthClassName} max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#06131c] shadow-[0_30px_80px_rgba(0,0,0,0.45)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-white/50">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-84px)] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
