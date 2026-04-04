"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    _pwaInstall?: () => Promise<void>;
    __pwaInstallAvailable?: boolean;
  }
}

const INSTALL_EVENT_NAME = "pwa-install-availability";

function notifyAvailability(available: boolean) {
  window.__pwaInstallAvailable = available;
  window.dispatchEvent(
    new CustomEvent(INSTALL_EVENT_NAME, {
      detail: { available },
    })
  );
}

export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  const installAvailable = useMemo(() => !!deferredPrompt, [deferredPrompt]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {});
    }

    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);
      notifyAvailability(true);
      if (!sessionStorage.getItem("pwa-dismissed")) {
        setShowBanner(true);
      }
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      notifyAvailability(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  useEffect(() => {
    notifyAvailability(installAvailable);

    window._pwaInstall = async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowBanner(false);
      notifyAvailability(false);
    };

    return () => {
      delete window._pwaInstall;
    };
  }, [deferredPrompt, installAvailable]);

  return (
    <>
      {showBanner && installAvailable ? (
        <div
          className="fixed left-0 right-0 z-[80] flex items-center justify-between gap-3 px-4 py-3 text-sm text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] max-sm:flex-col max-sm:items-start"
          style={{
            top: "var(--app-header-offset, 45px)",
            background: "#023",
          }}
        >
          <span>Install SageTech for a better experience!</span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                void window._pwaInstall?.();
              }}
              className="cursor-pointer rounded-full border-none bg-white px-[18px] py-2 text-[14px] font-bold text-[#023]"
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBanner(false);
                sessionStorage.setItem("pwa-dismissed", "1");
              }}
              className="cursor-pointer rounded-full border border-white bg-transparent px-[14px] py-2 text-[14px] text-white"
            >
              Later
            </button>
          </span>
        </div>
      ) : null}
    </>
  );
}
