"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { detectInstallPlatform, trackPwaInstallClick } from "@/lib/analytics";

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

export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosTip, setShowIosTip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone() || sessionStorage.getItem("installPromptDismissed")) return;

    if (isIos()) {
      // One-time client-only environment detection, deferred to an effect
      // so the server-rendered (window-less) pass and the first client pass
      // match and don't trigger a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowIosTip(true);
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem("installPromptDismissed", "1");
  }

  async function install() {
    if (!deferredPrompt) return;
    trackPwaInstallClick({
      platform: detectInstallPlatform(),
      install_method: "native_prompt",
      location: "banner",
    });
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (pathname?.startsWith("/admin")) return null;
  if (dismissed || (!deferredPrompt && !showIosTip)) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:w-80 z-50 rounded-xl border border-ink/10 bg-bg shadow-lg p-4 flex items-start gap-3">
      <div className="flex-1 text-sm">
        {showIosTip ? (
          <p>
            <span className="font-medium">홈 화면에 추가하기:</span> 하단 공유 버튼을 누른 뒤{" "}
            <span className="font-medium">홈 화면에 추가</span>를 선택하세요.
          </p>
        ) : (
          <>
            <p className="font-medium mb-2">앱처럼 설치해서 더 빠르게 이용하세요</p>
            <button
              type="button"
              onClick={install}
              className="rounded-md bg-brand text-bg px-3 py-1.5 text-sm font-medium hover:opacity-90"
            >
              홈 화면에 추가하기
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        aria-label="닫기"
        onClick={dismiss}
        className="text-ink/40 hover:text-ink text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
