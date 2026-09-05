import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ClipboardList, HeartPulse, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BigButton, Card, ChoiceTile, Disclaimer, EmptyState, PageHeader, Section, StatusPill } from "@/components/app/ui";
import { formatDate, timeAgo } from "@/lib/format";
import { vets } from "@/lib/mock/data";
import { api } from "@/lib/services/api";
import { useApp } from "@/lib/store";
import type { CaseStage, RecoveryUpdate } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cases/$id")({
  head: () => ({
    meta: [
      { title: "Case Tracking — Kintsugi Care" },
      { name: "description", content: "Follow your animal's case from report to recovery, and send daily recovery updates." },
      { property: "og:title", content: "Case Tracking — Kintsugi Care" },
      { property: "og:description", content: "Timeline, vet instructions and recovery updates." },
    ],
  }),
  component: CasePage,
});

const stages: { s: CaseStage; k: "tReported" | "tAssessed" | "tVetNotified" | "tVetVisit" | "tTreatment" | "tFollowUp" | "tResolved" }[] = [
  { s: "reported", k: "tReported" }, { s: "assessed", k: "tAssessed" }, { s: "vetNotified", k: "tVetNotified" },
  { s: "vetVisit", k: "tVetVisit" }, { s: "treatment", k: "tTreatment" }, { s: "followUp", k: "tFollowUp" }, { s: "resolved", k: "tResolved" },
];

function CasePage() {
  const { id } = Route.useParams();
  const { t, lang, findCase, hydrated, addRecovery, online } = useApp();
  const navigate = useNavigate();
  const c = findCase(id);
  const [form, setForm] = useState<Partial<RecoveryUpdate>>({});
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  if (!hydrated) return <div><PageHeader title={t("caseTimeline")} /><div className="mx-4 skeleton h-64 rounded-3xl" /></div>;
  if (!c) return <div><PageHeader title={t("caseTimeline")} /><div className="px-4"><EmptyState icon={ClipboardList} title={t("noActiveCase")} sub={t("noActiveCaseSub")} action={<BigButton onClick={() => navigate({ to: "/report" })}>{t("reportProblem")}</BigButton>} /></div></div>;

  const cur = stages.findIndex((x) => x.s === c.stage);
  const vet = vets[0]!;
  const canSubmit = form.overall && form.eating && form.activity;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const r: RecoveryUpdate = { id: `r-${Date.now()}`, date: new Date().toISOString(), overall: form.overall!, eating: form.eating!, activity: form.activity! };
    addRecovery(c.id, r);
    if (online) { try { await api.submitRecovery(); } catch { /* stored locally */ } }
    setSaving(false); setOpen(false); setForm({});
    toast.success(t("updateSaved"));
    if (r.overall === "worse") toast(t("worseWarning"));
  };

  return (
    <div className="pb-8">
      <PageHeader title={c.animalName} subtitle={`${t("reportNumber")}: ${c.id}`} right={<StatusPill status={c.assessment.level} label={t(c.assessment.level === "high" ? "highPriority" : c.assessment.level === "medium" ? "mediumPriority" : "lowPriority")} />} />
      {c.syncState !== "synced" && <div className="mx-4 rounded-2xl bg-attention-soft px-4 py-2.5 text-sm">{t("savedOfflineSub")}</div>}

      <Section title={t("caseTimeline")}>
        <Card>
          <ol className="relative ml-3 border-l-2 border-border">
            {stages.map((s, i) => {
              const done = i <= cur, active = i === cur;
              return (
                <li key={s.s} className="mb-4 ml-5 last:mb-0">
                  <span className={cn("absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full border-2", done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card", active && "ring-4 ring-primary-soft")}>{done && !active && <Check className="h-3 w-3" />}{active && <span className="h-2 w-2 rounded-full bg-card" />}</span>
                  <p className={cn("font-bold leading-5", !done && "text-muted-foreground")}>{t(s.k)}</p>
                  <p className="text-xs text-muted-foreground">{i === 0 ? timeAgo(c.createdAt, lang) : active ? t("inProgress") : done ? t("done") : t("pending")}</p>
                </li>
              );
            })}
          </ol>
        </Card>
      </Section>

      <Section title={t("assignedVet")}>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft font-extrabold text-primary">{vet.photoInitials}</span>
            <div className="flex-1 min-w-0"><p className="font-bold">{vet.name}</p><p className="truncate text-sm text-muted-foreground">{lang === "hi" ? vet.roleHi : vet.role}</p>{c.vetEta && <p className="text-sm">{t("estArrival")}: {c.vetEta}</p>}</div>
            <a href={`tel:${vet.phone.replace(/\s/g, "")}`} className="press flex h-11 w-11 items-center justify-center rounded-full gradient-fresh text-primary-foreground" aria-label={t("call")}><Phone className="h-5 w-5" /></a>
          </div>
        </Card>
      </Section>

      {c.vetInstructions && (
        <Section title={t("vetInstructions")}>
          <Card><ul className="space-y-2">{c.vetInstructions.map((v, i) => <li key={i} className="flex gap-2 text-sm"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">{i + 1}</span>{v}</li>)}</ul></Card>
        </Section>
      )}

      <Section title={t("recoveryCheck")}>
        {!open ? (
          <>
            <BigButton icon={HeartPulse} onClick={() => setOpen(true)}>{t("updateCase")}</BigButton>
            {c.recovery.length > 0 && (
              <div className="mt-3 space-y-2">{c.recovery.map((r) => (
                <div key={r.id} className="surface-card flex items-center justify-between p-3 text-sm">
                  <span>{formatDate(r.date, lang)}</span>
                  <StatusPill status={r.overall === "better" ? "healthy" : r.overall === "same" ? "attention" : "care"} label={t(r.overall)} />
                </div>))}
              </div>
            )}
          </>
        ) : (
          <Card>
            {([
              { k: "howIsToday", f: "overall", o: [["better", "better"], ["same", "same"], ["worse", "worse"]] },
              { k: "eating", f: "eating", o: [["normal", "normal"], ["less", "less"], ["none", "notEating"]] },
              { k: "activity", f: "activity", o: [["normal", "normal"], ["less", "less"], ["veryWeak", "veryWeak"]] },
            ] as const).map((q) => (
              <div key={q.f} className="mb-4">
                <p className="mb-2 font-bold">{t(q.k)}</p>
                <div className="grid grid-cols-3 gap-2">{q.o.map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setForm((p) => ({ ...p, [q.f]: v }))} className={cn("press rounded-xl border-2 px-2 py-3 text-sm font-bold", form[q.f] === v ? "border-primary bg-primary-soft" : "border-border")}>{t(l)}</button>))}
                </div>
              </div>
            ))}
            <BigButton onClick={submit} disabled={!canSubmit || saving}>{saving ? t("loading") : t("submitUpdate")}</BigButton>
          </Card>
        )}
      </Section>

      <Section title={t("exposureCheck")}>
        {c.exposure ? (
          <Card><p className="text-sm">{t("locationsVisited")}: <b>{c.exposure.places.map((p) => t(p)).join(", ")}</b></p><p className="mt-1 text-sm">{t("potentiallyExposed")}: <b>{c.exposure.companions.cows + c.exposure.companions.buffaloes + c.exposure.companions.goats}</b></p></Card>
        ) : (
          <Link to="/exposure/$id" params={{ id: c.id }} className="surface-card press flex items-center gap-3 p-4"><MapPin className="h-5 w-5 text-primary" /><span className="flex-1 font-bold">{t("exposureQ")}</span></Link>
        )}
      </Section>
      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );
}
