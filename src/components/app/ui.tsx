import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, CloudOff, RefreshCw, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import type { HealthStatus } from "@/lib/types";

export function PageHeader({ title, subtitle, back = true, right }: { title: string; subtitle?: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  const { t } = useApp();
  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-3 pb-3">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))}
            aria-label={t("back")}
            className="press -ml-1 flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{title}</h1>
          {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function Section({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("px-4 mt-6", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h2 className="text-base font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className={cn("surface-card block w-full text-left p-4", onClick && "press", className)}>
      {children}
    </Comp>
  );
}

export function StatusPill({ status, label, className }: { status: HealthStatus | "high" | "medium" | "low" | "info"; label: string; className?: string }) {
  const map: Record<string, string> = {
    healthy: "bg-healthy-soft text-healthy",
    low: "bg-healthy-soft text-healthy",
    attention: "bg-attention-soft text-attention",
    medium: "bg-attention-soft text-attention",
    care: "bg-urgent-soft text-urgent",
    high: "bg-urgent-soft text-urgent",
    info: "bg-info-soft text-info",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", map[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function BigButton({
  children, onClick, variant = "primary", disabled, className, icon: Icon, type = "button",
}: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "urgent" | "ghost" | "amber"; disabled?: boolean; className?: string; icon?: LucideIcon; type?: "button" | "submit" }) {
  const v = {
    primary: "gradient-fresh text-primary-foreground shadow-cta",
    amber: "gradient-amber text-attention-foreground shadow-warm",
    urgent: "gradient-urgent text-urgent-foreground",
    secondary: "bg-card border border-border text-foreground shadow-card",
    ghost: "bg-transparent text-primary hover:bg-primary-soft",
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={cn("press flex h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-bold disabled:opacity-50 disabled:shadow-none", v, className)}>
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </button>
  );
}

export function ChoiceTile({ selected, onClick, label, sub, icon, className }: { selected?: boolean; onClick: () => void; label: string; sub?: string; icon?: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={cn(
        "press flex min-h-[4.25rem] w-full items-center gap-3 rounded-2xl border-2 bg-card p-3.5 text-left transition-colors",
        selected ? "border-primary bg-primary-soft" : "border-border hover:border-sage", className,
      )}>
      {icon && <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl", selected ? "bg-card" : "bg-secondary")}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight">{label}</span>
        {sub && <span className="block text-sm text-muted-foreground">{sub}</span>}
      </span>
      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2", selected ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
        {selected && <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 10l4 4 8-8" /></svg>}
      </span>
    </button>
  );
}

export function EmptyState({ icon: Icon, title, sub, action }: { icon: LucideIcon; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="surface-card flex flex-col items-center px-6 py-10 text-center animate-fade-up">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary"><Icon className="h-8 w-8" /></div>
      <p className="font-bold">{title}</p>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      {action && <div className="mt-4 w-full">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useApp();
  return (
    <div className="surface-card flex flex-col items-center px-6 py-8 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-urgent-soft text-urgent"><TriangleAlert className="h-7 w-7" /></div>
      <p className="font-bold">{t("errorTitle")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("errorSub")}</p>
      {onRetry && <button onClick={onRetry} className="press mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold"><RefreshCw className="h-4 w-4" />{t("retry")}</button>}
    </div>
  );
}

export function OfflineNote({ text }: { text?: string }) {
  const { t } = useApp();
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-attention-soft px-4 py-3 text-sm text-foreground">
      <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-attention" />
      <span>{text ?? t("liveAlertsOffline")}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} aria-hidden />;
}

export function CardSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="surface-card p-4 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
    </div>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return (
    <p className="mt-4 flex items-start gap-2 rounded-2xl border border-dashed border-border bg-secondary/60 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {text}
    </p>
  );
}

export function LinkCard({ to, params, children, className }: { to: string; params?: Record<string, string>; children: ReactNode; className?: string }) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link to={to as any} params={params as any} className={cn("surface-card press block p-4", className)}>
      {children}
    </Link>
  );
}
