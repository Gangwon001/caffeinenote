export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 320 320" className="w-56 sm:w-72" aria-hidden="true">
      <circle cx="160" cy="160" r="140" fill="var(--color-brand-soft)" opacity="0.35" />

      {/* steam */}
      <g fill="none" stroke="var(--color-brand)" strokeWidth="4" strokeLinecap="round" opacity="0.5">
        <path d="M130 90c0 12 12 12 12 24s-12 12-12 24" />
        <path d="M160 84c0 12 12 12 12 24s-12 12-12 24" />
        <path d="M190 90c0 12 12 12 12 24s-12 12-12 24" />
      </g>

      {/* saucer */}
      <ellipse cx="160" cy="248" rx="86" ry="12" fill="var(--color-brand)" opacity="0.15" />

      {/* cup */}
      <path
        d="M90 150h140v58a36 36 0 0 1-36 36h-68a36 36 0 0 1-36-36v-58z"
        fill="var(--color-bg)"
        stroke="var(--color-brand)"
        strokeWidth="5"
      />
      {/* handle */}
      <path
        d="M230 168h14a24 24 0 0 1 0 48h-14"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="5"
      />
      {/* coffee surface */}
      <ellipse cx="160" cy="150" rx="70" ry="12" fill="var(--color-day)" />
      {/* latte art heart */}
      <path
        d="M160 145c-6-8-20-8-20 2 0 8 12 14 20 20 8-6 20-12 20-20 0-10-14-10-20-2z"
        fill="var(--color-bg)"
        opacity="0.9"
      />

      {/* leaves */}
      <g fill="var(--color-brand)" opacity="0.55">
        <path d="M46 236c30-4 46-28 50-56-30 4-52 24-50 56z" />
        <path d="M46 236c22-14 32-34 30-58" fill="none" stroke="var(--color-bg)" strokeWidth="2" />
      </g>
      <g fill="var(--color-brand)" opacity="0.45">
        <path d="M274 118c-30 2-48 24-54 52 30-2 54-20 54-52z" />
        <path d="M274 118c-24 12-36 30-36 54" fill="none" stroke="var(--color-bg)" strokeWidth="2" />
      </g>
    </svg>
  );
}
