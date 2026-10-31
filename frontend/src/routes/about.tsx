import { useEffect, useRef, useState } from "react";
import {
  Shield, Zap, Lock, Users, GitBranch, Database,
  Server, Bot, BarChart3, CheckCircle, ArrowRight,
  Code2, Globe, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Intersection-observer hook for scroll-reveal ─────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView(0.5);
  useEffect(() => {
    if (!visible) return;
    let start: number | null = null;
    const duration = 1400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString()}{suffix}
    </span>
  );
}

// ── Reveal wrapper ────────────────────────────────────────────────────────────
function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const { ref, visible } = useInView();
  const base = "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";
  const hidden: Record<string, string> = {
    up:    "opacity-0 translate-y-8",
    left:  "opacity-0 -translate-x-8",
    right: "opacity-0 translate-x-8",
    scale: "opacity-0 scale-95",
  };
  return (
    <div
      ref={ref}
      className={cn(base, visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : hidden[direction], className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { label: "Tool calls governed",  value: 10000, suffix: "+" },
  { label: "Policy rules",         value: 50,    suffix: "+" },
  { label: "MCP servers supported",value: 12,    suffix: "" },
  { label: "Uptime",               value: 99,    suffix: ".98%" },
];

const features = [
  {
    icon: Shield,
    title: "Policy Engine",
    desc: "Every tool call passes through a composable rule set — BLOCK, ALLOW, or REQUIRE_APPROVAL — evaluated in real time without a restart.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Users,
    title: "Human-in-the-Loop",
    desc: "Gate any tool behind a human approval step. One-click approve or reject from the live queue before the agent continues.",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  {
    icon: Database,
    title: "Immutable Audit Log",
    desc: "Every call — allowed, blocked, pending, or errored — is stored with full metadata. Nothing is hidden; nothing is overwritten.",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "24-hour usage charts, top tools by call volume, security event feeds, and a real-time threat shield score.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Zap,
    title: "MCP Native",
    desc: "Built on the Model Context Protocol — JSON-RPC over STDIO. Drop in any MCP server; ArmorIQ wraps it transparently.",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  {
    icon: Lock,
    title: "Input Validation",
    desc: "Regex, length limits, path constraints — validate any tool argument at the policy layer before it reaches your server.",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
];

const stack = [
  { icon: Code2,    label: "React 19 + TypeScript 6", sub: "Frontend" },
  { icon: Server,   label: "Django 6 + DRF",          sub: "Backend" },
  { icon: Database, label: "PostgreSQL",               sub: "Database" },
  { icon: Bot,      label: "MCP / JSON-RPC 2.0",       sub: "Protocol" },
  { icon: Globe,    label: "Vercel + Render",           sub: "Deploy" },
  { icon: Layers,   label: "Tailwind CSS 4",           sub: "UI" },
];

const timeline = [
  { label: "Problem identified",  desc: "AI agents calling tools with zero oversight — no audit trail, no approval gates." },
  { label: "MCP adopted",         desc: "Built a transparent proxy layer on top of the Model Context Protocol." },
  { label: "PolicyEngine shipped",desc: "Composable BLOCK / ALLOW / REQUIRE rules; zero-downtime reload from database." },
  { label: "Dashboard live",      desc: "Real-time KPIs, security event timeline, and threat shield score in production." },
  { label: "Human approvals",     desc: "One-click approve/reject queue — agents pause and wait for a real human decision." },
];

const team = [
  {
    name: "Divya",
    role: "Founder & Lead Engineer",
    initials: "D",
    bio: "Built ArmorIQ end-to-end — Django backend, React frontend, MCP protocol layer, and policy engine.",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-28 pb-20">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-background px-8 py-16 md:px-16 md:py-24">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(oklch(0.72 0.20 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.20 195) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <Reveal direction="up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              AI Agent Security Platform
            </div>
          </Reveal>

          <Reveal direction="up" delay={80}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              Every tool call,{" "}
              <span className="gradient-text">governed.</span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={160}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              ArmorIQ sits between your AI agent and its tools. Every MCP tool call passes
              through a policy engine before execution — enforced in real time, logged
              immutably, and surfaced in a live security dashboard.
            </p>
          </Reveal>

          <Reveal direction="up" delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://amor-beta-livid.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_oklch(0.72_0.20_195/60%)]"
              >
                Live Demo <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                GitHub
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} direction="up" delay={i * 60}>
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-3xl font-bold gradient-text md:text-4xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── What is ArmorIQ ───────────────────────────────────────────────── */}
      <section className="grid gap-12 md:grid-cols-2 md:items-center">
        <Reveal direction="left">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">What we built</p>
            <h2 className="text-3xl font-bold tracking-tight">A governance layer for AI agents</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Modern AI agents are powerful — and ungoverned. They can read files, write
              databases, call APIs, and execute code. ArmorIQ enforces a policy layer at
              the protocol level: every tool call passes through the engine before anything
              executes.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Built on the <strong className="text-foreground">Model Context Protocol (MCP)</strong>,
              ArmorIQ works with any compliant tool server. Rules reload from the database on
              every call — no restarts, no downtime, no config files to deploy.
            </p>
            <ul className="mt-6 space-y-2">
              {["Policy rules evaluated on every call", "Human approvals pause the agent mid-run", "Immutable PostgreSQL audit log", "Live threat shield score"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Architecture diagram */}
        <Reveal direction="right" delay={120}>
          <div className="glass-card rounded-xl p-6 font-mono text-xs">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Request flow
            </p>
            {[
              { label: "User Prompt", color: "text-foreground",    bg: "bg-muted/40" },
              { label: "LLM Agent",   color: "text-primary",       bg: "bg-primary/10" },
              { label: "PolicyEngine", color: "text-warning",      bg: "bg-warning/10" },
              null,
              { label: "✅ ALLOW → MCP execute",  color: "text-success",     bg: "bg-success/10" },
              { label: "🚫 BLOCK  → Error logged", color: "text-destructive", bg: "bg-destructive/10" },
              { label: "⏳ HOLD   → Human reviews",color: "text-warning",     bg: "bg-warning/10" },
            ].map((item, i) =>
              item === null ? (
                <div key={i} className="my-2 flex items-center gap-1.5 text-muted-foreground/40">
                  <div className="h-px flex-1 border-t border-dashed border-current" />
                  <span className="text-[9px]">decision</span>
                  <div className="h-px flex-1 border-t border-dashed border-current" />
                </div>
              ) : (
                <div key={i} className="flex flex-col items-center">
                  <div className={cn("w-full rounded-md border border-border px-3 py-2", item.bg)}>
                    <span className={cn("font-semibold", item.color)}>{item.label}</span>
                  </div>
                  {i < 3 && <div className="h-5 w-px bg-border" />}
                </div>
              )
            )}
          </div>
        </Reveal>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section>
        <Reveal direction="up">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Capabilities</p>
            <h2 className="text-3xl font-bold tracking-tight">Built for real production use</h2>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} direction="up" delay={i * 60}>
                <div className={cn(
                  "glass-card h-full rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_-8px_oklch(0.72_0.20_195/20%)]",
                  f.border,
                )}>
                  <div className={cn("mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg", f.bg)}>
                    <Icon className={cn("h-5 w-5", f.color)} />
                  </div>
                  <h3 className="mb-2 font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section>
        <Reveal direction="up">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">How we got here</p>
            <h2 className="text-3xl font-bold tracking-tight">Build history</h2>
          </div>
        </Reveal>
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary/60 via-border to-transparent" />
          <ol className="space-y-8 pl-16">
            {timeline.map((step, i) => (
              <Reveal key={step.label} direction="left" delay={i * 80}>
                <li className="relative">
                  <span className="absolute -left-[43px] flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="font-semibold">{step.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Tech stack ───────────────────────────────────────────────────── */}
      <section>
        <Reveal direction="up">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Under the hood</p>
            <h2 className="text-3xl font-bold tracking-tight">Tech stack</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stack.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.label} direction="scale" delay={i * 50}>
                <div className="glass-card flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold leading-tight">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section>
        <Reveal direction="up">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">The team</p>
            <h2 className="text-3xl font-bold tracking-tight">Who built this</h2>
          </div>
        </Reveal>
        <div className="flex justify-center">
          {team.map((member, i) => (
            <Reveal key={member.name} direction="scale" delay={i * 80}>
              <div className="glass-card w-full max-w-sm rounded-xl p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary/30">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground shadow-[0_0_32px_-4px_oklch(0.72_0.20_195/50%)]">
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-sm font-medium text-primary">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <Reveal direction="up">
        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent px-8 py-14 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">See it running</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            The live demo hits the production backend. Generate tool calls, watch the policy
            engine decide, and approve or reject from the dashboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://amor-beta-livid.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_-4px_oklch(0.72_0.20_195/65%)]"
            >
              Open live demo <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://armoriq-backend-9ka9.onrender.com/api/health/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              API health check
            </a>
          </div>
        </section>
      </Reveal>

    </div>
  );
}
