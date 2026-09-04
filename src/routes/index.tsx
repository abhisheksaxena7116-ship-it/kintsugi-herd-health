import { Link, createFileRoute } from "@tanstack/react-router";
import { Camera, ChevronRight, ClipboardList, HelpCircle, Mic, ShieldCheck, Syringe, Wifi, WifiOff } from "lucide-react";
import { LangToggle } from "@/components/app/LangToggle";
import { Card, Disclaimer, Section, StatusPill } from "@/components/app/ui";
import { daysUntil } from "@/lib/format";
import { animals, areaStatus, checklistItems, farmer, images } from "@/lib/mock/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Kintsugi Care" },
      { name: "description", content: "Your herd at a glance: health status, alerts, checklist and one-tap problem reporting." },
      { property: "og:title", content: "Home — Kintsugi Care" },
      { property: "og:description", content: "Your herd at a glance: health status, alerts and one-tap problem reporting." },
    ],
  }),
  component: HomePage,
});

const symLabel = { fever: "symFever", coughing: "symCoughing", notEating: "symNotEating" } as const;

function HomePage() {
  const { t, lang, online, hydrated, cases, checklist } = useApp();
  const counts = {
    healthy: farmer.totalAnimals - animals.filter((a) => a.status !== "healthy").length,
    attention: animals.filter((a) => a.status === "attention").length,
    care: animals.filter((a) => a.status === "care").length,
  };
  const activeCase = cases.find((c) => c.stage !== "resolved");
  const done = checklistItems.filter((i) => checklist[i.id]).length;
  const dueSoon = animals.flatMap((a) => a.vaccinations.filter((v) => v.status !== "done").map((v) => ({ a, v })))
    .sort((x, y) => daysUntil(x.v.dueDate!) - daysUntil(y.v.dueDate!))[0];
  const attentionAnimal = animals.find((a) => a.status === "attention");

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="gradient-forest relative overflow-hidden rounded-b-[2rem] px-4 pb-8 pt-4 text-primary-foreground">
        <img src={images.grazing} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity" width={1024} height={1024} />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", hydrated && !online ? "bg-attention text-attention-foreground" : "bg-card/15")}>
                {hydrated && !online ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
                {hydrated && !online ? t("offline") : t("online")}
              </span>
            </div>
            <LangToggle className="bg-card/15 [&_button]:text-primary-foreground [&_button[aria-pressed=true]]:bg-card [&_button[aria-pressed=true]]:text-primary" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">{t("greeting", { name: lang === "hi" ? farmer.nameHi : farmer.name })}</h1>
          <p className="mt-1 text-sm opacity-85">{t("greetingSub")}</p>
          <p className="mt-0.5 text-xs opacity-70">{t("village")}: {lang === "hi" ? farmer.villageHi : farmer.village}</p>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              { n: farmer.totalAnimals, l: t("animals"), c: "bg-card/15" },
              { n: counts.healthy, l: t("healthy"), c: "bg-healthy/40" },
              { n: counts.attention, l: t("needAttention"), c: "bg-attention/50" },
              { n: counts.care, l: t("underCare"), c: "bg-urgent/50" },
            ].map((s) => (
              <Link to="/animals" key={s.l} className={cn("press rounded-2xl px-2 py-3 text-center backdrop-blur-sm", s.c)}>
                <div className="text-2xl font-extrabold leading-none">{s.n}</div>
                <div className="mt-1 text-[11px] font-semibold leading-tight opacity-90">{s.l}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Report CTA */}
      <section className="-mt-5 px-4">
        <div className="surface-card p-4 animate-fade-up">
          <h2 className="text-lg font-extrabold">{t("reportProblem")}</h2>
          <p className="text-sm text-muted-foreground">{t("reportProblemSub")}</p>
          {hydrated && !online && <p className="mt-2 rounded-xl bg-attention-soft px-3 py-2 text-xs">{t("offlineCanReport")}</p>}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { mode: "photo", icon: Camera, l: t("photo"), s: t("photoSub"), c: "gradient-fresh text-primary-foreground shadow-cta" },
              { mode: "voice", icon: Mic, l: t("voice"), s: t("voiceSub"), c: "gradient-amber text-attention-foreground shadow-warm" },
              { mode: "questions", icon: HelpCircle, l: t("questions"), s: t("questionsSub"), c: "bg-secondary text-foreground" },
            ].map((m) => (
              <Link key={m.mode} to="/report" search={{ mode: m.mode as "photo" }} className={cn("press flex min-h-[7rem] flex-col items-start justify-between rounded-2xl p-3", m.c)}>
                <m.icon className="h-6 w-6" />
                <span>
                  <span className="block text-sm font-extrabold leading-tight">{m.l}</span>
                  <span className="block text-[11px] leading-tight opacity-80">{m.s}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Needs attention */}
      <Section title={t("needsAttention")}>
        <div className="space-y-2.5">
          {activeCase && (
            <Link to="/cases/$id" params={{ id: activeCase.id }} className="surface-card press flex items-center gap-3 p-3">
              <img src={animals.find((a) => a.id === activeCase.animalId)?.photo ?? images.cowWhite} alt={activeCase.animalName} className="h-14 w-14 rounded-xl object-cover" width={56} height={56} loading="lazy" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="font-bold">{activeCase.animalName}</span><StatusPill status={activeCase.assessment.level} label={t(activeCase.assessment.level === "high" ? "highPriority" : activeCase.assessment.level === "medium" ? "mediumPriority" : "lowPriority")} /></div>
                <p className="text-sm text-muted-foreground">{t("activeCase")} · {activeCase.id}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          )}
          {attentionAnimal && (
            <Link to="/animals/$id" params={{ id: attentionAnimal.id }} className="surface-card press flex items-center gap-3 p-3">
              <img src={attentionAnimal.photo} alt={attentionAnimal.name} className="h-14 w-14 rounded-xl object-cover" width={56} height={56} loading="lazy" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="font-bold">{attentionAnimal.name}</span><StatusPill status="attention" label={t("needAttention")} /></div>
                <p className="text-sm text-muted-foreground">{attentionAnimal.statusNote ? t(attentionAnimal.statusNote as "reducedAppetite") : ""}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          )}
          {dueSoon && (
            <Link to="/vaccinations" className="surface-card press flex items-center gap-3 p-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-info-soft text-info"><Syringe className="h-6 w-6" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{dueSoon.v.name} · {dueSoon.a.name}</p>
                <p className="text-sm text-muted-foreground">{daysUntil(dueSoon.v.dueDate!) < 0 ? t("overdue", { n: -daysUntil(dueSoon.v.dueDate!) }) : t("dueIn", { n: daysUntil(dueSoon.v.dueDate!) })}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          )}
        </div>
      </Section>

      {/* Protect herd */}
      <Section title={t("protectHerd")}>
        <Link to="/checklist" className="surface-card press block p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><ClipboardList className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="font-bold">{t("checklistToday")}</p>
              <p className="text-sm text-muted-foreground">{t("completed", { a: done, b: checklistItems.length })}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(done / checklistItems.length) * 100}%` }} />
          </div>
        </Link>

        <Card className={cn("mt-3", areaStatus.level === "high" ? "border-urgent/40" : areaStatus.level === "elevated" ? "border-attention/40" : "")}>
          <div className="flex items-start gap-3">
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", areaStatus.level === "normal" ? "bg-healthy-soft text-healthy" : "bg-attention-soft text-attention")}><ShieldCheck className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{t("areaStatus")}</p>
                <StatusPill status={areaStatus.level === "normal" ? "healthy" : areaStatus.level === "elevated" ? "attention" : "care"} label={t(areaStatus.level === "normal" ? "areaNormal" : areaStatus.level === "elevated" ? "areaElevated" : "areaHigh")} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{areaStatus.level === "normal" ? t("areaNormalDesc") : t("areaReports", { n: areaStatus.nearbyReports })}</p>
              {areaStatus.level !== "normal" && (
                <>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("signsToWatch")}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {areaStatus.signs.map((s) => <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{t(symLabel[s])}</span>)}
                  </div>
                </>
              )}
              <Link to="/alerts" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">{t("viewPrecautions")} <ChevronRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </Card>
      </Section>

      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );
}
