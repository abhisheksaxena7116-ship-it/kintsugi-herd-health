import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Ban, CheckCircle2, ChevronDown, Phone } from "lucide-react";
import { useState } from "react";
import { Card, Disclaimer, PageHeader, Section, StatusPill } from "@/components/app/ui";
import { firstAidTopics, vets } from "@/lib/mock/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/first-aid")({
  head: () => ({
    meta: [
      { title: "First Aid Guide — Kintsugi Care" },
      { name: "description", content: "Vet-approved first-aid steps for livestock emergencies: bleeding, bloat, heat stress and more. Available offline." },
      { property: "og:title", content: "First Aid Guide — Kintsugi Care" },
      { property: "og:description", content: "Vet-approved livestock first aid, available offline." },
    ],
  }),
  component: FirstAidPage,
});

function FirstAidPage() {
  const { t, lang } = useApp();
  const [open, setOpen] = useState<string | null>(firstAidTopics[0]?.id ?? null);
  const vet = vets[0]!;
  return (
    <div className="pb-8">
      <PageHeader title={t("firstAid")} subtitle={t("firstAidSub")} />
      <div className="mx-4 flex items-start gap-2 rounded-2xl bg-urgent-soft px-4 py-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />{t("firstAidDisclaimer")}</div>
      <Section>
        <div className="space-y-2.5">
          {firstAidTopics.map((f) => {
            const isOpen = open === f.id;
            return (
              <Card key={f.id} className="p-0 overflow-hidden">
                <button type="button" onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={isOpen}>
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", f.urgent ? "bg-urgent-soft text-urgent" : "bg-primary-soft text-primary")}><AlertTriangle className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-bold">{lang === "hi" ? f.titleHi : f.title}</span>{f.urgent && <StatusPill status="high" label={t("urgentVet")} className="mt-1" />}</span>
                  <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3 animate-fade-up">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-healthy">{t("doThis")}</p>
                    <ol className="space-y-2">{f.doSteps.map((s, i) => <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-healthy" />{lang === "hi" ? s.hi : s.en}</li>)}</ol>
                    <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-urgent">{t("avoidThis")}</p>
                    <ul className="space-y-2">{f.avoid.map((s, i) => <li key={i} className="flex gap-2 text-sm"><Ban className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />{lang === "hi" ? s.hi : s.en}</li>)}</ul>
                    <a href={`tel:${vet.phone.replace(/\s/g, "")}`} className="press mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl gradient-urgent font-bold text-urgent-foreground"><Phone className="h-4 w-4" />{t("callVet")}</a>
                    <p className="mt-3 text-[11px] text-muted-foreground">{t("approvedBy")}: {f.approvedBy} · v{f.version}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Section>
      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );
}
