"use client";

import { useEffect, useState } from "react";
import { detectInstallPlatform, trackPwaInstallClick } from "@/lib/analytics";
import {
  detectIosBrowser,
  iosAddToHomeScreenTip,
  isIosDevice,
  isStandaloneDisplay,
  type IosBrowser,
} from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallMenuButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosTipOpen, setIosTipOpen] = useState(false);
  // Environment detection only resolves on the client; staying null until
  // then keeps the server-rendered (window-less) pass and the first client
  // pass identical, avoiding a hydration mismatch.
  const [client, setClient] = useState<{
    standalone: boolean;
    ios: boolean;
    iosBrowser: IosBrowser;
  } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClient({
      standalone: isStandaloneDisplay(),
      ios: isIosDevice(),
      iosBrowser: detectIosBrowser(),
    });

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function handleClick() {
    if (deferredPrompt) {
      trackPwaInstallClick({
        platform: detectInstallPlatform(),
        install_method: "native_prompt",
        location: "header_menu",
      });
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (client?.ios) {
      trackPwaInstallClick({
        platform: "ios",
        install_method: "ios_manual_instructions",
        location: "header_menu",
      });
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
      {iosTipOpen && client && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-ink/10 bg-bg shadow-lg p-3 text-xs text-ink/70 z-50">
          {iosAddToHomeScreenTip(client.iosBrowser)}
        </div>
      )}
    </div>
  );
}
