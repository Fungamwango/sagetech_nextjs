"use client";

type ModernLoaderProps = {
  label?: string;
  sublabel?: string;
  compact?: boolean;
  className?: string;
};

export function ModernLoader({
  label = "Loading...",
  sublabel,
  compact = false,
  className = "",
}: ModernLoaderProps) {
  return (
    <div
      className={`${compact ? "modern-inline-loader-wrap" : "modern-block-loader-wrap"} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className={compact ? "modern-inline-loader" : "modern-list-loader"} aria-hidden="true">
        <div className={compact ? "modern-inline-loader__core" : "modern-list-loader__core"} />
      </div>
      <div className={compact ? "min-w-0" : "text-center"}>
        <p className={compact ? "text-sm font-medium text-white/85" : "loading-text"}>{label}</p>
        {sublabel ? (
          <p className={compact ? "text-xs text-white/45" : "modern-page-loader__subtext"}>{sublabel}</p>
        ) : null}
      </div>
    </div>
  );
}
