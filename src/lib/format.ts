export function daysUntil(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const target = Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  const n = new Date();
  const today = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.round((target - today) / 86400000);
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
