"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AdminModal from "../components/AdminModal";
import { ModernLoader } from "@/components/ui/ModernLoader";

interface ReportItem {
  id: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
  postId?: string | null;
  postPath?: string | null;
  postType?: string | null;
  postPreview?: string | null;
  reporterUsername?: string | null;
  reporterPicture?: string | null;
  culpritId?: string | null;
  culpritUsername?: string | null;
  culpritPicture?: string | null;
}

type StatusAction = { kind: "status"; id: string; status: ReportItem["status"] };
type DeleteAction = { kind: "delete-report"; report: ReportItem } | { kind: "delete-post"; report: ReportItem };

export default function AdminReportsClient() {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<StatusAction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeleteAction | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<ReportItem | null>(null);
  const [suspendForm, setSuspendForm] = useState({ durationValue: "7", durationUnit: "days", reason: "" });
  const [suspending, setSuspending] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports");
    const data = await res.json().catch(() => ({ reports: [] }));
    setReports(data.reports ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reports;
    return reports.filter((report) =>
      [
        report.reason,
        report.reporterUsername,
        report.culpritUsername,
        report.postPreview,
        report.postType,
        report.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [reports, search]);

  const updateStatus = async () => {
    if (!pendingStatus) return;
    setActingId(pendingStatus.id);
    const res = await fetch(`/api/admin/reports/${pendingStatus.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: pendingStatus.status }),
    });
    if (res.ok) {
      setReports((current) =>
        current.map((report) => (report.id === pendingStatus.id ? { ...report, status: pendingStatus.status } : report))
      );
      showToast({ type: "success", message: `Report marked as ${pendingStatus.status}.` });
    } else {
      showToast({ type: "error", message: "Unable to update report." });
    }
    setActingId(null);
    setPendingStatus(null);
  };

  const deleteAction = async () => {
    if (!pendingDelete) return;
    const reportId = pendingDelete.report.id;
    setActingId(reportId);
    const endpoint = pendingDelete.kind === "delete-post"
      ? `/api/admin/reports/${reportId}/delete-post`
      : `/api/admin/reports/${reportId}`;
    const method = pendingDelete.kind === "delete-post" ? "POST" : "DELETE";
    const res = await fetch(endpoint, { method });
    if (res.ok) {
      setReports((current) =>
        current.filter((report) => {
          if (pendingDelete.kind === "delete-report") return report.id !== reportId;
          return report.postId !== pendingDelete.report.postId;
        })
      );
      showToast({
        type: "success",
        message: pendingDelete.kind === "delete-post"
          ? "Reported post deleted and culprit notified."
          : "Report deleted.",
      });
    } else {
      const data = await res.json().catch(() => null);
      showToast({ type: "error", message: data?.error || "Unable to complete this report action." });
    }
    setActingId(null);
    setPendingDelete(null);
  };

  const suspendUser = async () => {
    if (!suspendTarget) return;
    const durationValue = Number(suspendForm.durationValue);
    if (!Number.isInteger(durationValue) || durationValue <= 0) {
      showToast({ type: "error", message: "Enter a valid suspension duration." });
      return;
    }
    if (suspendForm.reason.trim().length < 3) {
      showToast({ type: "error", message: "Enter a clear suspension reason." });
      return;
    }

    setSuspending(true);
    setActingId(suspendTarget.id);
    const res = await fetch(`/api/admin/reports/${suspendTarget.id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationValue,
        durationUnit: suspendForm.durationUnit,
        reason: suspendForm.reason.trim(),
      }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      setReports((current) =>
        current.map((report) => (report.id === suspendTarget.id ? { ...report, status: "resolved" } : report))
      );
      showToast({
        type: "success",
        message: data?.culpritUsername
          ? `${data.culpritUsername} suspended and notified.`
          : "User suspended and notified.",
      });
      setSuspendTarget(null);
      setSuspendForm({ durationValue: "7", durationUnit: "days", reason: "" });
    } else {
      const data = await res.json().catch(() => null);
      showToast({ type: "error", message: data?.error || "Unable to suspend this user." });
    }

    setSuspending(false);
    setActingId(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Reports from users</h1>
          <p className="text-sm text-white/40">Review reported posts, inspect the culprit, and take moderation action.</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports, culprits, posts..."
          className="w-full max-w-md rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
        />
      </div>

      {loading ? <ModernLoader label="Loading reports..." sublabel="Collecting moderation signals" /> : null}

      <div className="space-y-4">
        {filteredReports.map((report) => {
          const busy = actingId === report.id;
          return (
            <div key={report.id} className="sage-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/35">Reported by</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Image
                          src={report.reporterPicture || "/files/default-avatar.svg"}
                          alt={report.reporterUsername || "Reporter"}
                          width={38}
                          height={38}
                          className="h-9 w-9 rounded-full border border-white/10 object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold capitalize text-white">{report.reporterUsername || "Unknown user"}</p>
                          <p className="text-xs text-white/35">{new Date(report.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs capitalize ${report.status === "resolved" ? "text-green-400" : report.status === "reviewed" ? "text-cyan-400" : "text-yellow-400"}`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/35">Reason</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80">{report.reason}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/35">Culprit</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Image
                          src={report.culpritPicture || "/files/default-avatar.svg"}
                          alt={report.culpritUsername || "Culprit"}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full border border-white/10 object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold capitalize text-white">{report.culpritUsername || "Unknown user"}</p>
                          <p className="text-xs text-white/40">{report.culpritId ? "Account identified" : "Post owner unavailable"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/35">Reported post</p>
                      <p className="mt-2 text-xs capitalize text-cyan-300">{report.postType || "post"}</p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/75">{report.postPreview || "No post preview available."}</p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 lg:w-[250px]">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setPendingStatus({ kind: "status", id: report.id, status: "reviewed" })}
                      disabled={busy}
                      className="text-xs px-3 py-2 rounded border border-cyan-800/40 text-cyan-400 hover:bg-cyan-900/20 disabled:opacity-50"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => setPendingStatus({ kind: "status", id: report.id, status: "resolved" })}
                      disabled={busy}
                      className="text-xs px-3 py-2 rounded border border-green-800/40 text-green-400 hover:bg-green-900/20 disabled:opacity-50"
                    >
                      Resolve
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {report.postPath ? (
                      <Link
                        href={report.postPath}
                        target="_blank"
                        className="text-xs px-3 py-2 rounded border border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                      >
                        Open reported post
                      </Link>
                    ) : null}
                    <Link
                      href="/admin/posts"
                      className="text-xs px-3 py-2 rounded border border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                    >
                      Open posts manager
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSuspendTarget(report)}
                      disabled={!report.culpritId || busy}
                      className="text-xs px-3 py-2 rounded border border-yellow-700/40 text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-40"
                    >
                      Suspend user
                    </button>
                    <button
                      onClick={() => setPendingDelete({ kind: "delete-post", report })}
                      disabled={!report.postId || busy}
                      className="text-xs px-3 py-2 rounded border border-red-800/40 text-red-300 hover:bg-red-900/20 disabled:opacity-40"
                    >
                      Delete reported post
                    </button>
                  </div>

                  <button
                    onClick={() => setPendingDelete({ kind: "delete-report", report })}
                    disabled={busy}
                    className="text-xs px-3 py-2 rounded border border-white/10 text-white/55 hover:text-white hover:bg-white/5 disabled:opacity-40"
                  >
                    Delete report record
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filteredReports.length === 0 && (
        <p className="text-white/40 text-sm text-center py-8">No reports found</p>
      )}

      <AdminConfirmModal
        open={Boolean(pendingStatus)}
        onClose={() => !actingId && setPendingStatus(null)}
        onConfirm={updateStatus}
        loading={Boolean(actingId && pendingStatus)}
        title={pendingStatus?.status === "resolved" ? "Resolve report" : "Review report"}
        description={
          pendingStatus?.status === "resolved"
            ? "Mark this report as resolved and confirm the issue has been handled?"
            : "Mark this report as reviewed so it is clear an admin has checked it?"
        }
        confirmLabel={pendingStatus?.status === "resolved" ? "Resolve report" : "Review report"}
        intent={pendingStatus?.status === "resolved" ? "success" : "warning"}
      />

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => !actingId && setPendingDelete(null)}
        onConfirm={deleteAction}
        loading={Boolean(actingId && pendingDelete)}
        title={pendingDelete?.kind === "delete-post" ? "Delete reported post" : "Delete report"}
        description={
          pendingDelete?.kind === "delete-post"
            ? "Delete the reported post, cascade its comments and replies, and notify the culprit?"
            : "Delete this report record from the moderation queue?"
        }
        confirmLabel={pendingDelete?.kind === "delete-post" ? "Delete post" : "Delete report"}
        intent="danger"
      />

      <AdminModal
        open={Boolean(suspendTarget)}
        onClose={() => !suspending && setSuspendTarget(null)}
        title={suspendTarget ? `Suspend ${suspendTarget.culpritUsername || "user"}` : "Suspend user"}
        description="Choose a custom suspension period and notify the culprit with the reason."
        widthClassName="max-w-lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <label className="space-y-2">
              <span className="text-sm text-white/60">Duration</span>
              <input
                type="number"
                min="1"
                value={suspendForm.durationValue}
                onChange={(e) => setSuspendForm((current) => ({ ...current, durationValue: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/60">Unit</span>
              <select
                value={suspendForm.durationUnit}
                onChange={(e) => setSuspendForm((current) => ({ ...current, durationUnit: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </label>
          </div>
          <label className="space-y-2 block">
            <span className="text-sm text-white/60">Reason sent to the culprit</span>
            <textarea
              rows={5}
              value={suspendForm.reason}
              onChange={(e) => setSuspendForm((current) => ({ ...current, reason: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
              placeholder="Explain why this account is being suspended..."
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void suspendUser()}
              disabled={suspending}
              className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/15 px-4 py-2 text-sm font-medium text-yellow-100 disabled:opacity-60"
            >
              {suspending ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
              {suspending ? "Suspending..." : "Suspend and notify"}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
