import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Check, CloudOff, ImagePlus, Keyboard, MapPin, Mic, Pencil, Send, Square, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BigButton, ChoiceTile, Disclaimer } from "@/components/app/ui";
import { animals, farmer } from "@/lib/mock/data";
import { assessRisk } from "@/lib/risk";
import { useApp } from "@/lib/store";
import type { CountBand, HealthCase, Onset, PhotoArea, ReportDraft, Species, SymptomId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { parseSpeech, sampleUtterances } from "@/lib/voiceParser";
import type { TranslationKey } from "@/i18n/translations";

type Mode = ReportDraft["mode"];
type Step = "voice" | "photoArea" | "animal" | "symptoms" | "count" | "onset" | "media" | "location" | "review";

export const Route = createFileRoute("/report")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode; animal?: string } => ({
    mode: s.mode === "voice" || s.mode === "photo" || s.mode === "questions" ? s.mode : undefined,
    animal: typeof s.animal === "string" ? s.animal : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Report a Problem — Kintsugi Care" },
      { name: "description", content: "Report a livestock health problem in under a minute by photo, voice or simple questions. Works offline." },
      { property: "og:title", content: "Report a Problem — Kintsugi Care" },
      { property: "og:description", content: "Report by photo, voice or simple questions. Works offline." },
    ],
  }),
  component: ReportPage,
});

const speciesList: { id: Species; key: TranslationKey; emoji: string }[] = [
  { id: "cow", key: "cow", emoji: "🐄" }, { id: "buffalo", key: "buffalo", emoji: "🐃" }, { id: "goat", key: "goat", emoji: "🐐" },
  { id: "sheep", key: "sheep", emoji: "🐑" }, { id: "poultry", key: "poultry", emoji: "🐔" }, { id: "multiple", key: "multiple", emoji: "🐾" }, { id: "other", key: "other", emoji: "❓" },
];
export const symptomList: { id: SymptomId; key: TranslationKey; emoji: string }[] = [
  { id: "fever", key: "symFever", emoji: "🌡️" }, { id: "notEating", key: "symNotEating", emoji: "🥣" }, { id: "weakness", key: "symWeakness", emoji: "😞" },
  { id: "breathing", key: "symBreathing", emoji: "😮‍💨" }, { id: "coughing", key: "symCoughing", emoji: "🤧" }, { id: "looseMotion", key: "symLooseMotion", emoji: "💧" },
  { id: "walking", key: "symWalking", emoji: "🦵" }, { id: "discharge", key: "symDischarge", emoji: "👁️" }, { id: "bleeding", key: "symBleeding", emoji: "🩸" }, { id: "other", key: "symOther", emoji: "➕" },
];
const countList: { id: CountBand; key: TranslationKey }[] = [{ id: "1", key: "justOne" }, { id: "2-5", key: "cow" }, { id: "6-10", key: "cow" }, { id: "10+", key: "moreThan10" }];
const onsetList: { id: Onset; key: TranslationKey }[] = [{ id: "today", key: "today" }, { id: "yesterday", key: "yesterday" }, { id: "2-3d", key: "days23" }, { id: "week+", key: "moreWeek" }, { id: "unknown", key: "dontKnow" }];
const photoAreas: { id: PhotoArea; key: TranslationKey; emoji: string }[] = [
  { id: "eyeNose", key: "eyeNose", emoji: "👁️" }, { id: "skin", key: "skin", emoji: "🩹" }, { id: "legHoof", key: "legHoof", emoji: "🦶" },
  { id: "udder", key: "udder", emoji: "🥛" }, { id: "injury", key: "injury", emoji: "🩸" }, { id: "other", key: "other", emoji: "➕" },
];

function stepsFor(mode: Mode): Step[] {
  if (mode === "voice") return ["voice", "animal", "symptoms", "count", "onset", "location", "review"];
  if (mode === "photo") return ["photoArea", "animal", "symptoms", "count", "onset", "location", "review"];
  return ["animal", "symptoms", "count", "onset", "media", "location", "review"];
}

function ReportPage() {
  const { mode: modeParam, animal: animalParam } = Route.useSearch();
  const { t, lang, online, hydrated, addCase } = useApp();
  const navigate = useNavigate();
  const mode: Mode = modeParam ?? "questions";
  const steps = stepsFor(mode);
  const [idx, setIdx] = useState(0);
  const preAnimal = animals.find((a) => a.id === animalParam);
  const [draft, setDraft] = useState<ReportDraft>({
    mode, symptoms: [], species: preAnimal?.species, animalId: preAnimal?.id, location: `${farmer.village}, ${farmer.district}`,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const step = steps[idx]!;
  const patch = (p: Partial<ReportDraft>) => setDraft((d) => ({ ...d, ...p }));

  const filled = (s: Step) =>
    (s === "animal" && !!draft.species) || (s === "symptoms" && draft.symptoms.length > 0) || (s === "count" && !!draft.count) || (s === "onset" && !!draft.onset);

  const next = (skipFilled = false) => {
    let i = idx + 1;
    if (skipFilled) while (i < steps.length - 1 && filled(steps[i]!)) i++;
    setIdx(Math.min(i, steps.length - 1));
  };
  const back = () => (idx === 0 ? navigate({ to: "/" }) : setIdx(idx - 1));
  const goTo = (s: Step) => setIdx(Math.max(0, steps.indexOf(s)));

  const canContinue =
    step === "animal" ? !!draft.species : step === "symptoms" ? draft.symptoms.length > 0 : step === "count" ? !!draft.count : step === "onset" ? !!draft.onset : step === "photoArea" ? !!draft.photo : true;

  const submit = async () => {
    setSubmitting(true); setError(false);
    try {
      const animal = animals.find((a) => a.id === draft.animalId);
      const c: HealthCase = {
        id: `LOCAL-${Date.now()}`,
        animalId: draft.animalId,
        animalName: animal?.name ?? t(speciesList.find((s) => s.id === draft.species)?.key ?? "other"),
        species: draft.species ?? "other",
        symptoms: draft.symptoms,
        count: draft.count ?? "1",
        onset: draft.onset ?? "unknown",
        createdAt: new Date().toISOString(),
        assessment: assessRisk(draft),
        stage: "reported",
        syncState: "pending",
        recovery: [],
        photo: draft.photo,
        location: draft.location,
        mode,
      };
      const saved = await addCase(c);
      navigate({ to: "/assessment/$id", params: { id: saved.id }, replace: true });
    } catch {
      setError(true); setSubmitting(false);
    }
  };

  const titles: Record<Step, [string, string?]> = {
    voice: [t("tellKintsugi"), t("voiceHint")],
    photoArea: [t("whatToShow"), t("photoTip")],
    animal: [t("whichAnimal")],
    symptoms: [t("whatNoticed"), t("selectMany")],
    count: [t("howMany")],
    onset: [t("whenNoticed")],
    media: [t("addPhotoVoice"), t("optionalHelp")],
    location: [t("whereAnimals"), t("detectedAuto")],
    review: [t("checkReport")],
  };

  if (submitting) return <SubmittingScreen offline={!online} />;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 bg-background/90 px-4 pt-3 pb-2 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button onClick={back} className="press -ml-2 flex h-11 items-center gap-1 rounded-full px-3 text-sm font-bold text-muted-foreground hover:bg-secondary">{idx === 0 ? <X className="h-5 w-5" /> : "‹"} {idx === 0 ? t("cancel") : t("back")}</button>
          <span className="text-xs font-bold text-muted-foreground">{t("stepOf", { a: idx + 1, b: steps.length })}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {steps.map((s, i) => <span key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= idx ? "bg-primary" : "bg-secondary")} />)}
        </div>
      </header>

      <div key={step} className="flex-1 px-4 pt-3 pb-36 animate-fade-up">
        {hydrated && !online && idx === 0 && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl bg-attention-soft px-4 py-3 text-sm"><CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-attention" />{t("offlineCanReport")}</div>
        )}
        <h1 className="text-2xl font-extrabold leading-tight">{titles[step][0]}</h1>
        {titles[step][1] && <p className="mt-1 text-sm text-muted-foreground">{titles[step][1]}</p>}

        <div className="mt-5">
          {step === "voice" && <VoiceStep lang={lang} onDone={(text) => { const p = parseSpeech(text); patch({ ...p, symptoms: p.symptoms ?? [], voiceNote: true, voiceTranscript: text }); next(true); }} />}
          {step === "photoArea" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {photoAreas.map((p) => (
                  <button key={p.id} onClick={() => patch({ photoArea: p.id })} className={cn("press flex flex-col items-center gap-2 rounded-2xl border-2 bg-card p-3", draft.photoArea === p.id ? "border-primary bg-primary-soft" : "border-border")}>
                    <span className="text-2xl">{p.emoji}</span><span className="text-xs font-bold">{t(p.key)}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5"><PhotoPicker photo={draft.photo} onChange={(photo) => patch({ photo })} /></div>
            </>
          )}
          {step === "animal" && (
            <div className="space-y-2">
              {animals.map((a) => (
                <ChoiceTile key={a.id} selected={draft.animalId === a.id} onClick={() => patch({ animalId: a.id, species: a.species, count: draft.count ?? "1" })}
                  label={a.name} sub={`${a.id} · ${a.breed}`} icon={<img src={a.photo} alt="" className="h-11 w-11 rounded-xl object-cover" width={44} height={44} />} />
              ))}
              <p className="pt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("other")}</p>
              <div className="grid grid-cols-2 gap-2">
                {speciesList.map((s) => (
                  <ChoiceTile key={s.id} selected={!draft.animalId && draft.species === s.id} onClick={() => patch({ animalId: undefined, species: s.id })} label={t(s.key)} icon={<span>{s.emoji}</span>} />
                ))}
              </div>
            </div>
          )}
          {step === "symptoms" && (
            <div className="grid grid-cols-2 gap-2">
              {symptomList.map((s) => {
                const on = draft.symptoms.includes(s.id);
                return <ChoiceTile key={s.id} selected={on} onClick={() => patch({ symptoms: on ? draft.symptoms.filter((x) => x !== s.id) : [...draft.symptoms, s.id] })} label={t(s.key)} icon={<span>{s.emoji}</span>} />;
              })}
            </div>
          )}
          {step === "count" && (
            <div className="space-y-2">
              {countList.map((c) => <ChoiceTile key={c.id} selected={draft.count === c.id} onClick={() => patch({ count: c.id })} label={c.id === "1" ? t("justOne") : c.id === "10+" ? t("moreThan10") : c.id} />)}
            </div>
          )}
          {step === "onset" && (
            <div className="space-y-2">
              {onsetList.map((o) => <ChoiceTile key={o.id} selected={draft.onset === o.id} onClick={() => patch({ onset: o.id })} label={t(o.key)} />)}
            </div>
          )}
          {step === "media" && (
            <div className="space-y-4">
              <PhotoPicker photo={draft.photo} onChange={(photo) => patch({ photo })} />
              <VoiceStep lang={lang} compact transcript={draft.voiceTranscript} onDone={(text) => { const p = parseSpeech(text); patch({ voiceNote: true, voiceTranscript: text, symptoms: Array.from(new Set([...draft.symptoms, ...(p.symptoms ?? [])])) }); }} onClear={() => patch({ voiceNote: false, voiceTranscript: undefined })} />
            </div>
          )}
          {step === "location" && <LocationStep value={draft.location ?? ""} onChange={(location) => patch({ location })} />}
          {step === "review" && <Review draft={draft} goTo={goTo} error={error} />}
        </div>
      </div>

      {step !== "voice" && (
        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-background via-background to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-6">
          {step === "review" ? (
            <BigButton onClick={submit} icon={online ? Send : CloudOff} variant={online ? "primary" : "amber"}>{online ? t("sendReport") : t("saveOffline")}</BigButton>
          ) : (
            <div className="flex gap-2">
              {(step === "media" || step === "location") && <BigButton variant="secondary" onClick={() => next()} className="w-auto px-6">{t("skip")}</BigButton>}
              <BigButton onClick={() => next()} disabled={!canContinue}>{t("continue")}</BigButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- sub-components ---------- */

function PhotoPicker({ photo, onChange }: { photo?: string; onChange: (p?: string) => void }) {
  const { t } = useApp();
  const camRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const read = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => onChange(String(r.result));
    r.readAsDataURL(f);
  };
  if (photo) {
    return (
      <div className="surface-card overflow-hidden animate-pop">
        <img src={photo} alt={t("photoAdded")} className="h-56 w-full object-cover" />
        <div className="flex items-center justify-between px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-healthy"><Check className="h-4 w-4" />{t("photoAdded")}</span>
          <button onClick={() => onChange(undefined)} className="text-sm font-bold text-urgent">{t("remove")}</button>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => read(e.target.files?.[0])} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => read(e.target.files?.[0])} />
      <button onClick={() => camRef.current?.click()} className="gradient-fresh press flex h-28 flex-col items-center justify-center gap-2 rounded-2xl font-bold text-primary-foreground shadow-cta"><Camera className="h-7 w-7" />{t("takePhoto")}</button>
      <button onClick={() => fileRef.current?.click()} className="press flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sage bg-card font-bold"><ImagePlus className="h-7 w-7 text-primary" />{t("choosePhoto")}</button>
    </div>
  );
}

function VoiceStep({ lang, onDone, compact, transcript, onClear }: { lang: "en" | "hi"; onDone: (text: string) => void; compact?: boolean; transcript?: string; onClear?: () => void }) {
  const { t } = useApp();
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const start = () => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setTyping(true); return; }
    const rec = new SR();
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    let final = "";
    rec.onresult = (e) => {
      let s = "";
      for (let i = 0; i < e.results.length; i++) s += e.results[i]![0]!.transcript;
      final = s; setText(s);
    };
    rec.onend = () => { setListening(false); if (final.trim()) { setText(final); setTyping(true); } };
    rec.onerror = () => { setListening(false); setTyping(true); };
    recRef.current = rec; rec.start(); setListening(true);
  };
  const stop = () => recRef.current?.stop();

  if (compact && transcript) {
    return (
      <div className="surface-card flex items-center gap-3 p-4 animate-pop">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-attention-soft text-attention"><Mic className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1"><p className="text-sm font-bold text-healthy">{t("voiceAdded")}</p><p className="truncate text-sm text-muted-foreground">“{transcript}”</p></div>
        <button onClick={onClear} className="text-sm font-bold text-urgent">{t("remove")}</button>
      </div>
    );
  }

  return (
    <div className={cn(!compact && "flex flex-col items-center")}>
      {!compact && <blockquote className="w-full rounded-2xl bg-attention-soft px-4 py-3 text-sm italic">{t("voiceExample")}</blockquote>}
      {!typing && (
        <div className={cn("flex flex-col items-center", compact ? "surface-card w-full p-4" : "mt-10")}>
          <button onClick={listening ? stop : start} aria-label={listening ? t("tapToStop") : t("tapToSpeak")}
            className={cn("relative flex items-center justify-center rounded-full text-attention-foreground press", compact ? "h-16 w-16" : "h-32 w-32", listening ? "gradient-urgent" : "gradient-amber shadow-warm")}>
            {listening && <span className="absolute inset-0 rounded-full bg-urgent/40 animate-pulse-ring" />}
            {listening ? <Square className={compact ? "h-6 w-6" : "h-10 w-10"} fill="currentColor" /> : <Mic className={compact ? "h-7 w-7" : "h-12 w-12"} />}
          </button>
          <p className="mt-3 font-bold">{listening ? t("listening") : compact ? t("recordVoice") : t("tapToSpeak")}</p>
          {listening && text && <p className="mt-2 text-center text-sm text-muted-foreground">“{text}”</p>}
          {!supported && <p className="mt-2 text-center text-xs text-muted-foreground">{t("voiceUnsupported")}</p>}
          <button onClick={() => setTyping(true)} className="press mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold"><Keyboard className="h-4 w-4" />{t("typeInstead")}</button>
        </div>
      )}
      {typing && (
        <div className="w-full animate-fade-up">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={sampleUtterances[lang]} className="w-full rounded-2xl border-2 border-border bg-card p-4 text-base outline-none focus:border-primary" />
          <div className="mt-2 flex gap-2">
            <button onClick={() => setText(sampleUtterances[lang])} className="press rounded-xl bg-secondary px-3 py-2 text-xs font-bold">{t("voiceExample").slice(0, 24)}…</button>
            <button onClick={() => { setTyping(false); setText(""); }} className="press rounded-xl bg-secondary px-3 py-2 text-xs font-bold">{t("recordVoice")}</button>
          </div>
          <BigButton className="mt-4" disabled={!text.trim()} onClick={() => onDone(text)} variant="amber">{t("continue")}</BigButton>
        </div>
      )}
    </div>
  );
}
interface SpeechRec {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void;
}

function LocationStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useApp();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const locate = () => {
    if (!navigator.geolocation) return;
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { onChange(`${farmer.village}, ${farmer.district} (${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)})`); setBusy(false); },
      () => setBusy(false), { timeout: 6000 },
    );
  };
  return (
    <div className="surface-card overflow-hidden">
      <div className="relative h-40 bg-[radial-gradient(circle_at_50%_50%,oklch(0.9_0.05_150),oklch(0.95_0.02_90))]">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(oklch(0.85_0.03_150)_1px,transparent_1px),linear-gradient(90deg,oklch(0.85_0.03_150)_1px,transparent_1px)] [background-size:24px_24px]" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"><span className="absolute inset-0 -m-3 rounded-full bg-primary/30 animate-pulse-ring" /><MapPin className="relative h-10 w-10 text-primary" fill="currentColor" stroke="white" /></span>
      </div>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("yourLocation")}</p>
        {editing ? (
          <input autoFocus value={value} onChange={(e) => onChange(e.target.value)} onBlur={() => setEditing(false)} className="mt-1 w-full rounded-xl border-2 border-primary bg-card px-3 py-2 text-base outline-none" />
        ) : (
          <p className="mt-1 text-lg font-bold">{value}</p>
        )}
        <div className="mt-3 flex gap-2">
          <button onClick={locate} disabled={busy} className="press inline-flex items-center gap-2 rounded-xl bg-primary-soft px-3.5 py-2.5 text-sm font-bold text-primary disabled:opacity-60"><MapPin className={cn("h-4 w-4", busy && "animate-bounce")} />{t("useMyLocation")}</button>
          <button onClick={() => setEditing(true)} className="press inline-flex items-center gap-2 rounded-xl bg-secondary px-3.5 py-2.5 text-sm font-bold"><Pencil className="h-4 w-4" />{t("changeLocation")}</button>
        </div>
      </div>
    </div>
  );
}

function Review({ draft, goTo, error }: { draft: ReportDraft; goTo: (s: Step) => void; error: boolean }) {
  const { t } = useApp();
  const animal = animals.find((a) => a.id === draft.animalId);
  const sp = speciesList.find((s) => s.id === draft.species);
  const Row = ({ label, value, step, children }: { label: string; value?: string; step: Step; children?: ReactNode }) => (
    <div className="flex items-start gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        {value && <p className="mt-0.5 font-bold">{value}</p>}
        {children}
      </div>
      <button onClick={() => goTo(step)} className="press inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-primary"><Pencil className="h-3.5 w-3.5" />{t("edit")}</button>
    </div>
  );
  return (
    <div>
      {error && <div className="mb-3 rounded-2xl bg-urgent-soft px-4 py-3 text-sm font-semibold text-urgent">{t("errorTitle")} — {t("errorSub")}</div>}
      <div className="surface-card divide-y divide-border">
        <Row label={t("animal")} value={animal ? `${animal.name} (${animal.id})` : sp ? `${sp.emoji} ${t(sp.key)}` : t("none")} step="animal" />
        <Row label={t("problem")} step="symptoms">
          <div className="mt-1 flex flex-wrap gap-1.5">{draft.symptoms.map((s) => { const m = symptomList.find((x) => x.id === s)!; return <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold">{m.emoji} {t(m.key)}</span>; })}</div>
        </Row>
        <Row label={t("affected")} value={draft.count === "1" ? t("justOne") : draft.count === "10+" ? t("moreThan10") : draft.count ?? t("none")} step="count" />
        <Row label={t("started")} value={t(onsetList.find((o) => o.id === draft.onset)?.key ?? "dontKnow")} step="onset" />
        <Row label={t("location")} value={draft.location} step="location" />
        <Row label={t("attachments")} step={draft.mode === "questions" ? "media" : draft.mode === "photo" ? "photoArea" : "voice"}>
          <div className="mt-1.5 flex items-center gap-2">
            {draft.photo && <img src={draft.photo} alt="" className="h-12 w-12 rounded-lg object-cover" />}
            {draft.voiceTranscript && <span className="inline-flex items-center gap-1 rounded-full bg-attention-soft px-2.5 py-1 text-xs font-bold"><Mic className="h-3 w-3" />{t("voiceAdded")}</span>}
            {!draft.photo && !draft.voiceTranscript && <span className="text-sm text-muted-foreground">{t("none")}</span>}
          </div>
        </Row>
      </div>
      <Disclaimer text={t("notDiagnosis")} />
    </div>
  );
}

function SubmittingScreen({ offline }: { offline: boolean }) {
  const { t } = useApp();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
        <span className="gradient-fresh flex h-20 w-20 items-center justify-center rounded-full text-primary-foreground shadow-cta">{offline ? <CloudOff className="h-9 w-9" /> : <Send className="h-9 w-9" />}</span>
      </div>
      <p className="mt-6 text-lg font-extrabold">{offline ? t("savedOffline") : t("submitting")}</p>
      {offline && <p className="mt-1 text-sm text-muted-foreground">{t("savedOfflineSub")}</p>}
    </div>
  );
}
