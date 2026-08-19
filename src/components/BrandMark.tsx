export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`bg-brand-gradient shadow-card relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-7">
        <defs>
          <linearGradient id="iw-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.98" />
            <stop offset="100%" stopColor="oklch(0.93 0.03 220)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* ink drop */}
        <path
          d="M16 5.5c3.4 3.9 5.4 6.6 5.4 9.2A5.4 5.4 0 0 1 16 20a5.4 5.4 0 0 1-5.4-5.3c0-2.6 2-5.3 5.4-9.2Z"
          fill="url(#iw-ink)"
        />
        {/* waves rippling out */}
        <path
          d="M4 23.4c2.2-2.6 4.4-2.6 6.6 0s4.4 2.6 6.6 0 4.4-2.6 6.6 0 3.1 1.6 4.2.4"
          fill="none"
          stroke="oklch(1 0 0)"
          strokeOpacity="0.95"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 28c1.8-2 3.6-2 5.4 0s3.6 2 5.4 0 3.6-2 5.4 0"
          fill="none"
          stroke="oklch(1 0 0)"
          strokeOpacity="0.5"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
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
        <span
          className={`mt-1 text-[10px] font-medium tracking-wide uppercase ${inverse ? "text-sidebar-foreground/60" : "text-muted-foreground"}`}
        >
          Ideas make waves
        </span>
      </span>
    </span>
  );
}
