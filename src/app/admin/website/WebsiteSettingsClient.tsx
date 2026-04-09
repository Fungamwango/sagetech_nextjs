"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { ModernLoader } from "@/components/ui/ModernLoader";

const SETTING_FIELDS = [
  ["website_name", "Website name"],
  ["website_url", "Website URL"],
  ["about_info", "About info"],
  ["mission_statement", "Mission statement"],
  ["vision_statement", "Vision statement"],
  ["contact_info", "Contact info"],
  ["whatsapp_number", "WhatsApp number"],
  ["facebook_page_name", "Facebook page name"],
  ["facebook_page_url", "Facebook page URL"],
  ["email_info", "Email info"],
  ["address_info", "Address info"],
  ["monetise_min_posts", "Monetise min posts"],
] as const;

const POINT_FIELDS = [
  ["points_post_create_reward", "Post reward"],
  ["points_like_reward", "Like reward"],
  ["points_comment_reward", "Comment reward"],
  ["points_reply_reward", "Reply reward"],
  ["points_download_reward", "Download reward"],
] as const;

const COST_FIELDS = [
  ["cost_general_post", "General post cost"],
  ["cost_song_post", "Song cost"],
  ["cost_video_post", "Video cost"],
  ["cost_document_post", "Document cost"],
  ["cost_product_post", "Product cost"],
  ["cost_advert_post", "Advert cost"],
  ["cost_book_post", "Book cost"],
] as const;

export default function WebsiteSettingsClient() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/website-settings").then((r) => r.json()).then((d) => {
      setSettings(d.settings ?? {});
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/website-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });

    if (res.ok) {
      showToast({ type: "success", message: "Website settings saved." });
    } else {
      const data = await res.json().catch(() => ({}));
      showToast({ type: "error", message: data.error ?? "Unable to save website settings." });
    }
    setSaving(false);
  };

  if (loading) return <ModernLoader label="Loading website settings..." sublabel="Fetching site configuration" />;

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">Edit website</h1>
      <div className="sage-card space-y-5">
        {SETTING_FIELDS.map(([key, label]) => {
          const isLong = key.includes("info") || key.includes("statement");
          const isNumeric = key === "monetise_min_posts";
          return (
            <div key={key}>
              <label className="text-xs text-white/60 uppercase tracking-wider">{label}</label>
              {isLong ? (
                <textarea
                  value={settings[key] ?? ""}
                  onChange={(e) => setSettings((current) => ({ ...current, [key]: e.target.value }))}
                  className="sage-input mt-1 min-h-28 w-full rounded-lg"
                />
              ) : (
                <input
                  type={isNumeric ? "number" : "text"}
                  min={isNumeric ? 1 : undefined}
                  value={settings[key] ?? ""}
                  onChange={(e) => setSettings((current) => ({ ...current, [key]: e.target.value }))}
                  className="sage-input mt-1 w-full"
                />
              )}
            </div>
          );
        })}

        <div className="border-t border-white/10 pt-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Points Settings</h2>
            <p className="mt-1 text-xs text-white/50">
              These values replace the current hardcoded rewards for post creation, likes, comments, replies, and downloads.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {POINT_FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-white/60 uppercase tracking-wider">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={settings[key] ?? ""}
                  onChange={(e) => setSettings((current) => ({ ...current, [key]: e.target.value }))}
                  className="sage-input mt-1 w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Points Deductions</h2>
            <p className="mt-1 text-xs text-white/50">
              These values control how many points are deducted for premium uploads and advert renewals.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {COST_FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-white/60 uppercase tracking-wider">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={settings[key] ?? ""}
                  onChange={(e) => setSettings((current) => ({ ...current, [key]: e.target.value }))}
                  className="sage-input mt-1 w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="btn-sage w-full sm:w-auto">
            {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
