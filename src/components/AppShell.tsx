import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  PenLine,
  Repeat2,
  Library,
  FolderKanban,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BrandLogo } from "./BrandMark";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/create", label: "Create", icon: PenLine },
  { to: "/repurpose", label: "Repurpose", icon: Repeat2 },
  { to: "/library", label: "Library", icon: Library },
  { to: "/prompts", label: "Prompts", icon: Sparkles },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: React.ReactNode | undefined;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="bg-sidebar border-sidebar-border hidden w-64 shrink-0 flex-col border-r p-4 lg:flex">
        <div className="mb-6 px-1">
          <BrandLogo inverse />
        </div>
        {nav}
        <div className="border-sidebar-border mt-4 border-t pt-4">
          <p className="text-sidebar-foreground/60 truncate px-3 text-xs">{user?.email}</p>
          <button
            onClick={signOut}
            className="text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <LogOut className="size-4.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="bg-ink/60 absolute inset-0"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="bg-sidebar relative flex h-full w-72 flex-col p-4">
            <div className="mb-6 flex items-center justify-between">
              <BrandLogo inverse />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="text-sidebar-foreground size-5" />
              </button>
            </div>
            {nav}
            <button
              onClick={signOut}
              className="text-sidebar-foreground/75 mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
            >
              <LogOut className="size-4.5" aria-hidden="true" />
              Sign out
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/85 sticky top-0 z-30 border-b backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
              {subtitle && <p className="text-muted-foreground truncate text-sm">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="icon" asChild aria-label="Search">
                <Link to="/search">
                  <Search className="size-4.5" />
                </Link>
              </Button>
              {actions}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
