import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, PawPrint, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, PageHeader, StatusPill } from "@/components/app/ui";
import { daysUntil } from "@/lib/format";
import { animals } from "@/lib/mock/data";
import { useApp } from "@/lib/store";
import type { HealthStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/animals/")({
  head: () => ({
    meta: [
      { title: "My Animals — Kintsugi Care" },
      { name: "description", content: "Every animal in your herd with health status, vaccinations due and a digital health passport." },
      { property: "og:title", content: "My Animals — Kintsugi Care" },
      { property: "og:description", content: "Herd list with health status and vaccination reminders." },
    ],
  }),
  component: AnimalsPage,
});

function AnimalsPage() {
  const { t } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | HealthStatus>("all");
  const list = animals.filter((a) => (filter === "all" || a.status === filter) && (a.name + a.id + a.breed).toLowerCase().includes(q.toLowerCase()));
  const filters: { k: "all" | HealthStatus; l: string }[] = [
    { k: "all", l: t("all") }, { k: "healthy", l: t("healthy") }, { k: "attention", l: t("needAttention") }, { k: "care", l: t("underCare") },
  ];

  return (
    <div>
      <PageHeader title={t("myAnimals")} back={false} />
      <div className="px-4">
        <label className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-4 shadow-card">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchAnimals")} className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground" />
        </label>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {filters.map((f) => (
            <button key={f.k} onClick={() => setFilter(f.k)} className={cn("press shrink-0 rounded-full px-4 py-2 text-sm font-bold", filter === f.k ? "bg-primary text-primary-foreground" : "bg-card border border-border")}>{f.l}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3 px-4">
        {list.length === 0 && <EmptyState icon={PawPrint} title={t("noAnimals")} sub={t("noAnimalsSub")} />}
        {list.map((a, i) => {
          const due = a.vaccinations.filter((v) => v.status !== "done").sort((x, y) => daysUntil(x.dueDate!) - daysUntil(y.dueDate!))[0];
          const d = due ? daysUntil(due.dueDate!) : null;
          return (
            <Link key={a.id} to="/animals/$id" params={{ id: a.id }} className="surface-card press block overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex gap-3 p-3">
                <img src={a.photo} alt={a.name} className="h-24 w-24 shrink-0 rounded-2xl object-cover" width={96} height={96} loading="lazy" />
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-extrabold leading-tight">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.id} · {a.breed}</p>
                    </div>
                    <StatusPill status={a.status} label={t(a.status === "healthy" ? "healthy" : a.status === "attention" ? "needAttention" : "underCare")} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t(a.gender)} · {t("years", { n: a.ageYears })}</p>
                  <p className={cn("mt-1.5 text-sm font-semibold", d === null ? "text-healthy" : d < 0 ? "text-urgent" : d <= 7 ? "text-attention" : "text-muted-foreground")}>
                    {d === null ? t("vaccUpToDate") : d < 0 ? `${due!.name}: ${t("vaccOverdue")}` : `${due!.name}: ${t("vaccDueIn", { n: d })}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-4 py-2.5 text-sm font-bold text-primary">
                {t("viewPassport")} <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
