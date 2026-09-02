import type { Onset, ReportDraft, Species, SymptomId } from "./types";

/**
 * Converts free speech (Hindi / English / Hinglish) into a structured report draft.
 * Keyword-based for offline use; can be swapped for a server NLU later.
 */
const speciesWords: Record<Species, string[]> = {
  cow: ["cow", "cows", "gaay", "gai", "gay", "गाय", "बछड़ा", "calf"],
  buffalo: ["buffalo", "buffaloes", "bhains", "bhais", "भैंस"],
  goat: ["goat", "goats", "bakri", "bakra", "बकरी", "बकरा"],
  sheep: ["sheep", "bhed", "भेड़"],
  poultry: ["hen", "hens", "chicken", "poultry", "murgi", "मुर्गी", "मुर्गा"],
  multiple: ["all animals", "many animals", "herd", "sab", "सब पशु", "सारे"],
  other: [],
};

const symptomWords: Record<SymptomId, string[]> = {
  fever: ["fever", "hot", "bukhar", "बुखार", "गर्म", "temperature"],
  notEating: ["not eating", "not eat", "stopped eating", "khana nahi", "kha nahi", "खाना नहीं", "नहीं खा", "appetite", "chara nahi"],
  weakness: ["weak", "weakness", "kamzor", "कमज़ोर", "कमजोर", "tired", "lying down", "sust", "सुस्त"],
  breathing: ["breath", "breathing", "saans", "sans", "सांस", "साँस", "panting"],
  coughing: ["cough", "coughing", "khansi", "खांसी", "खाँसी"],
  looseMotion: ["loose motion", "diarrhoea", "diarrhea", "dast", "दस्त", "पतला"],
  walking: ["limp", "limping", "walk", "chal nahi", "चल नहीं", "लंगड़ा", "lame", "खुर"],
  discharge: ["discharge", "nose running", "eyes water", "naak", "नाक बह", "आंख बह", "आँख", "pani aa raha"],
  bleeding: ["bleed", "bleeding", "blood", "khoon", "khun", "खून"],
  other: [],
};

const onsetWords: Record<Onset, string[]> = {
  today: ["today", "aaj", "आज", "since morning", "subah se", "सुबह से"],
  yesterday: ["yesterday", "kal se", "kal", "कल"],
  "2-3d": ["2 days", "two days", "3 days", "three days", "do din", "teen din", "दो दिन", "तीन दिन", "2 din", "3 din"],
  "week+": ["week", "hafte", "हफ़्ते", "हफ्ते", "10 days", "das din"],
  unknown: [],
};

function has(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

export function parseSpeech(input: string): Partial<ReportDraft> & { count?: ReportDraft["count"] } {
  const text = input.toLowerCase();
  const out: Partial<ReportDraft> = { symptoms: [] };

  for (const [sp, words] of Object.entries(speciesWords) as [Species, string[]][]) {
    if (has(text, words)) { out.species = sp; break; }
  }
  for (const [sym, words] of Object.entries(symptomWords) as [SymptomId, string[]][]) {
    if (has(text, words)) out.symptoms!.push(sym);
  }
  for (const [on, words] of Object.entries(onsetWords) as [Onset, string[]][]) {
    if (has(text, words)) { out.onset = on; break; }
  }

  const numMatch = text.match(/(\d+)\s*(cows?|buffalo|goats?|animals?|गाय|भैंस|बकरी|पशु)/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    out.count = n <= 1 ? "1" : n <= 5 ? "2-5" : n <= 10 ? "6-10" : "10+";
  } else if (has(text, ["many", "several", "kai", "कई", "sab", "सब"])) {
    out.count = "6-10";
  } else if (out.species && out.species !== "multiple") {
    out.count = "1";
  }

  return out;
}

export const sampleUtterances = {
  en: "My cow has not been eating since yesterday and she looks weak.",
  hi: "मेरी गाय कल से खाना नहीं खा रही और कमज़ोर लग रही है।",
};
