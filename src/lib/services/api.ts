/**
 * Mock REST service layer.
 * Every function mirrors a future real endpoint so the UI can switch
 * to fetch() calls without changing components.
 */
import { alerts, areaStatus, hospital, vaccinationCamp, vets } from "../mock/data";
import type { HealthCase } from "../types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let counter = 1025;

export const api = {
  /** POST /reports — returns server-assigned id and vet ETA. */
  async submitReport(c: HealthCase): Promise<{ id: string; vetEta: string }> {
    await delay(900 + Math.random() * 600);
    const id = c.id.startsWith("LOCAL-") ? `PH-${counter++}` : c.id;
    return { id, vetEta: c.assessment.level === "high" ? "2–4 hours" : c.assessment.level === "medium" ? "Today" : "1–2 days" };
  },
  /** GET /alerts */
  async getAlerts() {
    await delay(500);
    return alerts;
  },
  /** GET /area-status */
  async getAreaStatus() {
    await delay(400);
    return areaStatus;
  },
  /** GET /vets/nearby */
  async getVetHelp() {
    await delay(600);
    return { vets, hospital };
  },
  /** GET /vaccination-camps */
  async getCamps() {
    await delay(400);
    return [vaccinationCamp];
  },
  /** POST /cases/:id/recovery */
  async submitRecovery() {
    await delay(700);
    return { ok: true };
  },
  /** POST /cases/:id/exposure */
  async submitExposure() {
    await delay(700);
    return { ok: true };
  },
};
