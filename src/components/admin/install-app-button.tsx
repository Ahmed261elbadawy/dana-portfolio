"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIos()) {
      setShowIosHint((v) => !v);
    }
  }

  if (!deferredPrompt && !isIosCapable()) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-md border border-ink/15 px-3 py-2.5 text-left text-sm font-medium text-ink/70 transition-colors hover:bg-cream"
      >
        Install app ↓
      </button>
      {showIosHint && (
        <div className="mt-2 rounded-md bg-ink p-3 text-xs text-cream">
          Tap the Share icon in Safari, then &ldquo;Add to Home
          Screen&rdquo;.
        </div>
      )}
    </div>
  );
}

function isIosCapable() {
  if (typeof window === "undefined") return false;
  return isIos() && !isStandalone();
}
