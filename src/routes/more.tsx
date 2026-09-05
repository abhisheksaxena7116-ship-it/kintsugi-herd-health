import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, ChevronRight, ClipboardList, CloudOff, FolderClock, HeartPulse, Languages, RefreshCw, ShieldCheck, Stethoscope, Syringe, User, type LucideIcon } from "lucide-react";
import { Card, PageHeader, Section } from "@/components/app/ui";
import { LangToggle } from "@/components/app/LangToggle";
import { farmer } from "@/lib/mock/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — Kintsugi Care" },
      { name: "description", content: "First aid, vet help, vaccinations, daily checklist, pending reports, language and offline settings." },
      { property: "og:title", content: "More — Kintsugi Care" },
      { property: "og:description", content: "All tools for protecting your herd in one place." },
    ],
  }),
  component: MorePage,
});

type To = "/first-aid" | "/vet-help" | "/vaccinations" | "/checklist" | "/alerts" | "/pending" | "/animals";

function Row({ to, icon: Icon, label, sub, badge }: { to: To; icon: LucideIcon; label: string; sub?: string; badge?: number }) {
  return (
    <Link to={to} className="press flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1"><span className="block font-bold">{label}</span>{sub && <span className="block text-xs text-muted-foreground">{sub}</span>}</span>
      {badge ? <span className="rounded-full bg-attention px-2 py-0.5 text-xs font-bold text-attention-foreground">{badge}</span> : null}
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}

function MorePage() {
  const { t, lang, simulateOffline, setSimulateOffline, pendingCount, syncNow, syncing, online, hydrated } = useApp();
  return (
    <div className="pb-8">
      <PageHeader title={t("more")} back={false} />
      <Section>
        <Card className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full gradient-fresh text-xl font-extrabold text-primary-foreground"><User className="h-7 w-7" /></span>
          <div className="flex-1"><p className="text-lg font-extrabold">{lang === "hi" ? farmer.nameHi : farmer.name}</p><p className="text-sm text-muted-foreground">{t("village")}: {lang === "hi" ? farmer.villageHi : farmer.village}, {farmer.district} · {farmer.totalAnimals} {t("animals")}</p></div>
        </Card>
      </Section>
      <Section title={t("protectMyHerd")}>
        <Card className="divide-y divide-border p-0">
          <Row to="/first-aid" icon={HeartPulse} label={t("firstAid")} sub={t("firstAidSub")} />
          <Row to="/vet-help" icon={Stethoscope} label={t("vetHelp")} />
          <Row to="/vaccinations" icon={Syringe} label={t("vaccinations")} />
          <Row to="/checklist" icon={ClipboardList} label={t("checklist")} sub={t("dailyPrevention")} />
          <Row to="/alerts" icon={Bell} label={t("areaAlerts")} />
          <Row to="/pending" icon={FolderClock} label={t("pendingReports")} badge={hydrated ? pendingCount : 0} />
        </Card>
      </Section>
      <Section title={t("language")}>
        <Card className="flex items-center justify-between"><span className="flex items-center gap-3 font-bold"><Languages className="h-5 w-5 text-primary" />{t("language")}</span><LangToggle /></Card>
      </Section>
      <Section title={t("demoTools")}>
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <CloudOff className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1"><p className="font-bold">{t("simulateOffline")}</p><p className="text-xs text-muted-foreground">{t("simulateOfflineSub")}</p></div>
            <button type="button" role="switch" aria-checked={simulateOffline} onClick={() => setSimulateOffline(!simulateOffline)} className={cn("relative h-7 w-12 rounded-full transition-colors", simulateOffline ? "bg-attention" : "bg-border")}><span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform", simulateOffline ? "translate-x-5.5 left-0" : "left-0.5")} /></button>
          </div>
          <button type="button" onClick={() => void syncNow()} disabled={!online || syncing || pendingCount === 0} className="press flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary font-bold disabled:opacity-50"><RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />{t("syncNow")} {pendingCount ? `(${pendingCount})` : ""}</button>
        </Card>
      </Section>
      <p className="mt-6 flex items-center justify-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" />{t("appName")} · {t("tagline")}</p>
    </div>
  );
}
