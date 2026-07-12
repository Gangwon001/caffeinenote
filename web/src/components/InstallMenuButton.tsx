"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function InstallMenuButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosTipOpen, setIosTipOpen] = useState(false);
  // Environment detection only resolves on the client; staying null until
  // then keeps the server-rendered (window-less) pass and the first client
  // pass identical, avoiding a hydration mismatch.
  const [client, setClient] = useState<{ standalone: boolean; ios: boolean } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClient({ standalone: isStandalone(), ios: isIos() });

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (client?.ios) {
      setIosTipOpen((open) => !open);
    }
  }

  if (!client || client.standalone) return null;
  if (!deferredPrompt && !client.ios) return null;

  return (
    <div className="relative">
      <button type="button" onClick={handleClick} className="hover:text-brand">
        홈 화면에 추가하기
      </button>
      {iosTipOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-ink/10 bg-bg shadow-lg p-3 text-xs text-ink/70 z-50">
          하단 공유 버튼을 누른 뒤 <span className="font-medium text-ink">홈 화면에 추가</span>를
          선택하세요.
        </div>
      )}
    </div>
  );
}
