import type { CountBand, Onset, ReportDraft, RiskAssessment, SymptomId } from "./types";

/**
 * Priority / risk assessment.
 * This is intentionally a transparent rules engine (not a diagnosis):
 * it estimates urgency so a veterinarian can be prioritised.
 * Replace with a server-side model later without changing the UI contract.
 */
const symptomWeight: Record<SymptomId, number> = {
  bleeding: 30,
  breathing: 28,
  fever: 18,
  weakness: 14,
  notEating: 12,
  discharge: 10,
  coughing: 10,
  looseMotion: 10,
  walking: 8,
  other: 4,
};

const countWeight: Record<CountBand, number> = { "1": 0, "2-5": 12, "6-10": 22, "10+": 30 };
const onsetWeight: Record<Onset, number> = { today: 10, yesterday: 8, "2-3d": 6, "week+": 3, unknown: 4 };

export function assessRisk(draft: Pick<ReportDraft, "symptoms" | "count" | "onset">): RiskAssessment {
  const symptoms = draft.symptoms ?? [];
  const count = draft.count ?? "1";
  const onset = draft.onset ?? "unknown";

  let score = 8;
  const reasons: string[] = [];

  const sorted = [...symptoms].sort((a, b) => symptomWeight[b] - symptomWeight[a]);
  sorted.forEach((s, i) => {
    // diminishing returns for many symptoms
    score += symptomWeight[s] * (i === 0 ? 1 : i === 1 ? 0.7 : 0.4);
  });
  score += countWeight[count];
  score += onsetWeight[onset];

  // Combinations that suggest fast spread / severity
  if (symptoms.includes("fever") && symptoms.includes("breathing")) score += 8;
  if (count !== "1" && symptoms.includes("fever")) score += 6;

  score = Math.max(5, Math.min(98, Math.round(score)));
  const level: RiskAssessment["level"] = score >= 65 ? "high" : score >= 35 ? "medium" : "low";

  if (count !== "1") reasons.push(`reason.count.${count}`);
  sorted.slice(0, 3).forEach((s) => reasons.push(`reason.symptom.${s}`));
  reasons.push(`reason.onset.${onset}`);

  return { score, level, reasons };
}

export function reasonLabel(code: string, lang: "en" | "hi"): string {
  const [, kind, val] = code.split(".");
  const en: Record<string, string> = {
    "count.2-5": "2–5 animals affected",
    "count.6-10": "6–10 animals affected",
    "count.10+": "More than 10 animals affected",
    "symptom.fever": "Fever reported",
    "symptom.breathing": "Breathing difficulty",
    "symptom.bleeding": "Bleeding reported",
    "symptom.weakness": "Weakness reported",
    "symptom.notEating": "Not eating",
    "symptom.coughing": "Coughing",
    "symptom.looseMotion": "Loose motion",
    "symptom.walking": "Difficulty walking",
    "symptom.discharge": "Eye/nose discharge",
    "symptom.other": "Other signs reported",
    "onset.today": "Symptoms started today",
    "onset.yesterday": "Symptoms started yesterday",
    "onset.2-3d": "Symptoms for 2–3 days",
    "onset.week+": "Symptoms for over a week",
    "onset.unknown": "Onset unknown",
  };
  const hi: Record<string, string> = {
    "count.2-5": "2–5 पशु प्रभावित",
    "count.6-10": "6–10 पशु प्रभावित",
    "count.10+": "10 से ज़्यादा पशु प्रभावित",
    "symptom.fever": "बुखार बताया गया",
    "symptom.breathing": "सांस लेने में तकलीफ़",
    "symptom.bleeding": "खून बहना",
    "symptom.weakness": "कमज़ोरी",
    "symptom.notEating": "खाना नहीं खा रहा",
    "symptom.coughing": "खांसी",
    "symptom.looseMotion": "दस्त",
    "symptom.walking": "चलने में दिक्कत",
    "symptom.discharge": "आंख/नाक बहना",
    "symptom.other": "अन्य लक्षण",
    "onset.today": "लक्षण आज शुरू हुए",
    "onset.yesterday": "लक्षण कल शुरू हुए",
    "onset.2-3d": "लक्षण 2–3 दिन से",
    "onset.week+": "लक्षण एक हफ़्ते से ज़्यादा",
    "onset.unknown": "शुरुआत पता नहीं",
  };
  const key = `${kind}.${val}`;
  return (lang === "hi" ? hi : en)[key] ?? code;
}
