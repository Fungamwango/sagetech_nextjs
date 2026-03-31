type MonetisationSummaryCardProps = {
  provider: string | null;
  impressions?: number | null;
  clicks?: number | null;
  revenue?: number | null;
  cpm?: number | null;
  ctr?: number | null;
  title?: string;
  subtitle?: string;
  updatedAt?: string | null;
};

function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString();
}

export default function MonetisationSummaryCard({
  provider,
  impressions,
  clicks,
  revenue,
  cpm,
  ctr,
  title,
  subtitle,
  updatedAt,
}: MonetisationSummaryCardProps) {
  return (
    <section
      className="rounded-[3px] border border-white/10 px-4 py-4"
      style={{ background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgb(22, 40, 50), rgba(0, 0, 0, 0.9))" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">{title ?? "Monetisation"}</p>
          <p className="mt-1 text-base font-semibold text-white">{provider === "adsterra" ? "Adsterra" : "Monetag"}</p>
          {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
        </div>
        <span className="rounded-full bg-cyan-400/12 px-3 py-1 text-xs font-semibold text-cyan-300">Live stats</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
            {provider === "adsterra" ? "Reported revenue" : "Revenue"}
          </p>
          <p className="mt-1 text-base font-semibold text-cyan-300">{formatMoney(revenue)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Impressions</p>
          <p className="mt-1 text-base font-semibold text-white">{formatNumber(impressions)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Clicks</p>
          <p className="mt-1 text-base font-semibold text-white">{formatNumber(clicks)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">CTR / CPM</p>
          <p className="mt-1 text-base font-semibold text-white">
            {(ctr ?? 0).toFixed(2)}% / ${(cpm ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
      {updatedAt ? (
        <p className="mt-3 text-xs text-white/40">Updated {new Date(updatedAt).toLocaleString()}</p>
      ) : null}
    </section>
  );
}
