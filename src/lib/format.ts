export function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export function formatDate(iso: string, lang: "en" | "hi" = "en") {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatShortDate(iso: string, lang: "en" | "hi" = "en") {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" });
}

export function timeAgo(iso: string, lang: "en" | "hi" = "en") {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return lang === "hi" ? "अभी" : "Just now";
  if (h < 24) return lang === "hi" ? `${h} घंटे पहले` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return lang === "hi" ? `${d} दिन पहले` : `${d}d ago`;
}
