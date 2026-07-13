// Thin wrapper around GA4's gtag so call sites never touch window.gtag
// directly. Events are no-ops outside production and when GA hasn't loaded
// (measurement ID unset, script blocked, etc.) so this is always safe to call.

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params?: EventParams) {
  if (process.env.NODE_ENV !== "production") return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_PATTERN = /\b0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/;

function containsSensitiveInfo(text: string): boolean {
  return EMAIL_PATTERN.test(text) || PHONE_PATTERN.test(text);
}

export function trackViewBlogPost(params: {
  post_slug: string;
  post_title: string;
  category?: string | null;
}) {
  trackEvent("view_blog_post", {
    post_slug: params.post_slug,
    post_title: params.post_title,
    category: params.category ?? undefined,
  });
}

// Skips sending entirely (rather than redacting) when the query looks like
// it contains an email or phone number, per the "don't forward PII" rule.
export function trackSiteSearch(searchTerm: string, resultCount: number) {
  const term = searchTerm.trim();
  if (!term || containsSensitiveInfo(term)) return;
  trackEvent("site_search", { search_term: term, result_count: resultCount });
}

export function trackSelectSearchResult(params: { result_id?: string; result_name?: string }) {
  trackEvent("select_search_result", params);
}

export function trackShare(params: { method?: string; content_type?: string; item_id?: string }) {
  trackEvent("share", params);
}

export function trackCopyLink(params: { link_url: string }) {
  trackEvent("copy_link", params);
}

export function detectInstallPlatform(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

export function trackPwaInstallClick(params: {
  platform: string;
  install_method: string;
  location: string;
}) {
  trackEvent("pwa_install_click", params);
}

export function trackOutboundClick(params: { link_url: string; link_text?: string }) {
  trackEvent("outbound_click", params);
}
