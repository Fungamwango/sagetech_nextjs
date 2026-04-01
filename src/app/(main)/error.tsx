"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Main route error", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] px-4 py-12">
      <div
        className="mx-auto max-w-xl rounded-3xl border border-red-400/15 px-6 py-7 text-center"
        style={{
          background:
            "linear-gradient(to bottom, rgba(35,8,16,0.96), rgba(20,20,28,0.96), rgba(70,12,20,0.18))",
        }}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-300">
          <i className="fas fa-plug-circle-xmark text-xl" />
        </div>
        <h2 className="text-xl font-bold text-white">We could not load this page right now.</h2>
        <p className="mt-2 text-sm text-white/65">
          This is usually a temporary connection problem. Nothing is wrong with your account.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="btn-sage px-5 py-3">
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/80 hover:border-cyan-400 hover:text-cyan-300"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
