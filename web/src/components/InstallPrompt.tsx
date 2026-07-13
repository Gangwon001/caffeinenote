"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { detectInstallPlatform, trackPwaInstallClick } from "@/lib/analytics";
import { isStandaloneDisplay } from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // iOS has no beforeinstallprompt (or any programmatic install trigger) —
  // that case is handled entirely by InstallMenuButton's click-to-reveal
  // tip instead, so this banner doesn't also pop up with the same static
  // instructions unprompted.
  useEffect(() => {
    if (isStandaloneDisplay() || sessionStorage.getItem("installPromptDismissed")) return;

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
  if (dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:w-80 z-50 rounded-xl border border-ink/10 bg-bg shadow-lg p-4 flex items-start gap-3">
      <div className="flex-1 text-sm">
        <p className="font-medium mb-2">앱처럼 설치해서 더 빠르게 이용하세요</p>
        <button
          type="button"
          onClick={install}
          className="rounded-md bg-brand text-bg px-3 py-1.5 text-sm font-medium hover:opacity-90"
        >
          홈 화면에 추가하기
        </button>
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
