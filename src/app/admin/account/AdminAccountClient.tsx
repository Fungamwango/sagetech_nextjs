"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import { prepareUploadFile } from "@/lib/client/upload";
import { ModernLoader } from "@/components/ui/ModernLoader";
import AdminConfirmModal from "../components/AdminConfirmModal";

interface AdminAccount {
  id: string;
  username: string;
  primaryPhone: string;
  secondaryPhone?: string | null;
  email: string;
  picture?: string | null;
  createdAt: string;
}

export default function AdminAccountClient() {
  const { showToast } = useToast();
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState({ username: "", secondaryPhone: "", email: "", currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [pendingPictureReset, setPendingPictureReset] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/account").then((r) => r.json()).then((d) => {
      setAccount(d.account ?? null);
      setForm({
        username: d.account?.username ?? "",
        secondaryPhone: d.account?.secondaryPhone ?? "",
        email: d.account?.email ?? "",
        currentPassword: "",
        newPassword: "",
      });
      setLoading(false);
    });
  }, []);

  const securitySummary = useMemo(() => {
    if (!form.newPassword) return "No password change requested";
    if (form.newPassword.length < 8) return "Password must be at least 8 characters";
    return "Password change is ready to submit";
  }, [form.newPassword]);

  const validate = () => {
    const errors: Record<string, string> = {};
    const username = form.username.trim();
    const email = form.email.trim();
    const secondaryPhone = form.secondaryPhone.trim();
    const currentPassword = form.currentPassword.trim();
    const newPassword = form.newPassword.trim();

    if (username.length < 3) errors.username = "Username must be at least 3 characters.";
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.username = "Use only letters, numbers, and underscores.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

    if (secondaryPhone && !/^\+?[0-9]{9,20}$/.test(secondaryPhone)) {
      errors.secondaryPhone = "Secondary phone must be 9 to 20 digits.";
    }

    if (newPassword) {
      if (!currentPassword) errors.currentPassword = "Current password is required.";
      if (newPassword.length < 8) errors.newPassword = "New password must be at least 8 characters.";
      else if (newPassword === currentPassword) errors.newPassword = "Use a different new password.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username.trim(),
        secondaryPhone: form.secondaryPhone.trim(),
        email: form.email.trim(),
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setAccount((current) => current ? { ...current, username: form.username.trim(), secondaryPhone: form.secondaryPhone.trim(), email: form.email.trim().toLowerCase() } : current);
      setForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
      setFieldErrors({});
      showToast({ type: "success", message: "Account details updated." });
    } else {
      showToast({ type: "error", message: data.error ?? "Unable to update account." });
    }
    setSaving(false);
    setPendingSave(false);
  };

  const uploadPicture = async (file: File | null) => {
    if (!file) return;
    setUploadingPicture(true);

    try {
      const { file: preparedFile } = await prepareUploadFile(file);
      const payload = new FormData();
      payload.append("file", preparedFile);
      const uploadRes = await fetch("/api/upload/file", { method: "POST", body: payload });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? "Unable to upload picture");

      const saveRes = await fetch("/api/admin/account/picture", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ picture: uploadData.fileUrl }),
      });

      if (!saveRes.ok) {
        const saveData = await saveRes.json().catch(() => ({}));
        throw new Error(saveData.error ?? "Unable to save picture");
      }

      setAccount((current) => current ? { ...current, picture: uploadData.fileUrl } : current);
      showToast({ type: "success", message: "Admin picture updated." });
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to upload picture." });
    }

    setUploadingPicture(false);
  };

  const resetPicture = async () => {
    setUploadingPicture(true);
    const res = await fetch("/api/admin/account/picture", { method: "DELETE" });
    if (res.ok) {
      setAccount((current) => current ? { ...current, picture: "/files/default-avatar.svg" } : current);
      showToast({ type: "success", message: "Admin picture reset." });
    } else {
      showToast({ type: "error", message: "Unable to reset admin picture." });
    }
    setUploadingPicture(false);
    setPendingPictureReset(false);
  };

  if (loading) return <ModernLoader label="Loading account..." sublabel="Preparing admin profile" />;
  if (!account) return <p className="text-red-400 text-sm">Unable to load admin account.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">Account details</h1>
      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="sage-card">
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border border-white/10">
              <Image src={account.picture || "/files/default-avatar.svg"} alt={account.username} fill className="object-cover" />
              {uploadingPicture && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
                  <i className="fas fa-spinner fa-spin mr-2" />Processing...
                </div>
              )}
            </div>
            <label className="mt-4 block cursor-pointer text-center text-sm text-cyan-400 hover:underline">
              Change picture
              <input type="file" accept="image/*" hidden onChange={(e) => uploadPicture(e.target.files?.[0] ?? null)} />
            </label>
            <button
              type="button"
              onClick={() => setPendingPictureReset(true)}
              className="mt-3 w-full rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              Reset picture
            </button>
          </div>

          <div className="sage-card space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/35">Admin ID</p>
              <p className="mt-1 break-all text-sm text-white/75">{account.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/35">Primary phone</p>
              <p className="mt-1 text-sm text-white/85">{account.primaryPhone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/35">Created</p>
              <p className="mt-1 text-sm text-white/85">{new Date(account.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/35">Security status</p>
              <p className={`mt-1 text-sm ${form.newPassword && form.newPassword.length >= 8 ? "text-green-300" : "text-white/70"}`}>{securitySummary}</p>
            </div>
          </div>
        </div>

        <div className="sage-card space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white">Profile controls</h2>
            <p className="mt-1 text-sm text-white/45">Update contact details carefully. Sensitive changes require explicit confirmation.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Primary phone number</label>
              <input value={account.primaryPhone} readOnly className="sage-input mt-1 w-full opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Secondary phone number</label>
              <input value={form.secondaryPhone} onChange={(e) => setForm((current) => ({ ...current, secondaryPhone: e.target.value }))} className="sage-input mt-1 w-full" />
              {fieldErrors.secondaryPhone ? <p className="mt-1 text-xs text-red-300">{fieldErrors.secondaryPhone}</p> : null}
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Username</label>
              <input value={form.username} onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))} className="sage-input mt-1 w-full" />
              {fieldErrors.username ? <p className="mt-1 text-xs text-red-300">{fieldErrors.username}</p> : null}
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Email</label>
              <input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} className="sage-input mt-1 w-full" />
              {fieldErrors.email ? <p className="mt-1 text-xs text-red-300">{fieldErrors.email}</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-white">Security controls</h3>
            <p className="mt-1 text-sm text-white/45">Leave the password fields empty if you are only updating profile details.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider">Current password</label>
                <input type="password" value={form.currentPassword} onChange={(e) => setForm((current) => ({ ...current, currentPassword: e.target.value }))} className="sage-input mt-1 w-full" />
                {fieldErrors.currentPassword ? <p className="mt-1 text-xs text-red-300">{fieldErrors.currentPassword}</p> : null}
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider">New password</label>
                <input type="password" value={form.newPassword} onChange={(e) => setForm((current) => ({ ...current, newPassword: e.target.value }))} className="sage-input mt-1 w-full" />
                {fieldErrors.newPassword ? <p className="mt-1 text-xs text-red-300">{fieldErrors.newPassword}</p> : null}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!validate()) return;
                setPendingSave(true);
              }}
              disabled={saving}
              className="btn-sage w-full sm:w-auto"
            >
              {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : "Review and save"}
            </button>
          </div>
        </div>
      </div>

      <AdminConfirmModal
        open={pendingSave}
        onClose={() => !saving && setPendingSave(false)}
        onConfirm={() => void save()}
        loading={saving}
        title="Save admin account changes"
        description={form.newPassword.trim() ? "Apply these profile updates and change the admin password as well?" : "Apply these admin profile changes now?"}
        confirmLabel="Save changes"
        intent="warning"
      />

      <AdminConfirmModal
        open={pendingPictureReset}
        onClose={() => !uploadingPicture && setPendingPictureReset(false)}
        onConfirm={() => void resetPicture()}
        loading={uploadingPicture}
        title="Reset admin picture"
        description="Remove the current admin picture and restore the default avatar?"
        confirmLabel="Reset picture"
        intent="danger"
      />
    </div>
  );
}
