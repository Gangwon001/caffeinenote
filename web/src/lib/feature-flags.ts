// Controls whether view counts are shown on public pages. Tracking itself
// (increment_blog_view) always runs regardless of this flag — it only gates
// the UI. Flip NEXT_PUBLIC_SHOW_VIEW_COUNT=true once there's enough traffic
// for the numbers to be worth showing; no code changes needed.
export const SHOW_VIEW_COUNT = process.env.NEXT_PUBLIC_SHOW_VIEW_COUNT === "true";
