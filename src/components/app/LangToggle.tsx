import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useApp();
  return (
    <div className={cn("inline-flex rounded-full bg-secondary p-1", className)} role="group" aria-label="Language">
      {(["en", "hi"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cn("press rounded-full px-3 py-1.5 text-xs font-bold transition-colors", lang === l ? "bg-card text-primary shadow-card" : "text-muted-foreground")}>
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
}
