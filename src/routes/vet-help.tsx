import { createFileRoute } from "@tanstack/react-router";
import { Building2, MapPin, MessageCircle, Phone } from "lucide-react";
import { Card, CardSkeleton, Disclaimer, ErrorState, OfflineNote, PageHeader, Section, StatusPill } from "@/components/app/ui";
import { api } from "@/lib/services/api";
import { useApp, useRemote } from "@/lib/store";

export const Route = createFileRoute("/vet-help")({
  head: () => ({
    meta: [
      { title: "Vet Help — Kintsugi Care" },
      { name: "description", content: "Call or message your assigned veterinarian and find the nearest government veterinary hospital." },
      { property: "og:title", content: "Vet Help — Kintsugi Care" },
      { property: "og:description", content: "Reach a vet or the nearest hospital quickly." },
    ],
  }),
  component: VetHelpPage,
});

function VetHelpPage() {
  const { t, lang, online } = useApp();
  const r = useRemote(() => api.getVetHelp(), online);
  return (
    <div className="pb-8">
      <PageHeader title={t("vetHelp")} />
      <Section>
        {r.status === "offline" && <div className="mb-3"><OfflineNote text={t("requiresInternet")} /></div>}
        {r.status === "loading" && <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>}
        {r.status === "error" && <ErrorState onRetry={r.retry} />}
        {r.data && (
          <div className="space-y-3">
            {r.data.vets.map((v) => (
              <Card key={v.id}>
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-lg font-extrabold text-primary">{v.photoInitials}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{v.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{lang === "hi" ? v.roleHi : v.role}</p>
                    <div className="mt-1 flex items-center gap-2"><StatusPill status={v.availability === "available" ? "healthy" : "attention"} label={t(v.availability)} /><span className="text-xs text-muted-foreground">{v.activeCases} {t("activeCases")}</span></div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="press flex h-12 items-center justify-center gap-2 rounded-2xl gradient-fresh font-bold text-primary-foreground"><Phone className="h-4 w-4" />{t("call")}</a>
                  <a href={`sms:${v.phone.replace(/\s/g, "")}`} className="press flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card font-bold"><MessageCircle className="h-4 w-4" />{t("message")}</a>
                </div>
              </Card>
            ))}
            <Card>
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info"><Building2 className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase text-muted-foreground">{t("govHospital")}</p>
                  <p className="font-bold">{lang === "hi" ? r.data.hospital.nameHi : r.data.hospital.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{r.data.hospital.distanceKm} km · {r.data.hospital.hours}</p>
                  <StatusPill status={r.data.hospital.open ? "healthy" : "care"} label={t(r.data.hospital.open ? "open" : "closed")} className="mt-2" />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={`tel:${r.data.hospital.phone.replace(/\s/g, "")}`} className="press flex h-12 items-center justify-center gap-2 rounded-2xl gradient-fresh font-bold text-primary-foreground"><Phone className="h-4 w-4" />{t("call")}</a>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(r.data.hospital.name)}`} target="_blank" rel="noreferrer" className="press flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card font-bold"><MapPin className="h-4 w-4" />{t("directions")}</a>
              </div>
            </Card>
          </div>
        )}
      </Section>
      <div className="px-4"><Disclaimer text={t("disclaimerShort")} /></div>
    </div>
  );
}
