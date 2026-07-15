// "YYYY.MM.DD" with no separating spaces — Intl's ko-KR format inserts
// spaces around each period (e.g. "2026. 7. 14."), which wraps mid-date in
// narrow containers.
export function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}
