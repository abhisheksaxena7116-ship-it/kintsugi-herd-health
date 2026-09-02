export type Species = "cow" | "buffalo" | "goat" | "sheep" | "poultry" | "multiple" | "other";
export type HealthStatus = "healthy" | "attention" | "care";
export type SymptomId =
  | "fever" | "notEating" | "weakness" | "breathing" | "coughing"
  | "looseMotion" | "walking" | "discharge" | "bleeding" | "other";
export type CountBand = "1" | "2-5" | "6-10" | "10+";
export type Onset = "today" | "yesterday" | "2-3d" | "week+" | "unknown";
export type PhotoArea = "eyeNose" | "skin" | "legHoof" | "udder" | "injury" | "other";

export interface Vaccination {
  id: string;
  name: string;
  dueDate?: string;      // ISO
  givenDate?: string;    // ISO
  status: "due" | "done" | "overdue";
}

export interface MovementEntry {
  id: string;
  place: string;
  placeKey: "farm" | "grazing" | "waterPoint" | "market" | "otherFarm" | "vetClinic";
  from: string; // HH:mm
  to?: string;
  date: string; // ISO date
}

export interface HistoryEntry {
  id: string;
  date: string;
  title: string;
  detail?: string;
  kind: "report" | "treatment" | "visit" | "note";
}

export interface Animal {
  id: string;           // KC-00124
  name: string;
  species: Species;
  breed: string;
  gender: "female" | "male";
  ageYears: number;
  status: HealthStatus;
  statusNote?: string;  // e.g. "Reduced appetite"
  photo: string;
  vaccinations: Vaccination[];
  movement: MovementEntry[];
  history: HistoryEntry[];
  activeCaseId?: string;
}

export interface ReportDraft {
  species?: Species;
  animalId?: string;
  symptoms: SymptomId[];
  count?: CountBand;
  onset?: Onset;
  photo?: string;       // data url
  photoArea?: PhotoArea;
  voiceNote?: boolean;
  voiceTranscript?: string;
  location?: string;
  mode: "questions" | "voice" | "photo";
}

export interface RiskAssessment {
  score: number;              // 0-100
  level: "high" | "medium" | "low";
  reasons: string[];          // translation-ready plain reasons
}

export type CaseStage =
  | "reported" | "assessed" | "vetNotified" | "vetVisit" | "treatment" | "followUp" | "resolved";

export interface RecoveryUpdate {
  id: string;
  date: string;
  overall: "better" | "same" | "worse";
  eating: "normal" | "less" | "none";
  activity: "normal" | "less" | "veryWeak";
}

export interface ExposureRecord {
  places: MovementEntry["placeKey"][];
  companions: { cows: number; buffaloes: number; goats: number };
  createdAt: string;
}

export interface HealthCase {
  id: string;                 // PH-1024
  animalId?: string;
  animalName: string;
  species: Species;
  symptoms: SymptomId[];
  count: CountBand;
  onset: Onset;
  createdAt: string;
  assessment: RiskAssessment;
  stage: CaseStage;
  syncState: "synced" | "pending" | "syncing" | "failed";
  vetEta?: string;
  vetInstructions?: string[];
  recovery: RecoveryUpdate[];
  exposure?: ExposureRecord;
  photo?: string;
  location?: string;
  mode: ReportDraft["mode"];
}

export interface AreaAlert {
  id: string;
  category: "urgent" | "health" | "vaccination" | "prevention";
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  date: string;
  signs?: SymptomId[];
  precautions?: { en: string; hi: string }[];
  nearbyReports?: number;
}

export interface FirstAidTopic {
  id: string;
  title: string;
  titleHi: string;
  urgent: boolean;
  icon: string;
  doSteps: { en: string; hi: string }[];
  avoid: { en: string; hi: string }[];
  approvedBy: string;
  version: string;
}

export interface Vet {
  id: string;
  name: string;
  role: string;
  roleHi: string;
  phone: string;
  availability: "available" | "busy";
  photoInitials: string;
  activeCases: number;
}

export interface Hospital {
  name: string;
  nameHi: string;
  distanceKm: number;
  open: boolean;
  phone: string;
  hours: string;
}

export interface VaccinationCamp {
  location: string;
  locationHi: string;
  date: string;
  time: string;
  verified: boolean;
}
