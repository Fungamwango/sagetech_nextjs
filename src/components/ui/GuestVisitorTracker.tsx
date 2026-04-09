"use client";

import { useEffect } from "react";

const GUEST_VISITOR_KEY = "sagetech_guest_visitor_key";

function getVisitorKey() {
  const existing = window.localStorage.getItem(GUEST_VISITOR_KEY);
  if (existing) return existing;

  const next = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(GUEST_VISITOR_KEY, next);
  return next;
}

export default function GuestVisitorTracker() {
  useEffect(() => {
    try {
      const visitorKey = getVisitorKey();
      void fetch("/api/visitors/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          visitorKey,
          path: window.location.pathname,
        }),
      });
    } catch {
      // Silent on purpose. Visitor tracking should never disrupt app usage.
    }
  }, []);

  return null;
}
