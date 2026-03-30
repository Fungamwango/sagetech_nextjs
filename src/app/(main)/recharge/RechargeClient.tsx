"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

const PACKAGES = [
  { points: 100, amount: 1, label: "Starter", usd: "$1" },
  { points: 500, amount: 5, label: "Basic", usd: "$5" },
  { points: 1000, amount: 10, label: "Standard", usd: "$10" },
  { points: 5000, amount: 45, label: "Premium", usd: "$45" },
];

export default function RechargeClient({ user }: { user: any }) {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<number | null>(null);
  const [method, setMethod] = useState("paypal");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === null) return;
    setSubmitting(true);

    const pkg = PACKAGES[selected];
    const res = await fetch("/api/recharge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: pkg.amount,
        method,
        transactionId,
      }),
    });

    const d = await res.json();
    const nextMessage = res.ok ? d.message : d.error ?? "Error";
    setMessage(nextMessage);
    showToast({ type: res.ok ? "success" : "error", message: nextMessage });
    setSubmitting(false);
  };

  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-1">
        <i className="fas fa-coins text-cyan-400 mr-2" />Recharge Points
      </h1>
      <p className="text-sm text-white/50 mb-4">
        Current balance: <span className="text-cyan-400 font-bold">{parseFloat(String(user.points ?? 0)).toFixed(2)} pts</span>
      </p>

      <div className="sage-card mb-4" style={{ background: "linear-gradient(to bottom, #123, #023, rgba(0,128,128,0.2))" }}>
        <p className="text-sm text-white/70 mb-1">💡 Exchange Rate</p>
        <p className="text-white text-lg font-bold">$1 = 100 points</p>
        <p className="text-white/50 text-xs">Mobile Money: K10 = 100 points (MTN Zambia)</p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PACKAGES.map((pkg, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`sage-card text-center transition-all ${
              selected === i ? "border-cyan-600/60 bg-cyan-900/20" : "hover:border-cyan-800/40"
            }`}
          >
            <p className="text-xs text-white/50 uppercase">{pkg.label}</p>
            <p className="text-2xl font-bold text-cyan-400 my-1">{pkg.points}</p>
            <p className="text-xs text-white/60">pts</p>
            <p className="text-sm text-white mt-1">{pkg.usd}</p>
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-4 px-3 py-2 rounded text-sm border ${message.includes("Error") || message.includes("error") ? "bg-red-900/20 border-red-800/40 text-red-400" : "bg-green-900/20 border-green-800/40 text-green-400"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="sage-card space-y-3">
        <div>
          <label className="text-xs text-white/60 uppercase tracking-wider">Payment Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="sage-input text-sm py-2 mt-1 w-full bg-transparent"
          >
            <option value="paypal">PayPal</option>
            <option value="mtn_momo">MTN Mobile Money (Zambia)</option>
            <option value="airtel_money">Airtel Money (Zambia)</option>
          </select>
        </div>

        {method !== "paypal" && (
          <div className="text-sm text-white/60 bg-black/20 rounded p-3 border border-white/10">
            <p className="font-semibold mb-1">Send to:</p>
            <p>📱 0763 428 450 (MTN/Airtel)</p>
            <p className="text-xs mt-1 text-white/40">Enter your transaction ID after payment</p>
          </div>
        )}

        <div>
          <label className="text-xs text-white/60 uppercase tracking-wider">Transaction ID / Reference</label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID"
            className="sage-input text-sm py-2 mt-1 w-full"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || selected === null}
          className="btn-sage w-full py-3"
        >
          {submitting ? (
            <><i className="fas fa-spinner fa-spin mr-1" />Submitting...</>
          ) : selected !== null ? (
            `Submit Request (${PACKAGES[selected].points} pts for ${PACKAGES[selected].usd})`
          ) : (
            "Select a package first"
          )}
        </button>
      </form>
    </div>
  );
}
