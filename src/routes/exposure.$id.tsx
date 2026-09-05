import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BigButton, Card, ChoiceTile, Disclaimer, EmptyState, PageHeader, Section } from "@/components/app/ui";
import { animals } from "@/lib/mock/data";
import { api } from "@/lib/services/api";
import { useApp } from "@/lib/store";
import type { MovementEntry } from "@/lib/types";

export const Route = createFileRoute("/exposure/$id")({
  head: () => ({
    meta: [
      { title: "Exposure Check — Kintsugi Care" },
      { name: "description", content: "Record where a sick animal has been and which animals it was with, so the vet can assess spread." },
      { property: "og:title", content: "Exposure Check — Kintsugi Care" },
      { property: "og:description", content: "Where has the animal been recently?" },
    ],
  }),
  component: ExposurePage,
});

const places: MovementEntry["placeKey"][] = ["farm", "grazing", "waterPoint", "market", "otherFarm", "vetClinic"];

function ExposurePage() {
  const { id } = Route.useParams();
  const { t, lang, findCase, setExposure, hydrated, online } = useApp();
  const navigate = useNavigate();
  const c = findCase(id);
  const [sel, setSel] = useState<MovementEntry["placeKey"][]>([]);
  const [n, setN] = useState({ cows: 0, buffaloes: 0, goats: 0 });
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(false);

  if (!hydrated) return <div><PageHeader title={t("exposureCheck")} /><div className="mx-4 skeleton h-64 rounded-3xl" /></div>;
  if (!c) return <div><PageHeader title={t("exposureCheck")} /><div className="px-4"><EmptyState icon={MapPin} title={t("noActiveCase")} sub={t("noActiveCaseSub")} /></div></div>;

  const animal = animals.find((a) => a.id === c.animalId);
  const last = animal?.movement[0];
  const total = n.cows + n.buffaloes + n.goats;

  const save = async () => {
    setSaving(true);
    setExposure(c.id, { places: sel, companions: n, createdAt: new Date().toISOString() });
    if (online) { try { await api.submitExposure(); } catch { /* local */ } }
    setSaving(false); setSummary(true); toast.success(t("exposureSaved"));
  };

  if (summary) return (
    <div className="pb-8">
      <PageHeader title={t("exposureSummary")} subtitle={c.animalName} />
      <Section>
        <Card className="space-y-3">
          <div><p className="text-xs font-bold uppercase text-muted-foreground">{t("locationsVisited")}</p><p className="font-bold">{sel.length ? sel.map((p) => t(p)).join(", ") : t("none")}</p></div>
          <div><p className="text-xs font-bold uppercase text-muted-foreground">{t("potentiallyExposed")}</p><p className="text-2xl font-extrabold">{total}</p><p className="text-sm text-muted-foreground">{n.cows} {t("cows")} · {n.buffaloes} {t("buffaloes")} · {n.goats} {t("goats")}</p></div>
          <p className="rounded-xl bg-info-soft px-3 py-2 text-sm">{t("vetAssess")}</p>
        </Card>
        <div className="mt-4"><BigButton onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}>{t("viewCase")}</BigButton></div>
      </Section>
      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );

  return (
    <div className="pb-8">
      <PageHeader title={t("exposureCheck")} subtitle={c.animalName} />
      {last && (
        <div className="mx-4 flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm"><MapPin className="h-4 w-4 text-primary" /><span>{t("lastMovement")}: <b>{t(last.placeKey)}</b> · {last.from}{last.to ? `–${last.to}` : ""}</span></div>
      )}
      <Section title={t("whereBeen")}>
        <div className="grid grid-cols-2 gap-2">{places.map((p) => <ChoiceTile key={p} label={t(p)} selected={sel.includes(p)} onClick={() => setSel((s) => s.includes(p) ? s.filter((x) => x !== p) : [...s, p])} />)}</div>
      </Section>
      <Section title={t("whichWent")}>
        <Card className="space-y-3">
          {(["cows", "buffaloes", "goats"] as const).map((k) => (
            <div key={k} className="flex items-center justify-between">
              <span className="font-bold">{t(k)}</span>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="-" onClick={() => setN((p) => ({ ...p, [k]: Math.max(0, p[k] - 1) }))} className="press flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><Minus className="h-4 w-4" /></button>
                <span className="w-6 text-center text-lg font-extrabold">{n[k]}</span>
                <button type="button" aria-label="+" onClick={() => setN((p) => ({ ...p, [k]: p[k] + 1 }))} className="press flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </Card>
        <div className="mt-4"><BigButton onClick={save} disabled={saving}>{saving ? t("loading") : t("generateSummary")}</BigButton></div>
      </Section>
      <div className="px-4"><Disclaimer text={lang === "hi" ? "यह जानकारी केवल डॉक्टर की मदद के लिए है।" : t("disclaimerShort")} /></div>
    </div>
  );
}
