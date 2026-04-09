"use client";

export function formatNumber(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits });
}

export const sizeUnits = ["Bytes", "KB", "MB", "GB", "TB"] as const;
export type SizeUnit = (typeof sizeUnits)[number];

export function convertFileSize(value: number, from: SizeUnit, to: SizeUnit) {
  const factors: Record<SizeUnit, number> = {
    Bytes: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  return (value * factors[from]) / factors[to];
}

export function ToolCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(8,21,32,0.96),rgba(4,13,20,0.94))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
          <i className={`${icon} text-base`} />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-white sm:text-lg">{title}</h1>
          <p className="mt-1 text-sm leading-6 text-white/50">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function TinyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">{label}</p>
      <p className="mt-1 text-base font-semibold text-cyan-300">{value}</p>
    </div>
  );
}

export function MediaDropzone({
  accept,
  onSelect,
  label,
}: {
  accept: string;
  onSelect: (file: File | null) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-white/[0.06] bg-white/[0.03] px-4 py-6 text-center transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.04]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
        <i className="fas fa-file-arrow-up text-base" />
      </div>
      <p className="mt-3 text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs text-white/45">Choose a file from your device</p>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}
