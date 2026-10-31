import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Bot, Server, ShieldCheck, UserCheck, ScrollText,
  BarChart3, Settings, Bell, Shield, Info, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/",              label: "Dashboard",      icon: LayoutDashboard },
  { to: "/agent-console", label: "Agent Console",  icon: Bot },
  { to: "/mcp-servers",   label: "MCP Servers",    icon: Server },
  { to: "/guardrails",    label: "Guardrails",     icon: ShieldCheck },
  { to: "/approvals",     label: "Approvals",      icon: UserCheck },
  { to: "/logs",          label: "Logs",           icon: ScrollText },
  { to: "/analytics",     label: "Analytics",      icon: BarChart3 },
  { to: "/about",         label: "About Us",       icon: Info },
  { to: "/settings",      label: "Settings",       icon: Settings },
] as const;

export function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--gradient-hero)" }}>
      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-xl animate-slide-down">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-4 px-4 md:px-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/40%)]">
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-foreground">ArmorIQ</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Agent Security</span>
            </div>
          </NavLink>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-0.5 ml-6">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground transition-all hover:text-foreground hover:border-primary/40 hover:shadow-[0_2px_8px_-2px_oklch(0.58_0.16_275/20%)]">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-2 py-1 transition-all hover:border-primary/40 hover:shadow-[0_2px_8px_-2px_oklch(0.58_0.16_275/15%)]">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-[10px] font-bold text-white">
                AK
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-semibold">Alex Kim</span>
                <span className="text-[9px] text-muted-foreground">SecOps Admin</span>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-screen-xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
