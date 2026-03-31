"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

const PACKAGES = [
  { points: 100, amount: 10, label: "Starter", note: "Best for first recharge" },
  { points: 500, amount: 50, label: "Basic", note: "Good for regular posting" },
  { points: 1000, amount: 100, label: "Standard", note: "Balanced value" },
  { points: 5000, amount: 450, label: "Premium", note: "High-volume option" },
];

export default function RechargeClient({ user }: { user: any }) {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<number | null>(null);
  const [customPoints, setCustomPoints] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [mobileTxRef, setMobileTxRef] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "successful" | "failed">("idle");
  const [initiatingMobile, setInitiatingMobile] = useState(false);
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [verifyCountdown, setVerifyCountdown] = useState(0);
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const lastPolledStatusRef = useRef<"idle" | "pending" | "successful" | "failed">("idle");

  const selectedPackage = selected != null ? PACKAGES[selected] : null;
  const parsedCustomPoints = Number(customPoints || 0);
  const effectivePoints = selectedPackage ? selectedPackage.points : parsedCustomPoints;
  const calculatedKwacha = effectivePoints > 0 ? Number((effectivePoints / 10).toFixed(2)) : 0;
  const trimmedPhone = mobilePhone.trim();
  const canStartMobilePayment =
    effectivePoints >= 10 &&
    /^(\+?260|0)\d{9}$/.test(trimmedPhone.replace(/\s+/g, "")) &&
    !initiatingMobile &&
    paymentStatus !== "pending";

  const messageTone = useMemo(() => {
    if (!message) return null;
    return /error|unable|invalid|failed/i.test(message) ? "error" : "success";
  }, [message]);

  const formatKwacha = (value: number) => `K${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const pointsInvalid =
    customPoints.trim().length > 0 &&
    (!Number.isFinite(parsedCustomPoints) || parsedCustomPoints < 10 || !Number.isInteger(parsedCustomPoints));

  const resetErrors = () => {
    setFieldError("");
    setMessage("");
  };

  const handlePackageSelect = (index: number) => {
    const pkg = PACKAGES[index];
    setSelected(index);
    setCustomPoints(String(pkg.points));
    resetErrors();
  };

  const handleCustomPointsChange = (value: string) => {
    setSelected(null);
    setCustomPoints(value);
    resetErrors();
  };

  const validateCommon = () => {
    if (!Number.isFinite(effectivePoints) || effectivePoints < 10 || !Number.isInteger(effectivePoints)) {
      return "Enter a valid whole number of at least 10 points.";
    }
    if (effectivePoints > 100000) {
      return "Recharge points cannot exceed 100000 in one request.";
    }
    return "";
  };

  const handleInitiateMobileMoney = async () => {
    resetErrors();
    const validation = validateCommon();
    if (validation) {
      setFieldError(validation);
      showToast({ type: "error", message: validation });
      return;
    }

    const cleaned = trimmedPhone.replace(/\s+/g, "");
    if (!/^(\+?260|0)\d{9}$/.test(cleaned)) {
      const error = "Enter a valid Zambian mobile number.";
      setFieldError(error);
      showToast({ type: "error", message: error });
      return;
    }

    setInitiatingMobile(true);
    try {
      const res = await fetch("/api/recharge/mobile-money/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: calculatedKwacha,
          points: effectivePoints,
          phone: cleaned,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const error = data.error ?? "Unable to start mobile money payment.";
        setFieldError(error);
        setMessage(error);
        showToast({ type: "error", message: error });
        return;
      }

      setMobileTxRef(data.txRef ?? "");
      setPaymentStatus("pending");
      lastPolledStatusRef.current = "pending";
      setMessage(data.message ?? "Payment prompt sent to your phone.");
      showToast({ type: "success", message: data.message ?? "Payment prompt sent to your phone." });
    } catch {
      const error = "Unable to start mobile money payment right now.";
      setFieldError(error);
      setMessage(error);
      showToast({ type: "error", message: error });
    } finally {
      setInitiatingMobile(false);
    }
  };

  const handleVerifyMobileMoney = useCallback(async (options?: { silent?: boolean }) => {
    if (!mobileTxRef) return;
    setVerifyingMobile(true);
    try {
      const res = await fetch("/api/recharge/mobile-money/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txRef: mobileTxRef }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const error = data.error ?? "Unable to verify payment.";
        setFieldError(error);
        setMessage(error);
        if (!options?.silent) {
          showToast({ type: "error", message: error });
        }
        return;
      }

      const status = (data.status ?? "pending") as "pending" | "successful" | "failed";
      setPaymentStatus(status);
      setMessage(data.message ?? "Payment verification updated.");
      const previousStatus = lastPolledStatusRef.current;
      lastPolledStatusRef.current = status;
      if (!options?.silent || status !== "pending" || previousStatus !== "pending") {
        showToast({
          type: status === "successful" ? "success" : status === "failed" ? "error" : "success",
          message: data.message ?? "Payment verification updated.",
        });
      }
    } catch {
      const error = "Unable to verify payment right now.";
      setFieldError(error);
      setMessage(error);
      if (!options?.silent) {
        showToast({ type: "error", message: error });
      }
    } finally {
      setVerifyingMobile(false);
    }
  }, [mobileTxRef, showToast]);

  useEffect(() => {
    if (!mobileTxRef || paymentStatus !== "pending") return;

    setVerifyCountdown(5);
    const interval = window.setInterval(() => {
      setVerifyCountdown((current) => (current <= 1 ? 1 : current - 1));
    }, 1000);
    const timeout = window.setTimeout(() => {
      void handleVerifyMobileMoney({ silent: true });
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [mobileTxRef, paymentStatus, handleVerifyMobileMoney]);

  useEffect(() => {
    if (paymentStatus === "pending") return;
    setVerifyCountdown(0);
  }, [paymentStatus]);

  return (
    <div className="space-y-4">
      <section
        className="overflow-hidden rounded-[28px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(0,200,232,0.18), transparent 34%), linear-gradient(180deg, rgba(12,24,35,0.98), rgba(5,13,21,0.98))",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-white">
              <i className="fas fa-coins mr-2 text-cyan-400" />
              Recharge Points
            </h1>
            <p className="mt-1 text-sm text-white/55">Top up your SageTech points balance for uploads, boosts, and premium actions.</p>
          </div>
          <div
            className="shrink-0 rounded-2xl px-4 py-3 text-right"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Current Balance</p>
            <p className="mt-1 text-xl font-bold text-cyan-400">{parseFloat(String(user.points ?? 0)).toFixed(2)} pts</p>
          </div>
        </div>

      </section>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {PACKAGES.map((pkg, index) => {
          const active = selected === index;
          return (
            <button
              key={pkg.label}
              type="button"
              onClick={() => handlePackageSelect(index)}
              className="w-full rounded-[22px] border px-3 py-3 text-left transition-all duration-200"
              style={{
                background: active
                  ? "linear-gradient(180deg, rgba(0,200,232,0.14), rgba(0,168,132,0.08))"
                  : "linear-gradient(180deg, rgba(11,23,34,0.98), rgba(5,13,21,0.98))",
                borderColor: active ? "rgba(0,200,232,0.45)" : "rgba(255,255,255,0.08)",
                boxShadow: active ? "0 16px 36px rgba(0,200,232,0.12)" : "none",
              }}
            >
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-cyan-400/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  {pkg.label}
                </span>
                <p className="mt-2 text-lg font-semibold text-white">{pkg.points.toLocaleString()}</p>
                <p className="text-xs text-white/50">points</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: active ? "rgba(0,200,232,0.18)" : "rgba(255,255,255,0.06)",
                    color: active ? "#67e8f9" : "rgba(255,255,255,0.65)",
                  }}
                >
                  {formatKwacha(pkg.amount)}
                </span>
                <span className="text-[11px] text-white/40">{pkg.note}</span>
              </div>
            </button>
          );
        })}
      </section>

      <section
        className="rounded-[26px] border p-4"
        style={{
          background: "linear-gradient(180deg, rgba(10,22,32,0.98), rgba(5,13,21,0.98))",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Custom Points</label>
            <input
              type="number"
              min={10}
              step={1}
              value={customPoints}
              onChange={(e) => handleCustomPointsChange(e.target.value)}
              placeholder="Enter custom points to purchase"
              className="sage-input mt-2 w-full rounded-2xl px-4 py-3 text-sm"
            />
            <div className="mt-3 text-sm text-white/55">
              <p className="font-medium text-white/75">K1 = 10 points</p>
              <p className="mt-1">Mobile Money only for now via MTN, Airtel, or Zamtel Zambia.</p>
            </div>
            {pointsInvalid && <p className="mt-2 text-xs text-red-400">Enter a whole number of at least 10 points.</p>}
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Recharge Result</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/50">Points</span>
                <span className="font-semibold text-white">{effectivePoints > 0 ? effectivePoints.toLocaleString() : "--"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/50">Mobile Money</span>
                <span className="font-semibold text-white">{effectivePoints > 0 ? formatKwacha(calculatedKwacha) : "--"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {effectivePoints > 0 && (
        <section
          className="rounded-[26px] border p-4"
          style={{
            background: "linear-gradient(180deg, rgba(10,22,32,0.98), rgba(5,13,21,0.98))",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Selected Recharge</p>
              <p className="mt-1 text-base font-semibold text-white">
                {selectedPackage ? `${selectedPackage.label} · ${selectedPackage.points} pts` : `Custom · ${effectivePoints} pts`}
              </p>
            </div>
              <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Mobile Money Amount</p>
              <p className="mt-1 text-base font-semibold text-cyan-400">{formatKwacha(calculatedKwacha)}</p>
              </div>
            </div>
          </section>
      )}

      {message && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            background: messageTone === "error" ? "rgba(127,29,29,0.18)" : "rgba(6,95,70,0.18)",
            borderColor: messageTone === "error" ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)",
            color: messageTone === "error" ? "#fca5a5" : "#86efac",
          }}
        >
          {message}
        </div>
      )}

      <section
        className="rounded-[28px] border p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] space-y-4"
        style={{
          background: "linear-gradient(180deg, rgba(10,22,32,0.98), rgba(5,13,21,0.98))",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
          <div className="space-y-4">

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Phone Number</label>
              <input
                type="tel"
                value={mobilePhone}
                onChange={(e) => {
                  setMobilePhone(e.target.value);
                  setFieldError("");
                }}
                placeholder="097xxxxxxx or 26097xxxxxxx"
                className="sage-input mt-2 w-full rounded-2xl px-4 py-3 text-sm"
              />
            </div>

            {mobileTxRef ? (
              <div
                className="rounded-2xl border p-4 text-sm"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <p className="text-white/55">Transaction Reference</p>
                <p className="mt-1 font-semibold text-cyan-400 break-all">{mobileTxRef}</p>
                <p className="mt-2 text-white/50">
                  Status:{" "}
                  <span
                    className={
                      paymentStatus === "successful"
                        ? "text-emerald-300"
                        : paymentStatus === "failed"
                          ? "text-red-300"
                          : "text-white"
                    }
                  >
                    {paymentStatus === "pending"
                      ? "Processing"
                      : paymentStatus === "successful"
                        ? "Successful"
                        : paymentStatus === "failed"
                          ? "Failed"
                          : "Idle"}
                  </span>
                </p>
                {paymentStatus === "pending" ? (
                  <div
                    className="mt-3 rounded-2xl border px-4 py-3"
                    style={{ background: "rgba(0,200,232,0.08)", borderColor: "rgba(0,200,232,0.18)" }}
                  >
                    <div className="flex items-center gap-2 text-cyan-300">
                      <i className="fas fa-spinner fa-spin" />
                      <span className="font-medium">Payment is being processed</span>
                    </div>
                    <p className="mt-2 text-white/60">
                      Confirm the USSD prompt on your phone. We are checking automatically and will credit your account as soon as the payment succeeds.
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/45">
                      Next check in {verifyCountdown}s
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div>
              <button
                type="button"
                onClick={handleInitiateMobileMoney}
                disabled={!canStartMobilePayment}
                className="btn-sage w-full py-3 text-sm disabled:opacity-50"
              >
                {initiatingMobile || verifyingMobile ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" />
                    {initiatingMobile ? "Sending prompt..." : "Checking payment..."}
                  </>
                ) : paymentStatus === "pending" ? (
                  "Waiting for payment confirmation..."
                ) : (
                  `Pay ${formatKwacha(calculatedKwacha)} now`
                )}
              </button>
            </div>
          </div>

        {fieldError && (
          <div className="rounded-2xl border border-red-400/20 bg-red-900/10 px-4 py-3 text-sm text-red-300">
            {fieldError}
          </div>
        )}
      </section>
    </div>
  );
}
