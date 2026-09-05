import { createFileRoute } from "@tanstack/react-router";
import { Check, PartyPopper } from "lucide-react";
import { Card, Disclaimer, PageHeader, Section } from "@/components/app/ui";
import { checklistItems } from "@/lib/mock/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Daily Prevention Checklist — Kintsugi Care" },
      { name: "description", content: "Six quick daily checks that keep your herd healthy: water, shelter, feed, isolation and vaccination." },
      { property: "og:title", content: "Daily Prevention Checklist — Kintsugi Care" },
      { property: "og:description", content: "Quick daily checks to keep your herd healthy." },
    ],
  }),
  component: ChecklistPage,
});

function ChecklistPage() {
  const { t, checklist, toggleChecklist, hydrated } = useApp();
  const done = hydrated ? checklistItems.filter((i) => checklist[i.id]).length : 0;
  const all = done === checklistItems.length;
  return (
    <div className="pb-8">
      <PageHeader title={t("checklist")} subtitle={t("checklistSub")} />
      <Section>
        <div className={cn("rounded-3xl p-5 text-primary-foreground", all ? "gradient-fresh" : "bg-ink text-cream")}>
          <p className="text-sm font-semibold opacity-90">{t("checklistToday")}</p>
          <p className="mt-1 text-3xl font-extrabold">{t("completed", { a: done, b: checklistItems.length })}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-card/25"><div className="h-full rounded-full bg-card transition-all duration-500" style={{ width: `${(done / checklistItems.length) * 100}%` }} /></div>
          {all && <p className="mt-3 flex items-center gap-2 text-sm font-bold"><PartyPopper className="h-4 w-4" />{t("allDone")} — {t("allDoneSub")}</p>}
        </div>
        <Card className="mt-4 divide-y divide-border p-0">
          {checklistItems.map((i) => {
            const on = !!checklist[i.id];
            return (
              <button key={i.id} type="button" onClick={() => toggleChecklist(i.id)} aria-pressed={on} className="press flex w-full items-center gap-3 px-4 py-4 text-left">
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{on && <Check className="h-4 w-4" />}</span>
                <span className={cn("font-semibold", on && "text-muted-foreground line-through")}>{t(i.key)}</span>
              </button>
            );
          })}
        </Card>
      </Section>
      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );
}
