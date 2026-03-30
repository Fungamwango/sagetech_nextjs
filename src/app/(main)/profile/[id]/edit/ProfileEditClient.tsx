"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { prepareUploadFile } from "@/lib/client/upload";

interface EditUser {
  id: string;
  username: string;
  bio?: string | null;
  picture?: string | null;
  email?: string;
}

export default function ProfileEditClient({ user }: { user: EditUser }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ username: user.username, bio: user.bio ?? "" });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.picture ?? null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPictureFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let pictureUrl = user.picture;

    if (pictureFile) {
      const { file: preparedFile } = await prepareUploadFile(pictureFile);
      const payload = new FormData();
      payload.append("file", preparedFile);
      const uploadRes = await fetch("/api/upload/file", {
        method: "POST",
        body: payload,
      });
      if (uploadRes.ok) {
        const { fileUrl } = await uploadRes.json();
        pictureUrl = fileUrl;
      }
    }

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.username, bio: form.bio, picture: pictureUrl }),
    });

    if (res.ok) {
      setSuccess("Profile updated!");
      showToast({ type: "success", message: "Profile updated." });
      setTimeout(() => router.push(`/profile/${user.id}`), 1500);
    } else {
      const d = await res.json();
      const message = d.error ?? "Update failed";
      setError(message);
      showToast({ type: "error", message });
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-900/20 border border-red-800/40 text-red-400 text-sm px-3 py-2 rounded">{error}</div>}
        {success && <div className="bg-green-900/20 border border-green-800/40 text-green-400 text-sm px-3 py-2 rounded"><i className="fas fa-check mr-1" />{success}</div>}

        <div className="sage-card text-center">
          <div className="relative inline-block mb-3">
            <Image
              src={preview || "/files/default-avatar.svg"}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full object-cover border-2 border-white/30 mx-auto"
            />
          </div>
          <label className="block cursor-pointer">
            <span className="btn-sage text-xs px-4 py-1.5 inline-block">
              <i className="fas fa-camera mr-1" />Change Photo
            </span>
            <input type="file" accept="image/*" onChange={handlePicture} className="hidden" />
          </label>
        </div>

        <div className="sage-card space-y-3">
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="sage-input py-2 mt-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Tell people about yourself..."
              rows={3}
              maxLength={300}
              className="post-textarea mt-1 text-sm"
            />
            <p className="text-xs text-white/30 text-right">{form.bio.length}/300</p>
          </div>

          <div className="text-xs text-white/30">
            <p>{user.email}</p>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-sage w-full py-3">
          {loading ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
