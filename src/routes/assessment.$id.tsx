import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CloudOff, HeartPulse, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { BigButton, Card, Disclaimer, EmptyState, PageHeader, Section, StatusPill } from "@/components/app/ui";
import { safetyMeasures, vets } from "@/lib/mock/data";
import { reasonLabel } from "@/lib/risk";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment/$id")({
  head: () => ({
    meta: [
      { title: "Risk Assessment — Kintsugi Care" },
      { name: "description", content: "Priority level, reasons and what to do now for your reported animal." },
      { property: "og:title", content: "Risk Assessment — Kintsugi Care" },
      { property: "og:description", content: "Priority level and next steps for your animal." },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { id } = Route.useParams();
  const { t, lang, findCase, online, hydrated } = useApp();
  const navigate = useNavigate();
  const [requested, setRequested] = useState(false);
  const c = findCase(id);

  if (!hydrated) return <div className="p-4"><PageHeader title={t("assessmentTitle")} /><div className="skeleton h-40 rounded-3xl" /></div>;
  if (!c) return <div><PageHeader title={t("assessmentTitle")} /><div className="px-4"><EmptyState icon={HeartPulse} title={t("noActiveCase")} sub={t("noActiveCaseSub")} action={<BigButton onClick={() => navigate({ to: "/report" })}>{t("reportProblem")}</BigButton>} /></div></div>;

  const lvl = c.assessment.level;
  const tone = lvl === "high" ? "gradient-urgent text-urgent-foreground" : lvl === "medium" ? "gradient-amber text-attention-foreground" : "gradient-fresh text-primary-foreground";
  const vet = vets[0]!;

  return (
    <div className="pb-8">
      <PageHeader title={t("assessmentTitle")} subtitle={`${c.animalName} · ${c.id}`} />
      {c.syncState === "pending" && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-2xl bg-attention-soft px-4 py-3 text-sm"><CloudOff className="h-4 w-4 text-attention" />{t("savedOfflineSub")}</div>
      )}
      <div className={cn("mx-4 rounded-3xl p-5 animate-fade-up", tone)}>
        <p className="text-xs font-bold uppercase tracking-wide opacity-90">{t("priority")}</p>
        <div className="mt-1 flex items-end justify-between">
          <h2 className="text-3xl font-extrabold">{t(lvl === "high" ? "highPriority" : lvl === "medium" ? "mediumPriority" : "lowPriority")}</h2>
          <span className="text-4xl font-extrabold opacity-90">{c.assessment.score}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-card/30"><div className="h-full rounded-full bg-card" style={{ width: `${c.assessment.score}%` }} /></div>
        <p className="mt-3 text-sm opacity-90">{t("notDiagnosis")}</p>
      </div>

      <Section title={t("why")}>
        <Card><ul className="space-y-2">{c.assessment.reasons.map((r) => <li key={r} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{reasonLabel(r, lang)}</li>)}</ul></Card>
      </Section>

      <Section title={t("whatNow")}>
        {lvl !== "low" && (
          <Card className="mb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><Phone className="h-5 w-5" /></span>
              <div className="flex-1"><p className="font-bold">{t("contactVet")}</p><p className="text-sm text-muted-foreground">{vet.name}</p></div>
              <StatusPill status={vet.availability === "available" ? "healthy" : "attention"} label={t(vet.availability)} />
            </div>
            {requested || c.stage !== "reported" ? (
              <div className="mt-3 rounded-xl bg-healthy-soft px-3 py-2.5 text-sm"><p className="font-bold text-healthy">{t("vetRequested")}</p><p>{t("estArrival")}: {c.vetEta ?? (online ? "2–4 hours" : "—")}</p></div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <BigButton variant={lvl === "high" ? "urgent" : "primary"} icon={Phone} className="h-12 text-sm" onClick={() => { window.location.href = `tel:${vet.phone.replace(/\s/g, "")}`; }}>{t("callVet")}</BigButton>
                <BigButton variant="secondary" className="h-12 text-sm" onClick={() => setRequested(true)}>{t("vetRequested").split(" ")[0]} {t("vetHelp")}</BigButton>
              </div>
            )}
          </Card>
        )}
        <Card>
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><p className="font-bold">{t("generalMeasures")}</p></div>
          <ul className="mt-2 space-y-2">{safetyMeasures.map((m) => <li key={m.en} className="flex gap-2 text-sm"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{lang === "hi" ? m.hi : m.en}</li>)}</ul>
        </Card>
      </Section>

      <Section title={t("whileYouWait")}>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/first-aid" className="surface-card press p-4 text-center"><HeartPulse className="mx-auto mb-2 h-6 w-6 text-urgent" /><p className="text-sm font-bold">{t("viewFirstAid")}</p></Link>
          <Link to="/cases/$id" params={{ id: c.id }} className="surface-card press p-4 text-center"><CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-primary" /><p className="text-sm font-bold">{t("monitorAnimal")}</p></Link>
        </div>
        <div className="mt-3"><BigButton variant="secondary" onClick={() => navigate({ to: "/exposure/$id", params: { id: c.id } })}>{t("exposureQ")}</BigButton></div>
      </Section>
      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );
}
