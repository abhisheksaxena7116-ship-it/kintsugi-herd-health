import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CloudOff, FolderClock, RefreshCw } from "lucide-react";
import { BigButton, Card, EmptyState, OfflineNote, PageHeader, Section, StatusPill } from "@/components/app/ui";
import { timeAgo } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pending")({
  head: () => ({
    meta: [
      { title: "Pending Reports — Kintsugi Care" },
      { name: "description", content: "Reports saved offline that will send automatically when you are back online." },
      { property: "og:title", content: "Pending Reports — Kintsugi Care" },
      { property: "og:description", content: "Offline reports waiting to sync." },
    ],
  }),
  component: PendingPage,
});

function PendingPage() {
  const { t, lang, cases, online, syncNow, syncing, hydrated } = useApp();
  const pending = cases.filter((c) => c.syncState !== "synced");
  const synced = cases.filter((c) => c.syncState === "synced").slice(0, 5);
  return (
    <div className="pb-8">
      <PageHeader title={t("pendingReports")} />
      <Section>
        {hydrated && !online && <div className="mb-3"><OfflineNote text={t("offlineCanReport")} /></div>}
        {hydrated && pending.length === 0 && <EmptyState icon={CheckCircle2} title={t("noPending")} sub={t("noPendingSub")} />}
        <div className="space-y-2.5">
          {pending.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-attention-soft text-attention">{c.syncState === "syncing" ? <RefreshCw className="h-5 w-5 animate-spin" /> : <CloudOff className="h-5 w-5" />}</span>
                <div className="min-w-0 flex-1"><p className="font-bold">{c.animalName} · {c.symptoms.length} {t("symptoms")}</p><p className="text-xs text-muted-foreground">{timeAgo(c.createdAt, lang)} · {c.id}</p></div>
                <StatusPill status={c.syncState === "failed" ? "care" : "medium"} label={c.syncState === "syncing" ? t("syncing", { n: pending.length }) : c.syncState === "failed" ? t("errorTitle") : t("pending")} />
              </div>
              <Link to="/assessment/$id" params={{ id: c.id }} className="mt-3 block text-sm font-bold text-primary">{t("viewCase")} →</Link>
            </Card>
          ))}
        </div>
        {pending.length > 0 && <div className="mt-4"><BigButton icon={RefreshCw} onClick={() => void syncNow()} disabled={!online || syncing} className={cn(syncing && "[&_svg]:animate-spin")}>{online ? t("syncNow") : t("requiresInternet")}</BigButton></div>}
      </Section>
      {synced.length > 0 && (
        <Section title={t("myCases")}>
          <Card className="divide-y divide-border p-0">
            {synced.map((c) => (
              <Link key={c.id} to="/cases/$id" params={{ id: c.id }} className="press flex items-center gap-3 px-4 py-3">
                <FolderClock className="h-5 w-5 text-primary" /><span className="flex-1 min-w-0"><span className="block text-sm font-bold">{c.animalName} · {c.id}</span><span className="block text-xs text-muted-foreground">{timeAgo(c.createdAt, lang)}</span></span><StatusPill status="healthy" label={t("done")} />
              </Link>
            ))}
          </Card>
        </Section>
      )}
    </div>
  );
}
