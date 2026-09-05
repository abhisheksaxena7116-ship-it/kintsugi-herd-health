import { createFileRoute } from "@tanstack/react-router";
import { Bell, ChevronDown, ShieldAlert, ShieldCheck, Syringe, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { CardSkeleton, Disclaimer, EmptyState, ErrorState, OfflineNote, PageHeader, Section, StatusPill } from "@/components/app/ui";
import { formatDate } from "@/lib/format";
import { api } from "@/lib/services/api";
import { useApp, useRemote } from "@/lib/store";
import type { AreaAlert, SymptomId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Area Alerts — Kintsugi Care" },
      { name: "description", content: "Local livestock disease alerts, vaccination drives and prevention advisories for your area." },
      { property: "og:title", content: "Area Alerts — Kintsugi Care" },
      { property: "og:description", content: "Disease alerts and precautions near you." },
    ],
  }),
  component: AlertsPage,
});

const symKey: Record<SymptomId, `sym${string}`> = { fever: "symFever", notEating: "symNotEating", weakness: "symWeakness", breathing: "symBreathing", coughing: "symCoughing", looseMotion: "symLooseMotion", walking: "symWalking", discharge: "symDischarge", bleeding: "symBleeding", other: "symOther" };
const catIcon = { urgent: TriangleAlert, health: ShieldAlert, vaccination: Syringe, prevention: ShieldCheck };
const catTone = { urgent: "bg-urgent-soft text-urgent", health: "bg-attention-soft text-attention", vaccination: "bg-info-soft text-info", prevention: "bg-healthy-soft text-healthy" };

function AlertsPage() {
  const { t, lang, online } = useApp();
  const r = useRemote(() => api.getAlerts(), online);
  const [filter, setFilter] = useState<AreaAlert["category"] | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const list = (r.data ?? []).filter((a) => filter === "all" || a.category === filter);

  return (
    <div className="pb-8">
      <PageHeader title={t("alerts")} back={false} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {(["all", "urgent", "health", "vaccination", "prevention"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("press shrink-0 rounded-full px-3.5 py-2 text-sm font-bold", filter === f ? "bg-ink text-cream" : "bg-secondary")}>{t(f)}</button>
        ))}
      </div>
      <Section>
        {r.status === "offline" && <div className="mb-3"><OfflineNote /></div>}
        {r.status === "loading" && <div className="space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}
        {r.status === "error" && <ErrorState onRetry={r.retry} />}
        {r.data && list.length === 0 && <EmptyState icon={Bell} title={t("noAlerts")} sub={t("noAlertsSub")} />}
        <div className="space-y-2.5">
          {list.map((a) => {
            const Icon = catIcon[a.category]; const isOpen = open === a.id;
            return (
              <div key={a.id} className="surface-card overflow-hidden">
                <button type="button" onClick={() => setOpen(isOpen ? null : a.id)} className="flex w-full items-start gap-3 p-4 text-left" aria-expanded={isOpen}>
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", catTone[a.category])}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><StatusPill status={a.category === "urgent" ? "high" : a.category === "health" ? "medium" : a.category === "vaccination" ? "info" : "low"} label={t(a.category)} /><span className="text-xs text-muted-foreground">{formatDate(a.date, lang)}</span></span>
                    <span className="mt-1.5 block font-bold leading-snug">{lang === "hi" ? a.titleHi : a.title}</span>
                    {a.nearbyReports && <span className="mt-1 block text-xs text-muted-foreground">{t("similarNearby", { n: a.nearbyReports })}</span>}
                  </span>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3 text-sm animate-fade-up">
                    <p>{lang === "hi" ? a.bodyHi : a.body}</p>
                    {a.signs && <><p className="mt-3 text-xs font-bold uppercase text-muted-foreground">{t("watchFor")}</p><div className="mt-1.5 flex flex-wrap gap-1.5">{a.signs.map((s) => <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{t(symKey[s] as "symFever")}</span>)}</div></>}
                    {a.precautions && <><p className="mt-3 text-xs font-bold uppercase text-muted-foreground">{t("precautions")}</p><ul className="mt-1.5 space-y-1.5">{a.precautions.map((p, i) => <li key={i} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{lang === "hi" ? p.hi : p.en}</li>)}</ul></>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>
      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );
}
