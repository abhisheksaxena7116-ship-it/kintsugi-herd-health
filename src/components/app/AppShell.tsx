import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, CloudOff, Home, Menu, PawPrint, Plus, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, online, pendingCount, syncing, hydrated } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = pathname.startsWith("/report");

  const tabs = [
    { to: "/", label: t("navHome"), icon: Home },
    { to: "/animals", label: t("navAnimals"), icon: PawPrint },
    { to: "/report", label: t("navReport"), icon: Plus, center: true },
    { to: "/alerts", label: t("navAlerts"), icon: Bell },
    { to: "/more", label: t("navMore"), icon: Menu },
  ] as const;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background sm:border-x sm:border-border">
      {hydrated && !online && (
        <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-xs font-bold text-cream animate-slide-down">
          <CloudOff className="h-3.5 w-3.5" /> {t("offlineBannerShort")}
        </div>
      )}
      {hydrated && online && (syncing || pendingCount > 0) && (
        <Link to="/pending" className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-info px-4 py-2 text-xs font-bold text-primary-foreground animate-slide-down">
          <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
          {syncing ? t("syncing", { n: pendingCount }) : pendingCount === 1 ? t("oneReportWaiting") : t("reportsWaiting", { n: pendingCount })}
        </Link>
      )}
      <main className={cn("flex-1", !hideNav && "safe-bottom")}>{children}</main>
      {!hideNav && (
        <nav aria-label="Main" className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <ul className="grid grid-cols-5 items-end">
            {tabs.map((tab) => (
              <li key={tab.to} className="flex justify-center">
                {"center" in tab && tab.center ? (
                  <Link to={tab.to} aria-label={tab.label} className="press -mt-6 flex flex-col items-center gap-1">
                    <span className="gradient-fresh flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-cta ring-4 ring-background">
                      <Plus className="h-7 w-7" strokeWidth={2.5} />
                    </span>
                    <span className="text-[11px] font-bold text-primary">{tab.label}</span>
                  </Link>
                ) : (
                  <Link to={tab.to} activeOptions={{ exact: tab.to === "/" }}
                    className="press flex h-16 w-full flex-col items-center justify-center gap-1 text-muted-foreground"
                    activeProps={{ className: "text-primary" }}>
                    {({ isActive }) => (
                      <>
                        <span className={cn("flex h-8 w-12 items-center justify-center rounded-full transition-colors", isActive && "bg-primary-soft")}>
                          <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                        </span>
                        <span className="text-[11px] font-bold">{tab.label}</span>
                      </>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}
