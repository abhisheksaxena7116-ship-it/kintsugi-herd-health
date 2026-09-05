import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Bell, BellRing, CalendarDays, MapPin, Syringe } from "lucide-react";
import { toast } from "sonner";
import { Card, CardSkeleton, Disclaimer, OfflineNote, PageHeader, Section, StatusPill } from "@/components/app/ui";
import { daysUntil, formatDate } from "@/lib/format";
import { animals } from "@/lib/mock/data";
import { api } from "@/lib/services/api";
import { useApp, useRemote } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vaccinations")({
  head: () => ({
    meta: [
      { title: "Vaccinations — Kintsugi Care" },
      { name: "description", content: "Upcoming and completed vaccinations for your herd, with reminders and nearby vaccination camps." },
      { property: "og:title", content: "Vaccinations — Kintsugi Care" },
      { property: "og:description", content: "Track herd vaccinations and nearby camps." },
    ],
  }),
  component: VaccPage,
});

function VaccPage() {
  const { t, lang, online, hydrated, reminders, toggleReminder } = useApp();
  const camps = useRemote(() => api.getCamps(), online);
  const all = animals.flatMap((a) => a.vaccinations.map((v) => ({ a, v })));
  const upcoming = all.filter((x) => x.v.status !== "done").sort((x, y) => daysUntil(x.v.dueDate!) - daysUntil(y.v.dueDate!));
  const done = all.filter((x) => x.v.status === "done");

  return (
    <div className="pb-8">
      <PageHeader title={t("vaccinations")} />
      <Section title={t("upcoming")}>
        <div className="space-y-2.5">
          {upcoming.map(({ a, v }) => {
            const d = hydrated ? daysUntil(v.dueDate!) : 0;
            const on = reminders.includes(v.id);
            return (
              <Card key={v.id}>
                <div className="flex items-center gap-3">
                  <img src={a.photo} alt={a.name} className="h-12 w-12 rounded-xl object-cover" width={48} height={48} loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{v.name}</p>
                    <Link to="/animals/$id" params={{ id: a.id }} className="text-sm text-muted-foreground">{a.name} · {a.id}</Link>
                  </div>
                  {hydrated && <StatusPill status={d < 0 ? "care" : d <= 7 ? "attention" : "info"} label={d < 0 ? t("overdue", { n: -d }) : t("dueIn", { n: d })} />}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />{formatDate(v.dueDate!, lang)}</span>
                  <button type="button" onClick={() => { toggleReminder(v.id); if (!on) toast.success(t("reminderSet")); }} className={cn("press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold", on ? "bg-primary-soft text-primary" : "bg-secondary")}>{on ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}{on ? t("reminderSet") : t("setReminder")}</button>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title={t("nearbyCamp")}>
        {camps.status === "loading" && <CardSkeleton />}
        {camps.status === "offline" && !camps.data && <OfflineNote />}
        {camps.data?.map((c) => (
          <Card key={c.location} className="border-primary/30">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><Syringe className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{lang === "hi" ? c.locationHi : c.location}</p>
                <p className="text-sm text-muted-foreground">{formatDate(c.date, lang)} · {c.time}</p>
                {c.verified && <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-healthy"><BadgeCheck className="h-3.5 w-3.5" />{t("verifiedInfo")}</span>}
              </div>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(c.location)}`} target="_blank" rel="noreferrer" className="press flex h-10 w-10 items-center justify-center rounded-full bg-secondary" aria-label={t("directions")}><MapPin className="h-4 w-4" /></a>
            </div>
          </Card>
        ))}
      </Section>

      <Section title={t("completedLabel")}>
        <Card className="divide-y divide-border p-0">
          {done.map(({ a, v }) => (
            <div key={v.id} className="flex items-center gap-3 px-4 py-3"><BadgeCheck className="h-5 w-5 text-healthy" /><div className="flex-1 min-w-0"><p className="text-sm font-bold">{v.name}</p><p className="text-xs text-muted-foreground">{a.name} · {v.givenDate ? formatDate(v.givenDate, lang) : ""}</p></div></div>
          ))}
        </Card>
      </Section>
      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );
}
