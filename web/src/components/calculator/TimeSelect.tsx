const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// Native <select> elements: clicking opens a real scrollable list on every
// browser/OS, unlike <input type="time">, which on some browsers/locales is
// keyboard-entry only.
export default function TimeSelect({
  value,
  onChange,
  className,
}: {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  className?: string;
}) {
  const [hh, mm] = value.split(":");

  return (
    <div className={`flex gap-1 ${className ?? ""}`}>
      <select
        aria-label="시"
        value={hh}
        onChange={(e) => onChange(`${e.target.value}:${mm}`)}
        className="rounded-md border border-ink/10 bg-bg px-2 py-2"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}시
          </option>
        ))}
      </select>
      <select
        aria-label="분"
        value={mm}
        onChange={(e) => onChange(`${hh}:${e.target.value}`)}
        className="rounded-md border border-ink/10 bg-bg px-2 py-2"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}분
          </option>
        ))}
      </select>
    </div>
  );
}
