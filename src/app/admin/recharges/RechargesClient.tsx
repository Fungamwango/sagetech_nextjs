"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AdminModal from "../components/AdminModal";
import { ModernLoader } from "@/components/ui/ModernLoader";

interface Recharge {
  id: string;
  amount: string;
  points: string;
  method: string;
  transactionId?: string | null;
  requestReason?: string | null;
  decisionReason?: string | null;
  status: string;
  createdAt: string;
  processedAt?: string | null;
  userId?: string | null;
  username?: string | null;
  email?: string | null;
  picture?: string | null;
}

export default function RechargesClient() {
  const { showToast } = useToast();
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [detailsRecharge, setDetailsRecharge] = useState<Recharge | null>(null);
  const [pendingAction, setPendingAction] = useState<{ recharge: Recharge; approve: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recharge | null>(null);
  const [processing, setProcessing] = useState<false | "decision" | "delete">(false);
  const [decisionReason, setDecisionReason] = useState("");

  const loadRecharges = async (nextStatus = status, nextQuery = query) => {
    setLoading(true);
    if (nextQuery.trim().length > 1) setSearching(true);
    const params = new URLSearchParams({ status: nextStatus });
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    const res = await fetch(`/api/admin/recharges?${params.toString()}`);
    const data = await res.json().catch(() => ({ recharges: [] }));
    setRecharges(data.recharges ?? []);
    setLoading(false);
    setSearching(false);
  };

  useEffect(() => {
    void loadRecharges(status, query);
  }, [status]);

  useEffect(() => {
    if (!pendingAction) {
      setDecisionReason("");
    }
  }, [pendingAction]);

  const processRecharge = async () => {
    if (!pendingAction) return;
    setProcessing("decision");
    const res = await fetch(`/api/admin/recharges/${pendingAction.recharge.id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve: pendingAction.approve, reason: decisionReason.trim() }),
    });
    if (!res.ok) {
      showToast({ type: "error", message: "Unable to process recharge." });
      setProcessing(false);
      return;
    }

    const nextStatus = pendingAction.approve ? "approved" : "rejected";
    setRecharges((current) =>
      status === "pending"
        ? current.filter((item) => item.id !== pendingAction.recharge.id)
        : current.map((item) => item.id === pendingAction.recharge.id ? { ...item, status: nextStatus, processedAt: new Date().toISOString(), decisionReason: decisionReason.trim() || null } : item)
    );
    if (detailsRecharge?.id === pendingAction.recharge.id) {
      setDetailsRecharge((current) => current ? { ...current, status: nextStatus, processedAt: new Date().toISOString(), decisionReason: decisionReason.trim() || null } : current);
    }
    showToast({
      type: "success",
      message: pendingAction.approve ? "Recharge approved and user notified." : "Recharge rejected and user notified.",
    });
    setPendingAction(null);
    setDecisionReason("");
    setProcessing(false);
  };

  const deleteRecharge = async () => {
    if (!deleteTarget) return;
    setProcessing("delete");
    const res = await fetch(`/api/admin/recharges/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast({ type: "error", message: "Unable to delete recharge request." });
      setProcessing(false);
      return;
    }
    setRecharges((current) => current.filter((item) => item.id !== deleteTarget.id));
    if (detailsRecharge?.id === deleteTarget.id) setDetailsRecharge(null);
    showToast({ type: "success", message: "Recharge request deleted." });
    setDeleteTarget(null);
    setProcessing(false);
  };

  const summary = useMemo(() => {
    const pending = recharges.filter((item) => item.status === "pending").length;
    const approved = recharges.filter((item) => item.status === "approved").length;
    const rejected = recharges.filter((item) => item.status === "rejected").length;
    return { pending, approved, rejected };
  }, [recharges]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-1 text-xl font-bold text-white">Recharge Requests</h1>
          <p className="text-sm text-white/40">Review pending payments, inspect request history, and notify users automatically.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                status === value ? "bg-[#006688] text-white" : "border border-white/30 text-white/60 hover:text-white"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const nextQuery = search.trim();
          setQuery(nextQuery);
          void loadRecharges(status, nextQuery);
        }}
        className="mb-4 flex items-stretch gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username, email, method, or transaction ID..."
          className="w-[80%] min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
        />
        <div className="flex w-[20%] min-w-[112px] gap-2">
          <button
            type="submit"
            className="btn-sage flex-1 px-3 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={search.trim().length === 1}
          >
            {searching ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                <span className="hidden sm:inline">Searching</span>
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="sage-card">
          <p className="text-xs uppercase tracking-wide text-white/35">Pending in view</p>
          <p className="mt-2 text-2xl font-bold text-yellow-300">{summary.pending}</p>
        </div>
        <div className="sage-card">
          <p className="text-xs uppercase tracking-wide text-white/35">Approved in view</p>
          <p className="mt-2 text-2xl font-bold text-green-400">{summary.approved}</p>
        </div>
        <div className="sage-card">
          <p className="text-xs uppercase tracking-wide text-white/35">Rejected in view</p>
          <p className="mt-2 text-2xl font-bold text-red-400">{summary.rejected}</p>
        </div>
      </div>

      {loading ? <ModernLoader label="Loading recharges..." sublabel="Checking payment requests and history" /> : null}

      <div className="space-y-3">
        {recharges.map((recharge) => (
          <div key={recharge.id} className="sage-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <button type="button" onClick={() => setDetailsRecharge(recharge)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                <Image
                  src={recharge.picture || "/files/default-avatar.svg"}
                  alt={recharge.username || "user"}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full border border-white/15 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white capitalize">{recharge.username || "Unknown user"}</p>
                    <span className={`text-xs capitalize ${recharge.status === "approved" ? "text-green-400" : recharge.status === "rejected" ? "text-red-400" : "text-yellow-300"}`}>
                      {recharge.status}
                    </span>
                  </div>
                  <p className="truncate text-xs text-white/40">{recharge.email || "No email recorded"}</p>
                  <div className="mt-1 flex flex-wrap gap-3">
                    <span className="text-sm font-bold text-cyan-400">+{recharge.points} pts</span>
                    <span className="text-xs text-white/50">${recharge.amount} via {recharge.method}</span>
                  </div>
                  {recharge.transactionId ? <p className="mt-0.5 text-xs text-white/30">Txn: {recharge.transactionId}</p> : null}
                  {recharge.requestReason ? <p className="mt-1 line-clamp-2 text-xs text-white/45">Review note: {recharge.requestReason}</p> : null}
                </div>
              </button>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDetailsRecharge(recharge)}
                  className="rounded-lg border border-cyan-800/40 px-2.5 py-2 text-xs text-cyan-400 transition-colors hover:bg-cyan-900/20"
                  title="View details"
                >
                  <i className="fas fa-eye" />
                </button>
                {recharge.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => setPendingAction({ recharge, approve: true })}
                    className="rounded-lg border border-green-800/40 bg-green-900/30 px-3 py-1.5 text-xs text-green-400 transition-colors hover:bg-green-900/50"
                  >
                    <i className="fas fa-check mr-1" />
                    Approve
                  </button>
                ) : null}
                {recharge.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => setPendingAction({ recharge, approve: false })}
                    className="rounded-lg border border-red-800/40 bg-red-900/20 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-900/40"
                  >
                    <i className="fas fa-times mr-1" />
                    Reject
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(recharge)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && recharges.length === 0 ? <p className="py-8 text-center text-sm text-white/40">No recharge requests found</p> : null}

      <AdminModal
        open={Boolean(detailsRecharge)}
        onClose={() => setDetailsRecharge(null)}
        title={detailsRecharge ? `Recharge from ${detailsRecharge.username || "Unknown user"}` : "Recharge details"}
        description="Inspect the request, verify payment details, and decide what to do next."
        widthClassName="max-w-xl"
      >
        {detailsRecharge ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <Image
                src={detailsRecharge.picture || "/files/default-avatar.svg"}
                alt={detailsRecharge.username || "user"}
                width={58}
                height={58}
                className="h-14 w-14 rounded-full border border-white/15 object-cover"
              />
              <div>
                <p className="text-base font-semibold text-white capitalize">{detailsRecharge.username || "Unknown user"}</p>
                <p className="text-sm text-white/45">{detailsRecharge.email || "No email recorded"}</p>
                <p className={`mt-1 text-xs capitalize ${detailsRecharge.status === "approved" ? "text-green-400" : detailsRecharge.status === "rejected" ? "text-red-400" : "text-yellow-300"}`}>
                  {detailsRecharge.status}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-white/35">Amount</p>
                <p className="mt-2 text-lg font-semibold text-white">${detailsRecharge.amount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-white/35">Points</p>
                <p className="mt-2 text-lg font-semibold text-cyan-400">{detailsRecharge.points} pts</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-white/35">Method</p>
                <p className="mt-2 text-sm text-white">{detailsRecharge.method}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-white/35">Transaction ID</p>
                <p className="mt-2 break-all text-sm text-white">{detailsRecharge.transactionId || "No transaction ID provided"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-white/35">User Review Note</p>
                <p className="mt-2 text-sm text-white">{detailsRecharge.requestReason || "No review note provided"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-white/35">Decision Reason</p>
                <p className="mt-2 text-sm text-white">{detailsRecharge.decisionReason || "No decision reason recorded yet"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-white/35">Created</p>
                <p className="mt-2 text-sm text-white">{new Date(detailsRecharge.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-white/35">Processed</p>
                <p className="mt-2 text-sm text-white">{detailsRecharge.processedAt ? new Date(detailsRecharge.processedAt).toLocaleString() : "Not processed yet"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {detailsRecharge.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => setPendingAction({ recharge: detailsRecharge, approve: false })}
                  className="rounded-xl border border-red-800/40 bg-red-900/20 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-900/35"
                >
                  Reject request
                </button>
              ) : null}
              {detailsRecharge.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => setPendingAction({ recharge: detailsRecharge, approve: true })}
                  className="rounded-xl border border-green-800/40 bg-green-900/30 px-4 py-2 text-sm text-green-300 transition-colors hover:bg-green-900/50"
                >
                  Approve request
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setDeleteTarget(detailsRecharge)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                Delete record
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>

      <AdminConfirmModal
        open={Boolean(pendingAction)}
        onClose={() => !processing && setPendingAction(null)}
        onConfirm={processRecharge}
        loading={processing === "decision"}
        title={pendingAction?.approve ? "Approve recharge" : "Reject recharge"}
        description={
          pendingAction
            ? `${pendingAction.approve ? "Approve" : "Reject"} the recharge from ${pendingAction.recharge.username || "this user"} for ${pendingAction.recharge.points} points? The user will be notified automatically.`
            : ""
        }
        confirmLabel={pendingAction?.approve ? "Approve recharge" : "Reject recharge"}
        intent={pendingAction?.approve ? "success" : "danger"}
      >
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Reason</label>
          <textarea
            value={decisionReason}
            onChange={(e) => setDecisionReason(e.target.value)}
            rows={3}
            placeholder={pendingAction?.approve ? "Optional approval reason" : "Why is this request being rejected?"}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
          />
        </div>
      </AdminConfirmModal>

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => !processing && setDeleteTarget(null)}
        onConfirm={deleteRecharge}
        loading={processing === "delete"}
        title="Delete recharge request"
        description="Delete this recharge request record from the admin system? This only removes the request record."
        confirmLabel="Delete request"
        intent="danger"
      />
    </div>
  );
}
