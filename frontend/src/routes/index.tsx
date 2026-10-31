import { useState, useEffect, useCallback, useRef } from "react";
import { GlassCard, KpiCard, SectionHeader } from "@/components/dashboard/widgets";
import {
  dashboardAPI,
  type DashboardData,
  type ToolUsagePoint,
  type TopTool,
  type SecurityEvent,
} from "@/services/api";
import {
  Bot, Server, Zap, ShieldAlert, Clock, Activity,
  ShieldCheck, AlertTriangle, RefreshCw, Shield,
  Lock, Database, Users, CheckCircle, ArrowRight, GitBranch,
} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

// ── scroll-reveal hook ────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Reveal wrapper ────────────────────────────────────────────────────────────
function Reveal({
  children, className, delay = 0, direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const { ref, visible } = useInView();
  const hiddenClass: Record<string, string> = {
    up:    "opacity-0 translate-y-8",
    left:  "opacity-0 -translate-x-8",
    right: "opacity-0 translate-x-8",
    scale: "opacity-0 scale-95",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : hiddenClass[direction],
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView(0.5);
  useEffect(() => {
    if (!visible) return;
    let start: number | null = null;
    const dur = 1400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, to]);
  return <span ref={ref} className="tabular-nums">{val.toLocaleString()}{suffix}</span>;
}

// ── skeleton ──────────────────────────────────────────────────────────────────
function SkeletonKpi() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 animate-pulse">
      <div className="h-2.5 w-24 rounded-full bg-muted/60 mb-3" />
      <div className="h-8 w-20 rounded-full bg-muted/50 mb-2" />
      <div className="h-2.5 w-16 rounded-full bg-muted/40" />
    </div>
  );
}

// ── About content ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: Shield,
    title: "Policy Engine",
    desc: "Every tool call passes through composable rules — BLOCK, ALLOW, or REQUIRE_APPROVAL — evaluated live, no restarts.",
    color: "text-primary",
    bg: "bg-secondary",
  },
  {
    icon: Users,
    title: "Human-in-the-Loop",
    desc: "Gate any tool behind a real approval step. The agent pauses and waits for a human decision before continuing.",
    color: "text-[oklch(0.55_0.18_340)]",
    bg: "bg-[oklch(0.96_0.030_340)]",
  },
  {
    icon: Database,
    title: "Immutable Audit Log",
    desc: "Every call — allowed, blocked, or errored — is logged with full metadata to PostgreSQL. Nothing is overwritten.",
    color: "text-success",
    bg: "bg-[oklch(0.94_0.04_152)]",
  },
  {
    icon: Lock,
    title: "Input Validation",
    desc: "Regex, length limits, path constraints — validate any tool argument at the policy layer before it reaches your server.",
    color: "text-warning",
    bg: "bg-[oklch(0.96_0.04_78)]",
  },
];

const stats = [
  { label: "Tool calls governed", value: 10000, suffix: "+" },
  { label: "Policy rules",        value: 50,    suffix: "+" },
  { label: "MCP servers",         value: 12,    suffix: "" },
  { label: "Uptime",              value: 99,    suffix: ".98%" },
];

const stack = [
  "React 19", "TypeScript 6", "Django 6", "PostgreSQL",
  "MCP / JSON-RPC", "Tailwind CSS 4",
];

// ── page ──────────────────────────────────────────────────────────────────────
export function IndexRoute() {
  const [data, setData]             = useState<DashboardData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const result = await dashboardAPI.get();
      setData(result);
    } catch (err) {
      console.error("[Dashboard] Failed to load:", err);
      setError("Could not reach backend. Is Django running on :8000?");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(true), 30_000);
    return () => clearInterval(id);
  }, [load]);

  const kpiCards = data ? [
    { label: "Active Sessions",   value: data.kpis.active_sessions.toLocaleString(),      delta: "+0",                          icon: Bot,        tone: "primary"  as const },
    { label: "MCP Servers",       value: data.kpis.mcp_servers,                           delta: "+0",                          icon: Server,     tone: "success"  as const },
    { label: "Tool Calls Today",  value: data.kpis.tool_calls_today.toLocaleString(),     delta: data.kpi_deltas.tool_calls_today, icon: Zap,      tone: "primary"  as const },
    { label: "Blocked Actions",   value: data.kpis.blocked_today.toLocaleString(),        delta: data.kpi_deltas.blocked_today,  icon: ShieldAlert,tone: "danger"   as const },
    { label: "Pending Approvals", value: data.kpis.pending_approvals.toLocaleString(),    delta: "+0",                          icon: Clock,      tone: "warning"  as const },
    { label: "Uptime",            value: `${data.kpis.uptime_pct}%`,                      delta: "0%",                          icon: Activity,   tone: "success"  as const },
  ] : [];

  const series  = data?.tool_usage_series   ?? [];
  const topTools= data?.top_tools           ?? [];
  const events  = data?.security_events     ?? [];
  const shield  = data?.threat_shield       ?? { score: 0, allowed: 0, blocked: 0, pending: 0 };

  return (
    <div className="space-y-8">

      {/* ── Dashboard section ─────────────────────────────────────────── */}

      {/* Status bar */}
      <div className="flex items-center justify-between animate-fade-in">
        <span className="text-xs text-muted-foreground">
          {loading ? "Loading…" : error ? "Backend unreachable" : "Live · updates every 30s"}
        </span>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-[oklch(0.97_0.02_22)] px-4 py-2.5 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonKpi key={i} />)
          : kpiCards.map((k, i) => (
              <div key={k.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <KpiCard label={k.label} value={k.value} delta={k.delta} Icon={k.icon} tone={k.tone} />
              </div>
            ))}
      </div>

      {/* Chart + Top tools */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2 animate-fade-in-up stagger-2">
          <SectionHeader
            title="Tool Usage · last 24h"
            action={<span className="text-xs text-muted-foreground">{loading ? "—" : `${data?.kpis.tool_calls_today.toLocaleString() ?? 0} calls`}</span>}
          />
          <div className="h-64 -ml-2">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-muted/30" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="g-calls" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.58 0.16 275)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.58 0.16 275)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-block" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.58 0.20 22)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="oklch(0.58 0.20 22)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.020 275)" />
                  <XAxis dataKey="hour" stroke="oklch(0.65 0.025 270)" fontSize={11} />
                  <YAxis stroke="oklch(0.65 0.025 270)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid oklch(0.88 0.020 275)",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "0 4px 16px -4px oklch(0.58 0.16 275 / 15%)",
                    }}
                  />
                  <Area type="monotone" dataKey="calls"   stroke="oklch(0.58 0.16 275)" strokeWidth={2} fill="url(#g-calls)" />
                  <Area type="monotone" dataKey="blocked" stroke="oklch(0.58 0.20 22)"  strokeWidth={2} fill="url(#g-block)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5 animate-fade-in-up stagger-3">
          <SectionHeader title="Top Tools" action={<span className="text-xs text-muted-foreground">All time</span>} />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-7 animate-pulse rounded-lg bg-muted/30" />
              ))}
            </div>
          ) : topTools.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">No tool calls recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {topTools.slice(0, 8).map((t, i) => (
                <li key={t.name}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="font-mono text-xs text-foreground">{t.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.calls.toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                      style={{ width: `${(t.calls / (topTools[0]?.calls || 1)) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      {/* Security events + Threat Shield */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2 animate-fade-in-up stagger-3">
          <SectionHeader
            title="Security Events"
            action={
              <span className="inline-flex items-center gap-1.5 text-xs text-success">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Live
              </span>
            }
          />
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/20" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No events yet. Use the Agent Console to generate activity.
            </p>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-border pl-6">
              {events.map((e, i) => {
                const isCrit = e.severity === "critical";
                const tone = isCrit
                  ? "text-destructive bg-[oklch(0.96_0.04_22)] ring-destructive/25"
                  : e.severity === "warning"
                    ? "text-warning bg-[oklch(0.96_0.04_78)] ring-warning/25"
                    : "text-primary bg-secondary ring-primary/25";
                return (
                  <li key={i} className="relative">
                    <span className={cn("absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-background", tone)}>
                      {isCrit ? <AlertTriangle className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                    </span>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{e.time}</span>
                      <span className="rounded-md bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] uppercase text-foreground">{e.severity}</span>
                      <span className="font-mono text-xs text-primary">{e.agent}</span>
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-primary">{e.tool}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{e.message}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </GlassCard>

        {/* Threat Shield */}
        <GlassCard className="relative overflow-hidden p-5 animate-fade-in-up stagger-4">
          <SectionHeader title="Threat Shield" />
          <div className="flex flex-col items-center py-4">
            <div className="relative animate-float">
              <div className="absolute inset-0 rounded-full bg-secondary blur-2xl opacity-60" />
              <svg viewBox="0 0 200 200" className="relative h-40 w-40">
                <defs>
                  <linearGradient id="shield-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.18 290)" />
                    <stop offset="100%" stopColor="oklch(0.58 0.16 275)" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill="none" stroke="oklch(0.88 0.020 275)" strokeWidth="1.5" strokeDasharray="5 7" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="url(#shield-grad)" strokeWidth="1.5" opacity="0.5" />
                <path
                  d="M100 40 L150 60 L150 110 Q150 145 100 165 Q50 145 50 110 L50 60 Z"
                  fill="url(#shield-grad)"
                  opacity="0.12"
                  stroke="url(#shield-grad)"
                  strokeWidth="1.5"
                />
                <path
                  d="M80 100 L95 115 L125 85"
                  fill="none"
                  stroke="oklch(0.60 0.16 152)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-2 text-3xl font-bold gradient-text">{loading ? "—" : shield.score}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Security Score</p>
            <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
              {[
                { label: "Allowed", value: loading ? "—" : shield.allowed.toLocaleString(),  cls: "text-success" },
                { label: "Pending", value: loading ? "—" : shield.pending.toLocaleString(),  cls: "text-warning" },
                { label: "Blocked", value: loading ? "—" : shield.blocked.toLocaleString(),  cls: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-muted/20 py-2">
                  <div className={cn("text-sm font-bold", s.cls)}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            About ArmorIQ
          </span>
        </div>
      </div>

      {/* ── About Us section ──────────────────────────────────────────────── */}

      {/* Hero tagline */}
      <Reveal direction="up">
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)] md:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            AI Agent Security Platform
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Every tool call,{" "}
            <span className="gradient-text">governed.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            ArmorIQ sits between your AI agent and its tools. Every MCP tool call
            passes through a policy engine before execution — enforced in real time,
            logged immutably, surfaced in this dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://amor-beta-livid.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/40%)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_-2px_oklch(0.58_0.16_275/50%)]"
            >
              Live Demo <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/IsHa2507/SentriAI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              GitHub
            </a>
          </div>
        </div>
      </Reveal>

      {/* Stats counters */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} direction="up" delay={i * 60}>
            <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)] transition-all hover:-translate-y-1 hover:shadow-[0_6px_24px_-4px_oklch(0.58_0.16_275/18%)]">
              <p className="text-3xl font-bold gradient-text md:text-4xl">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Features grid */}
      <Reveal direction="up">
        <div className="mb-8 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Capabilities</p>
          <h3 className="text-2xl font-bold tracking-tight">Built for real production use</h3>
        </div>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} direction="up" delay={i * 70}>
              <div className="h-full rounded-2xl border border-border bg-white p-6 shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)] transition-all hover:-translate-y-1 hover:border-[oklch(0.75_0.08_275)] hover:shadow-[0_6px_24px_-4px_oklch(0.58_0.16_275/18%)]">
                <div className={cn("mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl", f.bg)}>
                  <Icon className={cn("h-5 w-5", f.color)} />
                </div>
                <h4 className="mb-2 font-semibold text-foreground">{f.title}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* What we built — split */}
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <Reveal direction="left">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">What we built</p>
            <h3 className="text-2xl font-bold tracking-tight">A governance layer for AI agents</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Modern AI agents can read files, write databases, call APIs, and execute code —
              often with zero oversight. ArmorIQ enforces a policy layer at the protocol level,
              built on the <strong className="text-foreground">Model Context Protocol (MCP)</strong>.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Policy rules evaluated on every single call",
                "Human approvals pause the agent mid-run",
                "Immutable PostgreSQL audit log",
                "Composable rules — no code deploys needed",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal direction="right" delay={100}>
          <div className="rounded-2xl border border-border bg-white p-6 font-mono text-xs shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)]">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Request flow</p>
            {[
              { label: "User Prompt",           color: "text-foreground", bg: "bg-muted/30" },
              { label: "LLM Agent",             color: "text-primary",    bg: "bg-secondary" },
              { label: "PolicyEngine",          color: "text-warning",    bg: "bg-[oklch(0.96_0.04_78)]" },
              null,
              { label: "✅  ALLOW → execute",   color: "text-success",     bg: "bg-[oklch(0.94_0.04_152)]" },
              { label: "🚫  BLOCK → log error", color: "text-destructive", bg: "bg-[oklch(0.96_0.04_22)]" },
              { label: "⏳  HOLD → human reviews",color: "text-warning",   bg: "bg-[oklch(0.96_0.04_78)]" },
            ].map((item, i) =>
              item === null ? (
                <div key={i} className="my-2 flex items-center gap-1.5 text-muted-foreground/50">
                  <div className="h-px flex-1 border-t border-dashed border-current" />
                  <span className="text-[9px]">decision</span>
                  <div className="h-px flex-1 border-t border-dashed border-current" />
                </div>
              ) : (
                <div key={i} className="flex flex-col items-center">
                  <div className={cn("w-full rounded-xl border border-border px-3 py-2", item.bg)}>
                    <span className={cn("font-semibold", item.color)}>{item.label}</span>
                  </div>
                  {i < 3 && <div className="h-4 w-px bg-border" />}
                </div>
              )
            )}
          </div>
        </Reveal>
      </div>

      {/* Tech stack pills */}
      <Reveal direction="up">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)]">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tech stack</p>
          <div className="flex flex-wrap justify-center gap-2">
            {stack.map((s) => (
              <span key={s} className="rounded-xl border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-primary">
                {s}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Team */}
      <Reveal direction="up">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)]">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">The team</p>
          <div className="flex justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-xl font-bold text-white shadow-[0_4px_20px_-4px_oklch(0.58_0.16_275/40%)]">
                D
              </div>
              <h4 className="font-bold text-foreground">Divya</h4>
              <p className="text-sm font-medium text-primary">Founder &amp; Lead Engineer</p>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                Built ArmorIQ end-to-end — Django backend, React frontend, MCP protocol layer, and policy engine.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Bottom CTA */}
      <Reveal direction="up">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary to-[oklch(0.96_0.025_300)] p-10 text-center shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)]">
          <h3 className="text-2xl font-bold tracking-tight">See it running</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The live demo hits the production backend. Generate tool calls, watch the policy engine decide, and approve or reject from this dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://amor-beta-livid.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/40%)] transition-all hover:-translate-y-0.5"
            >
              Open live demo <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Reveal>

    </div>
  );
}
