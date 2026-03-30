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
                  value={settings[key] ?? ""}
                  onChange={(e) => setSettings((current) => ({ ...current, [key]: e.target.value }))}
                  className="sage-input mt-1 w-full"
                />
              )}
            </div>
          );
        })}

        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="btn-sage w-full sm:w-auto">
            {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
