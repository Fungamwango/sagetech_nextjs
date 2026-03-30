"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(d.error ?? "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-white" style={{ fontFamily: "serif" }}>
          SageTech <span className="text-red-400">Admin</span>
        </h1>
        <form onSubmit={handleSubmit} className="sage-card space-y-4 px-4 py-5 sm:px-5">
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 px-3 py-2 rounded">{error}</p>
          )}
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Username or phone</label>
            <input type="text" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required className="sage-input py-2.5 mt-1 w-full" />
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required className="sage-input py-2.5 mt-1 w-full" />
          </div>
          <button type="submit" disabled={loading} className="btn-sage w-full py-3">
            {loading ? <><i className="fas fa-spinner fa-spin mr-1" />Signing in...</> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
