export default function BlogHeroIllustration() {
  return (
    <svg viewBox="0 0 320 220" className="w-56 sm:w-72" aria-hidden="true">
      {/* notebook */}
      <g transform="rotate(-6 160 120)">
        <rect
          x="60"
          y="80"
          width="150"
          height="110"
          rx="8"
          fill="var(--color-bg)"
          stroke="var(--color-brand)"
          strokeWidth="4"
        />
        <line x1="80" y1="110" x2="190" y2="110" stroke="var(--color-brand)" strokeWidth="3" opacity="0.4" />
        <line x1="80" y1="130" x2="190" y2="130" stroke="var(--color-brand)" strokeWidth="3" opacity="0.4" />
        <line x1="80" y1="150" x2="160" y2="150" stroke="var(--color-brand)" strokeWidth="3" opacity="0.4" />
      </g>

      {/* pen */}
      <g transform="rotate(38 150 165)">
        <rect x="140" y="120" width="10" height="90" rx="4" fill="var(--color-ink)" opacity="0.7" />
        <path d="M140 120l10 0 -5 -14z" fill="var(--color-ink)" opacity="0.7" />
      </g>

      {/* saucer */}
      <ellipse cx="235" cy="150" rx="52" ry="9" fill="var(--color-brand)" opacity="0.15" />

      {/* cup */}
      <path
        d="M204 90h62v34a24 24 0 0 1-24 24h-14a24 24 0 0 1-24-24v-34z"
        fill="var(--color-bg)"
        stroke="var(--color-brand)"
        strokeWidth="4"
      />
      <path
        d="M266 100h8a14 14 0 0 1 0 28h-8"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="4"
      />
      <ellipse cx="235" cy="90" rx="31" ry="7" fill="var(--color-day)" />

      {/* leaf */}
      <g fill="var(--color-brand)" opacity="0.5">
        <path d="M198 150c18-2 28-16 30-34-18 2-32 14-30 34z" />
      </g>
    </svg>
  );
}
