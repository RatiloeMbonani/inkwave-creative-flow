export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[0.75rem] bg-brand-gradient shadow-card ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-7">
        <defs>
          <linearGradient id="inkwave-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="oklch(1 0 0)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* ink drop */}
        <path
          d="M16 5.5c3.4 3.9 5.6 6.7 5.6 9.4a5.6 5.6 0 0 1-11.2 0c0-2.7 2.2-5.5 5.6-9.4Z"
          fill="url(#inkwave-sheen)"
        />
        {/* waves rippling out of the drop */}
        <g
          fill="none"
          stroke="url(#inkwave-sheen)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        >
          <path d="M4 21.5c2-2.2 3.6-2.2 5.6 0s3.6 2.2 5.6 0 3.6-2.2 5.6 0 3.6 2.2 5.6 0" />
          <path d="M6.5 26.2c1.6-1.8 2.9-1.8 4.5 0s2.9 1.8 4.5 0 2.9-1.8 4.5 0" opacity="0.6" />
        </g>
      </svg>
    </span>
  );
}

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark />
      <span className="flex flex-col leading-none">
        <span
          className={`text-[15px] font-extrabold tracking-tight ${inverse ? "text-sidebar-accent-foreground" : "text-foreground"}`}
        >
          INKWAVE <span className="text-brand-gradient">AI</span>
        </span>
        <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          Ideas make waves
        </span>
      </span>
    </span>
  );
}
