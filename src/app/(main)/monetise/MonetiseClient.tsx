"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MonetisationSummaryCard from "@/components/monetise/MonetisationSummaryCard";
import { useToast } from "@/components/ui/ToastProvider";

type MonetiseProps = {
  userId: string;
  initialProvider: "monetag" | "adsterra";
  initialAdsUrl: string;
  initialAdsFreq: "high" | "medium" | "low";
  initialAdsterraBannerCode: string;
  initialAdsterraApiToken: string;
  initialAdsterraDomainId: string;
  initialAdsterraPlacementId: string;
  postCount: number;
  minimumPosts: number;
  isMonetised: boolean;
  adsterraStats: {
    impressions: number;
    clicks: number;
    revenue: number;
    allTimeRevenue?: number;
    ctr: number;
    cpm: number;
    updatedAt: string;
    daily: Array<{
      date: string;
      impressions: number;
      clicks: number;
      revenue: number;
      ctr: number;
      cpm: number;
    }>;
  } | null;
};

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDayLabel(value: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

const PROVIDERS = [
  {
    id: "monetag" as const,
    title: "Monetag",
    icon: "fas fa-link",
    copy: "Keep using a direct monetisation link and frequency control.",
  },
  {
    id: "adsterra" as const,
    title: "Adsterra",
    icon: "fas fa-images",
    copy: "Paste your banner embed code and optional API token for stats.",
  },
];

const PROVIDER_LINKS = {
  monetag: "https://monetag.com/?ref_id=u70r",
  adsterra: "https://beta.publishers.adsterra.com/referral/CEuAQ7fHgZ",
};

export default function MonetiseClient({
  userId,
  initialProvider,
  initialAdsUrl,
  initialAdsFreq,
  initialAdsterraBannerCode,
  initialAdsterraApiToken,
  initialAdsterraDomainId,
  initialAdsterraPlacementId,
  postCount,
  minimumPosts,
  isMonetised,
  adsterraStats,
}: MonetiseProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [provider, setProvider] = useState<"monetag" | "adsterra">(initialProvider);
  const [adsUrl, setAdsUrl] = useState(initialAdsUrl);
  const [adsFreq, setAdsFreq] = useState<"high" | "medium" | "low">(initialAdsFreq);
  const [adsterraBannerCode, setAdsterraBannerCode] = useState(initialAdsterraBannerCode);
  const [adsterraApiToken, setAdsterraApiToken] = useState(initialAdsterraApiToken);
  const [adsterraDomainId, setAdsterraDomainId] = useState(initialAdsterraDomainId);
  const [adsterraPlacementId, setAdsterraPlacementId] = useState(initialAdsterraPlacementId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(
    provider === "adsterra" ? !!initialAdsterraBannerCode : !!initialAdsUrl
  );
  const [editing, setEditing] = useState(!(provider === "adsterra" ? initialAdsterraBannerCode : initialAdsUrl));

  const ready = postCount >= minimumPosts;
  const hasConfig = provider === "adsterra" ? !!adsterraBannerCode.trim() : !!adsUrl.trim();
  const status: "running" | "paused" | "ready" | "not-ready" =
    saved && isMonetised ? "running" : saved && !ready ? "paused" : ready ? "ready" : "not-ready";

  const notifyNotQualified = () => {
    if (ready) return;
    showToast({
      type: "error",
      message: `You are not qualified for monetisation yet. Create at least ${minimumPosts} posts first.`,
    });
  };

  const handleSave = async () => {
    if (!ready) {
      notifyNotQualified();
      return;
    }

    if (provider === "monetag") {
      if (!adsUrl.trim()) {
        showToast({ type: "error", message: "Please enter the Monetag direct link." });
        return;
      }
      if (!adsUrl.startsWith("https://") && !adsUrl.startsWith("http://")) {
        showToast({ type: "error", message: "Monetag link must start with http or https." });
        return;
      }
    }

    if (provider === "adsterra" && !adsterraBannerCode.trim()) {
      showToast({ type: "error", message: "Paste your Adsterra banner code or script." });
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/users/${userId}/monetise`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        adsUrl: adsUrl.trim(),
        adsFreq,
        adsterraBannerCode: adsterraBannerCode.trim(),
        adsterraApiToken: adsterraApiToken.trim(),
        adsterraDomainId: adsterraDomainId.trim(),
        adsterraPlacementId: adsterraPlacementId.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setSaved(true);
      setEditing(false);
      showToast({ type: "success", message: "Monetisation settings saved." });
      router.refresh();
    } else {
      showToast({ type: "error", message: data.error ?? "Unable to save monetisation settings." });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div
        className="sage-card"
        style={{
          background:
            status === "not-ready"
              ? "linear-gradient(to bottom, rgba(34,16,20,0.98), rgba(24,12,16,0.98), rgba(82,40,48,0.14))"
              : "linear-gradient(to bottom, #123, #023, rgba(0,128,128,0.2))",
          borderColor: status === "not-ready" ? "rgba(248,113,113,0.16)" : undefined,
        }}
      >
        <h1 className="text-lg font-bold text-white mb-2">
          <i className="fas fa-donate text-cyan-400 mr-2" />
          Monetisation Settings
        </h1>
        <p className={`text-sm ${status === "not-ready" ? "font-semibold text-white/78" : "text-white/75"}`}>
          {status === "running" && "Your monetisation is active and your chosen provider is connected."}
          {status === "paused" && "Your monetisation is paused because your content count is below the requirement."}
          {status === "ready" && "Your account is ready for monetisation."}
          {status === "not-ready" && "Monetisation Not Ready"}
        </p>
        <p className="text-xs mt-1">
          {status === "running" && <span className="text-cyan-400">Running..</span>}
          {status === "paused" && <span className="text-red-300">Paused</span>}
          {status === "ready" && <span className="text-cyan-400">Ready</span>}
          {status === "not-ready" && <span className="rounded-full bg-white/8 px-2 py-0.5 text-rose-200">Not Ready</span>}
        </p>
        <p className={`text-xs mt-2 ${status === "not-ready" ? "text-white/58" : "text-white/55"}`}>
          Current posts: {postCount}. Minimum required: {minimumPosts} posts.
        </p>
        {status === "not-ready" ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
            You need {Math.max(minimumPosts - postCount, 0)} more post{minimumPosts - postCount === 1 ? "" : "s"} before monetisation unlocks.
          </div>
        ) : null}
      </div>

      {status === "running" && provider === "adsterra" ? (
        <div className="space-y-3">
          {adsterraStats ? (
            <>
              <MonetisationSummaryCard
                provider={provider}
                title="Adsterra Earnings"
                subtitle="Adsterra-reported stats with recent performance"
                revenue={adsterraStats.allTimeRevenue ?? adsterraStats.revenue}
                impressions={adsterraStats.impressions}
                clicks={adsterraStats.clicks}
                ctr={adsterraStats.ctr}
                cpm={adsterraStats.cpm}
                updatedAt={adsterraStats.updatedAt}
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sage-card rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Adsterra-reported earnings</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-300">
                    {formatMoney(adsterraStats.allTimeRevenue ?? adsterraStats.revenue)}
                  </p>
                  <p className="mt-1 text-xs text-white/45">Total revenue reported by the Adsterra stats API for this setup.</p>
                </div>
                <div className="sage-card rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">7-day impressions</p>
                  <p className="mt-2 text-2xl font-bold text-white">{adsterraStats.impressions.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-white/45">Banner views recorded by your active Adsterra setup.</p>
                </div>
                <div className="sage-card rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Core rate</p>
                  <p className="mt-2 text-2xl font-bold text-white">${adsterraStats.cpm.toFixed(2)} CPM</p>
                  <p className="mt-1 text-xs text-white/45">CTR: {adsterraStats.ctr.toFixed(2)}% across {adsterraStats.clicks.toLocaleString()} clicks.</p>
                </div>
              </div>

              <section className="sage-card rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Last 7 days</p>
                    <p className="mt-1 text-base font-semibold text-white">Daily Adsterra records</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/12 px-3 py-1 text-xs font-semibold text-cyan-300">
                    Day by day
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-white/45">
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Impressions</th>
                        <th className="px-3 py-2 font-medium">Clicks</th>
                        <th className="px-3 py-2 font-medium">Earnings</th>
                        <th className="px-3 py-2 font-medium">CPM</th>
                        <th className="px-3 py-2 font-medium">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adsterraStats.daily.length ? (
                        adsterraStats.daily.map((row) => (
                          <tr key={row.date} className="border-b border-white/[0.06] text-white/80">
                            <td className="px-3 py-2 font-medium text-white">{formatDayLabel(row.date)}</td>
                            <td className="px-3 py-2">{row.impressions.toLocaleString()}</td>
                            <td className="px-3 py-2">{row.clicks.toLocaleString()}</td>
                            <td className="px-3 py-2 text-cyan-300">{formatMoney(row.revenue)}</td>
                            <td className="px-3 py-2">{formatMoney(row.cpm)}</td>
                            <td className="px-3 py-2">{row.ctr.toFixed(2)}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-3 py-4 text-center text-white/45">
                            No day-by-day records available for the last 7 days yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <div className="sage-card rounded-2xl border border-amber-400/20 bg-amber-950/10 px-4 py-4 text-sm text-amber-100">
              <p className="font-semibold">Adsterra stats are not available yet.</p>
              <p className="mt-1 text-amber-100/75">
                Make sure the API token is valid, then save again. The page refreshes after save and will show the 7-day earnings once Adsterra returns stats.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {status === "running" && !editing ? (
        <div className="sage-card space-y-3">
          <div className="flex items-start gap-3 text-white/85">
            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <i className="fa fa-check text-cyan-400 text-lg" />
            </span>
            <div className="pt-1">
              Monetisation is running with <span className="text-cyan-300 capitalize">{provider}</span>.
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {provider === "monetag" && adsUrl ? (
              <button
                type="button"
                onClick={() => window.open(adsUrl, "_blank")}
                className="btn-sage flex-1 py-3"
              >
                <i className="fa fa-external-link-alt mr-1" /> Open Monetag link
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-white/20 px-5 py-3 text-sm text-white hover:border-cyan-400 hover:text-cyan-400"
            >
              <i className="fa fa-tools mr-1" /> Modify monetisation settings
            </button>
          </div>
        </div>
      ) : (
        <div className="sage-card space-y-4">
          <div>
            <h4 className="text-white font-semibold">Choose Monetisation Provider</h4>
            <p className="text-sm text-white/80">You can keep Monetag or switch to Adsterra banner monetisation.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {PROVIDERS.map((item) => {
              const active = provider === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProvider(item.id)}
                  className="rounded-2xl border p-4 text-left transition-colors"
                  style={{
                    background: active ? "rgba(0,200,232,0.12)" : "rgba(255,255,255,0.02)",
                    borderColor: active ? "rgba(0,200,232,0.35)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="text-sm font-semibold text-white">
                    <i className={`${item.icon} mr-2 text-cyan-400`} />
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-white/60">{item.copy}</p>
                </button>
              );
            })}
          </div>

          {provider === "monetag" ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/70">
                <p className="font-semibold text-white">Monetag setup</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Create or log in to your Monetag publisher account.</li>
                  <li>Open your Monetag dashboard and create the monetisation link you want to use.</li>
                  <li>Paste that link below, choose the display frequency, then save.</li>
                </ol>
                <a
                  href={PROVIDER_LINKS.monetag}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"
                >
                  <i className="fas fa-external-link-alt" />
                  Open Monetag
                </a>
              </div>

              <ol className="list-decimal pl-5 text-sm text-white/65 space-y-1">
                <li>Create your Monetag account and copy the direct link.</li>
                <li>Paste the direct link below.</li>
                <li>Choose how often you want those ads to display.</li>
              </ol>

              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider">Monetag direct link</label>
                <input
                  value={adsUrl}
                  onChange={(e) => setAdsUrl(e.target.value)}
                  onFocus={notifyNotQualified}
                  className="sage-input w-full mt-1 text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider">Ads display frequency</label>
                <select
                  value={adsFreq}
                  onChange={(e) => setAdsFreq(e.target.value as "high" | "medium" | "low")}
                  onFocus={notifyNotQualified}
                  className="sage-input w-full mt-1 text-sm bg-transparent"
                >
                  <option value="high">High (70%)</option>
                  <option value="medium">Medium (50%)</option>
                  <option value="low">Low (30%)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/70">
                <p className="font-semibold text-white">Adsterra setup</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Create or log in to your Adsterra publisher account.</li>
                  <li>Add your domain or website inside Adsterra and create a banner placement.</li>
                  <li>Copy the banner code and paste it below.</li>
                  <li>If you want stats on this page too, add your Adsterra API token and optional domain or placement IDs.</li>
                </ol>
                <a
                  href={PROVIDER_LINKS.adsterra}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"
                >
                  <i className="fas fa-external-link-alt" />
                  Open Adsterra
                </a>
              </div>

              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider">Adsterra banner code / script</label>
                <textarea
                  value={adsterraBannerCode}
                  onChange={(e) => setAdsterraBannerCode(e.target.value)}
                  onFocus={notifyNotQualified}
                  className="sage-input w-full mt-1 min-h-[160px] text-sm"
                  placeholder="<script>...</script> or banner embed code"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider">Adsterra API token</label>
                  <input
                    value={adsterraApiToken}
                    onChange={(e) => setAdsterraApiToken(e.target.value)}
                    onFocus={notifyNotQualified}
                    className="sage-input w-full mt-1 text-sm"
                    placeholder="Paste your Adsterra API token"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider">Domain ID</label>
                  <input
                    value={adsterraDomainId}
                    onChange={(e) => setAdsterraDomainId(e.target.value)}
                    onFocus={notifyNotQualified}
                    className="sage-input w-full mt-1 text-sm"
                    placeholder="Optional domain ID"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider">Placement ID</label>
                <input
                  value={adsterraPlacementId}
                  onChange={(e) => setAdsterraPlacementId(e.target.value)}
                  onFocus={notifyNotQualified}
                  className="sage-input w-full mt-1 text-sm"
                  placeholder="Optional placement ID"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !ready || !hasConfig}
            className="btn-sage w-full py-3"
          >
            {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Please wait..</> : saved ? "Save changes" : "Start Monetising"}
          </button>
        </div>
      )}
    </div>
  );
}
