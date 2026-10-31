import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Bot, Server, ShieldCheck, UserCheck, ScrollText,
  BarChart3, Settings, Search, Bell, ChevronLeft, Shield, Command, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agent-console", label: "Agent Console", icon: Bot },
  { to: "/mcp-servers", label: "MCP Servers", icon: Server },
  { to: "/guardrails", label: "Guardrails", icon: ShieldCheck },
  { to: "/approvals", label: "Human Approvals", icon: UserCheck },
  { to: "/logs", label: "Activity Logs", icon: ScrollText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/about", label: "About", icon: Info },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardLayout({ children, title, subtitle }: { children?: ReactNode; title: string; subtitle?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-[0_0_16px_-4px_oklch(0.72_0.20_195/60%)]">
            <Shield className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">ArmorIQ</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Agent Security</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-2.5 pt-3">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-primary" : "group-hover:text-foreground/80")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {active && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_oklch(0.72_0.20_195)]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:text-foreground hover:border-primary/40"
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>

        {/* Status footer */}
        {!collapsed && (
          <div className="absolute bottom-4 left-2.5 right-2.5 rounded-md border border-sidebar-border bg-sidebar-accent/30 p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              <span className="text-xs font-medium">All systems operational</span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">99.98% uptime · 142ms p50</p>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className={cn("flex flex-1 flex-col transition-all duration-300", collapsed ? "ml-[68px]" : "ml-[240px]")}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search agents, tools, policies…"
              className="h-8 w-full rounded-md border border-border bg-card/30 pl-8 pr-14 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/30 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
              <Command className="inline h-2.5 w-2.5" />K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/30 text-muted-foreground transition-all hover:text-foreground hover:border-primary/30">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-1 ring-background" />
            </button>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card/30 py-1 pl-1 pr-2.5 transition-all hover:border-primary/30">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-primary to-primary-glow text-[10px] font-bold text-primary-foreground">
                AK
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold">Alex Kim</span>
                <span className="text-[9px] text-muted-foreground">SecOps Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}