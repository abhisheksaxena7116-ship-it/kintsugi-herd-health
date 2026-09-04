import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { toast } from "sonner";
import { languages, type LanguageCode, type TranslationKey } from "@/i18n/translations";
import { db, localKv } from "./offline/db";
import { api } from "./services/api";
import { seedCases } from "./mock/data";
import type { ExposureRecord, HealthCase, RecoveryUpdate } from "./types";

type Vars = Record<string, string | number>;

interface AppState {
  hydrated: boolean;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
  /** true when browser online AND not simulating offline */
  online: boolean;
  simulateOffline: boolean;
  setSimulateOffline: (v: boolean) => void;
  cases: HealthCase[];
  pendingCount: number;
  syncing: boolean;
  addCase: (c: HealthCase) => Promise<HealthCase>;
  updateCase: (id: string, patch: Partial<HealthCase>) => void;
  findCase: (id: string) => HealthCase | undefined;
  syncNow: () => Promise<void>;
  addRecovery: (id: string, r: RecoveryUpdate) => void;
  setExposure: (id: string, e: ExposureRecord) => void;
  checklist: Record<string, boolean>;
  toggleChecklist: (id: string) => void;
  reminders: string[];
  toggleReminder: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLangState] = useState<LanguageCode>("en");
  const [browserOnline, setBrowserOnline] = useState(true);
  const [simulateOffline, setSimulateOfflineState] = useState(false);
  const [cases, setCases] = useState<HealthCase[]>(seedCases);
  const [syncing, setSyncing] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [reminders, setReminders] = useState<string[]>([]);
  const casesRef = useRef(cases);
  casesRef.current = cases;

  // Hydrate persisted state (client only)
  useEffect(() => {
    let alive = true;
    (async () => {
      const l = localKv.get<LanguageCode>("lang", "en");
      const sim = localKv.get<boolean>("simOffline", false);
      const today = new Date().toISOString().slice(0, 10);
      const chk = localKv.get<{ date: string; items: Record<string, boolean> }>("checklist", { date: today, items: {} });
      const rem = localKv.get<string[]>("reminders", []);
      let stored = await db.getAll<HealthCase>("cases");
      if (!stored || stored.length === 0) stored = localKv.get<HealthCase[]>("cases", []);
      if (!alive) return;
      setLangState(l);
      setSimulateOfflineState(sim);
      setChecklist(chk.date === today ? chk.items : {});
      setReminders(rem);
      if (stored && stored.length) {
        const merged = [...stored];
        for (const s of seedCases) if (!merged.some((c) => c.id === s.id)) merged.push(s);
        setCases(merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      }
      setBrowserOnline(navigator.onLine);
      setHydrated(true);
    })();
    const on = () => setBrowserOnline(true);
    const off = () => setBrowserOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { alive = false; window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const persistCases = useCallback((next: HealthCase[]) => {
    localKv.set("cases", next);
    next.forEach((c) => void db.put("cases", c));
  }, []);

  const setLang = useCallback((l: LanguageCode) => { setLangState(l); localKv.set("lang", l); }, []);
  const setSimulateOffline = useCallback((v: boolean) => { setSimulateOfflineState(v); localKv.set("simOffline", v); }, []);

  const dict = languages[lang].dict;
  const t = useCallback((key: TranslationKey, vars?: Vars) => {
    let s = dict[key] ?? languages.en.dict[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  }, [dict]);

  const online = browserOnline && !simulateOffline;

  const mutateCases = useCallback((fn: (prev: HealthCase[]) => HealthCase[]) => {
    setCases((prev) => { const next = fn(prev); persistCases(next); return next; });
  }, [persistCases]);

  const findCase = useCallback((id: string) => casesRef.current.find((c) => c.id === id || c.localId === id), []);

  const updateCase = useCallback((id: string, patch: Partial<HealthCase>) => {
    mutateCases((prev) => prev.map((c) => (c.id === id || c.localId === id ? { ...c, ...patch } : c)));
  }, [mutateCases]);

  const addRecovery = useCallback((id: string, r: RecoveryUpdate) => {
    mutateCases((prev) => prev.map((c) => (c.id === id || c.localId === id ? { ...c, recovery: [r, ...c.recovery] } : c)));
  }, [mutateCases]);

  const setExposure = useCallback((id: string, e: ExposureRecord) => updateCase(id, { exposure: e }), [updateCase]);

  const syncNow = useCallback(async () => {
    const pending = casesRef.current.filter((c) => c.syncState === "pending" || c.syncState === "failed");
    if (!pending.length || syncing) return;
    setSyncing(true);
    mutateCases((prev) => prev.map((c) => (pending.some((p) => p.id === c.id) ? { ...c, syncState: "syncing" } : c)));
    let ok = 0;
    for (const p of pending) {
      try {
        const res = await api.submitReport(p);
        mutateCases((prev) => prev.map((c) => (c.id === p.id ? {
          ...c, id: res.id, localId: p.id, syncState: "synced", vetEta: res.vetEta,
          stage: c.stage === "reported" ? "vetNotified" : c.stage,
        } : c)));
        ok++;
      } catch {
        mutateCases((prev) => prev.map((c) => (c.id === p.id ? { ...c, syncState: "failed" } : c)));
      }
    }
    setSyncing(false);
    if (ok) toast.success(t("allSynced"));
  }, [mutateCases, syncing, t]);

  const addCase = useCallback(async (c: HealthCase) => {
    const online = (typeof navigator === "undefined" ? true : navigator.onLine) && !simulateOffline;
    if (!online) {
      const saved: HealthCase = { ...c, syncState: "pending" };
      mutateCases((prev) => [saved, ...prev]);
      return saved;
    }
    const res = await api.submitReport(c);
    const saved: HealthCase = { ...c, id: res.id, localId: c.id, syncState: "synced", vetEta: res.vetEta, stage: "vetNotified" };
    mutateCases((prev) => [saved, ...prev]);
    return saved;
  }, [mutateCases, simulateOffline]);

  // Auto-sync when network returns
  const prevOnline = useRef(online);
  useEffect(() => {
    if (hydrated && online && !prevOnline.current) {
      toast(t("backOnline"));
      void syncNow();
    }
    prevOnline.current = online;
  }, [online, hydrated, syncNow, t]);

  const toggleChecklist = useCallback((id: string) => {
    setChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localKv.set("checklist", { date: new Date().toISOString().slice(0, 10), items: next });
      return next;
    });
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localKv.set("reminders", next);
      return next;
    });
  }, []);

  const pendingCount = cases.filter((c) => c.syncState !== "synced").length;

  const value = useMemo<AppState>(() => ({
    hydrated, lang, setLang, t, online, simulateOffline, setSimulateOffline, cases, pendingCount, syncing,
    addCase, updateCase, findCase, syncNow, addRecovery, setExposure, checklist, toggleChecklist, reminders, toggleReminder,
  }), [hydrated, lang, setLang, t, online, simulateOffline, setSimulateOffline, cases, pendingCount, syncing,
    addCase, updateCase, findCase, syncNow, addRecovery, setExposure, checklist, toggleChecklist, reminders, toggleReminder]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}

/** Simulates a network fetch that fails when offline, for loading/error/offline states. */
export function useRemote<T>(fn: () => Promise<T>, online: boolean, deps: unknown[] = []) {
  const [state, setState] = useState<{ status: "loading" | "ok" | "error" | "offline"; data?: T }>({ status: "loading" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, status: "loading" }));
    fn().then((data) => {
      if (!alive) return;
      setState({ status: online ? "ok" : "offline", data });
    }).catch(() => alive && setState({ status: "error" }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, tick, ...deps]);
  return { ...state, retry: () => setTick((x) => x + 1) };
}
