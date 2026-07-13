// Shared client-only environment detection for the PWA install UI
// (InstallPrompt banner + InstallMenuButton nav item).

export function isIosDevice(): boolean {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export type IosBrowser = "safari" | "chrome" | "other";

// iOS browsers all run on WebKit, but "Add to Home Screen" lives in a
// different menu depending on which browser chrome is wrapping it.
export function detectIosBrowser(): IosBrowser {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/CriOS/i.test(ua)) return "chrome";
  if (/FxiOS|EdgiOS|OPiOS/i.test(ua)) return "other";
  if (/Safari/i.test(ua)) return "safari";
  return "other";
}

export function iosAddToHomeScreenTip(browser: IosBrowser): string {
  switch (browser) {
    case "chrome":
      return "우측 상단 ⋮ 메뉴를 누른 뒤 공유 → 홈 화면에 추가를 선택하세요.";
    case "safari":
      return "하단 공유 버튼을 누른 뒤 홈 화면에 추가를 선택하세요.";
    default:
      return "브라우저 메뉴에서 공유 아이콘을 찾아 홈 화면에 추가를 선택하세요.";
  }
}
