export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path
          d="M2 15c2.5-4 4.5-4 7 0s4.5 4 7 0 4.5-4 6-1.5"
          stroke="oklch(0.99 0.004 250)"
          strokeLinecap="round"
        />
        <path d="M12 3v6" stroke="oklch(0.99 0.004 250)" strokeLinecap="round" />
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
