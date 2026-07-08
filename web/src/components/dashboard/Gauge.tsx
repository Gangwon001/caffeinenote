export default function Gauge({ percent }: { percent: number }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const isOver = percent >= 100;
  const radius = 80;
  const circumference = Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <svg viewBox="0 0 200 110" className="w-48">
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="var(--color-brand-soft)"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke={isOver ? "var(--color-danger)" : "var(--color-brand)"}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
      />
      <text
        x="100"
        y="95"
        textAnchor="middle"
        fontSize="28"
        fontWeight="bold"
        fill="var(--color-ink)"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}
