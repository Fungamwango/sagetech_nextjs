"use client";

import { useCallback, useEffect, useRef } from "react";

export function useBackClosable(active: boolean, onClose: () => void) {
  const activeRef = useRef(active);
  const onCloseRef = useRef(onClose);
  const pushedRef = useRef(false);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (typeof window === "undefined" || !active || pushedRef.current) return;

    const token = `ui-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    tokenRef.current = token;
    window.history.pushState({ ...(window.history.state ?? {}), __uiOverlayToken: token }, "", window.location.href);
    pushedRef.current = true;

    const handlePopState = (event: PopStateEvent) => {
      if (!activeRef.current || !pushedRef.current) return;
      if (event.state?.__uiOverlayToken === tokenRef.current) return;
      pushedRef.current = false;
      tokenRef.current = null;
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [active]);

  const requestClose = useCallback(() => {
    if (typeof window === "undefined") {
      onCloseRef.current();
      return;
    }

    if (pushedRef.current) {
      pushedRef.current = false;
      tokenRef.current = null;
      onCloseRef.current();
      window.history.back();
      return;
    }

    onCloseRef.current();
  }, []);

  return requestClose;
}
