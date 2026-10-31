import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Re-exports from individual dashboard components
export { StatsCard } from "./StatsCard";
export { ActivityFeed } from "./ActivityFeed";
export { MCPServerCard } from "./MCPServerCard";
export { RulesTable } from "./RulesTable";
export { ConversationPanel } from "./ConversationPanel";

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-white shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)]", className)}>
      {children}
    </div>
  );
}

const toneMap = {
  primary: { text: "text-primary",     bg: "bg-secondary",                ring: "ring-primary/20" },
  success: { text: "text-success",     bg: "bg-[oklch(0.94_0.04_152)]",   ring: "ring-success/20" },
  warning: { text: "text-warning",     bg: "bg-[oklch(0.96_0.04_78)]",    ring: "ring-warning/20" },
  danger:  { text: "text-destructive", bg: "bg-[oklch(0.96_0.04_22)]",    ring: "ring-destructive/20" },
} as const;

export function KpiCard({
  label, value, delta, Icon, tone = "primary",
}: {
  label: string;
  value: string | number;
  delta: string;
  Icon: LucideIcon;
  tone?: keyof typeof toneMap;
}) {
  const positive = delta.startsWith("+");
  const t = toneMap[tone];
  return (
    <div className="group rounded-2xl border border-border bg-white p-5 shadow-[0_2px_12px_-2px_oklch(0.58_0.16_275/10%)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_24px_-4px_oklch(0.58_0.16_275/18%)] hover:border-[oklch(0.75_0.08_275)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
          <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium", positive ? "text-success" : "text-destructive")}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta} vs last week
          </div>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1", t.bg, t.ring)}>
          <Icon className={cn("h-5 w-5", t.text)} />
        </div>
      </div>
    </div>
  );
}

export function StatusDot({ status }: { status: "online" | "offline" | "warning" }) {
  const cls =
    status === "online"  ? "bg-success" :
    status === "warning" ? "bg-warning" : "bg-muted-foreground";
  return (
    <span className="relative inline-flex h-2 w-2">
      {status === "online" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", cls)} />
    </span>
  );
}

const riskMap = {
  low:      "text-success     bg-[oklch(0.94_0.04_152)] ring-success/30",
  medium:   "text-warning     bg-[oklch(0.96_0.04_78)]  ring-warning/30",
  high:     "text-orange-500  bg-orange-50               ring-orange-400/30",
  critical: "text-destructive bg-[oklch(0.96_0.04_22)]  ring-destructive/40",
} as const;

export function RiskBadge({ level }: { level: keyof typeof riskMap }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
      riskMap[level],
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
      {action}
    </div>
  );
}
