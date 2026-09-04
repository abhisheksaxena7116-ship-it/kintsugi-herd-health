import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Activity, ChevronRight, MapPin, QrCode, Stethoscope, Syringe } from "lucide-react";
import { useState } from "react";
import { Card, Disclaimer, EmptyState, PageHeader, Section, StatusPill } from "@/components/app/ui";
import { daysUntil, formatDate } from "@/lib/format";
import { animals, vets } from "@/lib/mock/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/animals/$id")({
  loader: ({ params }) => {
    const animal = animals.find((a) => a.id === params.id);
    if (!animal) throw notFound();
    return { animal };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.animal.name} — Health Passport — Kintsugi Care` },
          { name: "description", content: `Health passport for ${loaderData.animal.name} (${loaderData.animal.breed}): vaccinations, history and movement.` },
          { property: "og:title", content: `${loaderData.animal.name} — Health Passport` },
          { property: "og:description", content: `Vaccinations, history and movement for ${loaderData.animal.name}.` },
        ]
      : [{ title: "Animal not found — Kintsugi Care" }, { name: "robots", content: "noindex" }],
  }),
  component: PassportPage,
});

const placeKeyLabel = { farm: "farm", grazing: "grazing", waterPoint: "waterPoint", market: "market", otherFarm: "otherFarm", vetClinic: "vetClinic" } as const;

function PassportPage() {
  const { animal } = Route.useLoaderData();
  const { t, lang, cases } = useApp();
  const [tab, setTab] = useState<"reports" | "treatment" | "visits">("reports");
  const [showQr, setShowQr] = useState(false);
  const activeCase = cases.find((c) => c.animalId === animal.id && c.stage !== "resolved");
  const history = animal.history.filter((h) => (tab === "reports" ? h.kind === "report" || h.kind === "note" : tab === "treatment" ? h.kind === "treatment" : h.kind === "visit"));

  return (
    <div>
      <PageHeader title={t("healthPassport")} subtitle={animal.id} />
      <div className="px-4">
        <div className="surface-card overflow-hidden">
          <div className="relative h-52">
            <img src={animal.photo} alt={animal.name} className="h-full w-full object-cover" width={800} height={400} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-cream">
              <h2 className="text-2xl font-extrabold">{animal.name}</h2>
              <p className="text-sm opacity-90">{animal.breed} · {t(animal.gender)} · {t("years", { n: animal.ageYears })}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("animalId")}</p>
              <p className="font-mono text-lg font-extrabold tracking-wider">{animal.id}</p>
            </div>
            <button onClick={() => setShowQr((v) => !v)} className="press inline-flex items-center gap-2 rounded-xl bg-secondary px-3.5 py-2.5 text-sm font-bold"><QrCode className="h-4 w-4" />{t("showQr")}</button>
          </div>
          {showQr && (
            <div className="flex flex-col items-center border-t border-border px-4 py-5 animate-pop">
              <div className="grid grid-cols-9 gap-0.5 rounded-xl bg-card p-3 shadow-card" aria-label={`QR ${animal.id}`}>
                {Array.from({ length: 81 }).map((_, i) => {
                  const seed = (animal.id.charCodeAt(i % animal.id.length) * (i + 7)) % 5;
                  const corner = (i % 9 < 3 && i < 27) || (i % 9 > 5 && i < 27) || (i % 9 < 3 && i > 53);
                  return <span key={i} className={cn("h-3 w-3", corner || seed < 2 ? "bg-ink" : "bg-transparent")} />;
                })}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">{t("qrHint")}</p>
            </div>
          )}
        </div>
      </div>

      <Section title={t("currentHealth")}>
        <Card>
          <div className="flex items-center justify-between">
            <StatusPill status={animal.status} label={t(animal.status === "healthy" ? "healthy" : animal.status === "attention" ? "needAttention" : "underCare")} className="text-sm px-3 py-1.5" />
            {animal.statusNote && <span className="text-sm text-muted-foreground">{t(animal.statusNote as "reducedAppetite")}</span>}
          </div>
          {activeCase && (
            <Link to="/cases/$id" params={{ id: activeCase.id }} className="press mt-3 flex items-center gap-3 rounded-xl bg-secondary p-3">
              <Activity className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold">{t("currentCase")} · {activeCase.id}</p>
                <p className="text-xs text-muted-foreground">{t("assignedVet")}: {vets[0]?.name}</p>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </Card>
        <Link to="/report" search={{ mode: "questions", animal: animal.id }} className="gradient-fresh press mt-3 flex h-14 items-center justify-center gap-2 rounded-2xl font-bold text-primary-foreground shadow-cta">
          <Stethoscope className="h-5 w-5" /> {t("reportForAnimal", { name: animal.name })}
        </Link>
      </Section>

      <Section title={t("vaccinations")}>
        <div className="space-y-2">
          {animal.vaccinations.map((v) => {
            const d = v.dueDate ? daysUntil(v.dueDate) : null;
            return (
              <Card key={v.id} className="flex items-center gap-3 py-3">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", v.status === "done" ? "bg-healthy-soft text-healthy" : v.status === "overdue" ? "bg-urgent-soft text-urgent" : "bg-info-soft text-info")}><Syringe className="h-5 w-5" /></span>
                <div className="flex-1">
                  <p className="font-bold">{v.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {v.status === "done" ? `${t("completedLabel")} · ${formatDate(v.givenDate!, lang)}` : d! < 0 ? t("overdue", { n: -d! }) : t("dueIn", { n: d! })}
                  </p>
                </div>
                <StatusPill status={v.status === "done" ? "healthy" : v.status === "overdue" ? "care" : "info"} label={v.status === "done" ? t("completedLabel") : v.status === "overdue" ? t("vaccOverdue") : t("upcoming")} />
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title={t("healthHistory")}>
        <div className="mb-3 grid grid-cols-3 rounded-2xl bg-secondary p-1">
          {([["reports", t("previousReports")], ["treatment", t("treatmentHistory")], ["visits", t("vetVisits")]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("press rounded-xl px-1 py-2 text-xs font-bold", tab === k ? "bg-card shadow-card text-primary" : "text-muted-foreground")}>{l}</button>
          ))}
        </div>
        {history.length === 0 ? <EmptyState icon={Activity} title={t("noHistory")} sub={t("noHistorySub")} /> : (
          <div className="surface-card divide-y divide-border">
            {history.map((h) => (
              <div key={h.id} className="flex gap-3 p-4">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="font-bold leading-tight">{h.title}</p>
                  {h.detail && <p className="text-sm text-muted-foreground">{h.detail}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(h.date, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={t("movementHistory")}>
        <p className="-mt-2 mb-3 text-sm text-muted-foreground">{t("movementHint")}</p>
        <div className="surface-card p-4">
          <ol className="relative ml-2 border-l-2 border-dashed border-sage pl-5">
            {animal.movement.map((m) => (
              <li key={m.id} className="relative pb-4 last:pb-0">
                <span className="absolute -left-[1.85rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-primary"><MapPin className="h-3.5 w-3.5" /></span>
                <p className="font-bold leading-tight">{t(placeKeyLabel[m.placeKey])}</p>
                <p className="text-sm text-muted-foreground">{formatDate(m.date, lang)} · {m.from}{m.to ? ` – ${m.to}` : ""}</p>
              </li>
            ))}
          </ol>
        </div>
        <Disclaimer text={t("disclaimerShort")} />
      </Section>
    </div>
  );
}
