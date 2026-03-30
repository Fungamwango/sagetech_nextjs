"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

type MonetiseProps = {
  userId: string;
  initialAdsUrl: string;
  initialAdsFreq: "high" | "medium" | "low";
  postCount: number;
  isMonetised: boolean;
};

export default function MonetiseClient({
  userId,
  initialAdsUrl,
  initialAdsFreq,
  postCount,
  isMonetised,
}: MonetiseProps) {
  const { showToast } = useToast();
  const [adsUrl, setAdsUrl] = useState(initialAdsUrl);
  const [adsFreq, setAdsFreq] = useState<"high" | "medium" | "low">(initialAdsFreq);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialAdsUrl);
  const [editing, setEditing] = useState(!initialAdsUrl);

  const ready = postCount >= 5;
  const status: "running" | "paused" | "ready" | "not-ready" =
    saved && isMonetised ? "running" : saved && !ready ? "paused" : ready ? "ready" : "not-ready";

  const handleSave = async () => {
    if (!ready) {
      showToast({ type: "error", message: "You must create at least 5 posts to start monetising." });
      return;
    }
    if (!adsUrl.trim()) {
      showToast({ type: "error", message: "Please enter the ads url." });
      return;
    }
    if (!adsUrl.startsWith("https://") && !adsUrl.startsWith("http://")) {
      showToast({ type: "error", message: "Invalid ads url. It must start with http or https." });
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/users/${userId}/monetise`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adsUrl: adsUrl.trim(), adsFreq }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setSaved(true);
      setEditing(false);
      showToast({ type: "success", message: "Monetisation settings saved." });
    } else {
      showToast({ type: "error", message: data.error ?? "Unable to save monetisation settings." });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="sage-card" style={{ background: "linear-gradient(to bottom, #123, #023, rgba(0,128,128,0.2))" }}>
        <h1 className="text-lg font-bold text-white mb-2">
          <i className="fas fa-donate text-cyan-400 mr-2" />
          Monetisation Settings
        </h1>
        <p className="text-sm text-white/75">
          {status === "running" && "You are currently monetising your content on SageTech!"}
          {status === "paused" && "Your monetisation is paused because your content count is below the requirement."}
          {status === "ready" && "Your account is ready for monetisation."}
          {status === "not-ready" && "Monetisation Not Ready"}
        </p>
        <p className="text-xs mt-1">
          {status === "running" && <span className="text-cyan-400">Running..</span>}
          {status === "paused" && <span className="text-red-400">Paused</span>}
          {status === "ready" && <span className="text-cyan-400">Ready</span>}
          {status === "not-ready" && <span className="text-red-400">Not Ready</span>}
        </p>
        <p className="text-xs text-white/55 mt-1">Current posts: {postCount}. Minimum required: 5 posts.</p>
      </div>

      {status === "running" && !editing ? (
        <div className="sage-card space-y-3">
          <div className="flex items-start gap-3 text-white/85">
            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <i className="fa fa-check text-cyan-400 text-lg" />
            </span>
            <div className="pt-1">You are currently monetising your content on sagetech!</div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => window.open("https://publishers.monetag.com/", "_blank")}
              className="btn-sage flex-1 py-3"
            >
              <i className="fa fa-donate mr-1" /> Check your earnings on monetag
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-white/20 px-5 py-3 text-sm text-white hover:border-cyan-400 hover:text-cyan-400"
            >
              <i className="fa fa-tools mr-1" /> Modify Ads settings
            </button>
          </div>
        </div>
      ) : (
        <div className="sage-card space-y-3">
          <h4 className="text-white font-semibold">Monetisation Settings</h4>
          <p className="text-sm text-white/80">Follow the instructions below to start monetising your content.</p>
          <ol className="list-decimal pl-5 text-sm text-white/65 space-y-1">
            <li>
              Go to{" "}
              <a className="text-sky-400 underline" href="https://monetag.com/?ref_id=u70r" target="_blank" rel="noreferrer">
                Monetag Here
              </a>
            </li>
            <li>Create your account and get the Ads direct link</li>
            <li>Copy the Monetag direct link and paste it below in the ads url input</li>
            <li>Set how often you want the Ads to display on your posts</li>
            <li>
              Watch the setup{" "}
              <a
                className="text-sky-400 underline"
                href="https://youtube.com/shorts/4H1OVRgtYtw?si=nOCQtxgkcxV-pLkP"
                target="_blank"
                rel="noreferrer"
              >
                Video here
              </a>
            </li>
          </ol>

          <strong className="block text-sm text-white/75">
            <span className="text-amber-500">NOTE:</span> You earn every time the user clicks and views an Ad based on
            the Monetag CPM value. All the earnings, stats and payments are handled by Monetag, we are not associated with it.
          </strong>

          <hr className="border-white/10" />

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Ads url</label>
            <input
              value={adsUrl}
              onChange={(e) => setAdsUrl(e.target.value)}
              className="sage-input w-full mt-1 text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Ads display frequency</label>
            <select
              value={adsFreq}
              onChange={(e) => setAdsFreq(e.target.value as "high" | "medium" | "low")}
              className="sage-input w-full mt-1 text-sm bg-transparent"
            >
              <option value="high">High (70%)</option>
              <option value="medium">Medium (50%)</option>
              <option value="low">Low (30%)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-sage w-full py-3"
          >
            {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Please wait..</> : saved ? "Save changes" : "Start Monetising"}
          </button>
        </div>
      )}
    </div>
  );
}
