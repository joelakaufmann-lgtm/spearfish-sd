import type { Verdict } from "@/lib/verdict";

const STYLES: Record<Verdict | "prohibited", { label: string; cls: string }> = {
  go: { label: "Go", cls: "bg-emerald-500 text-white" },
  caution: { label: "Caution", cls: "bg-amber-500 text-white" },
  "no-go": { label: "No-Go", cls: "bg-red-600 text-white" },
  prohibited: { label: "Prohibited", cls: "bg-gray-500 text-white" },
};

export function VerdictBadge({ verdict, prohibited }: { verdict: Verdict; prohibited?: boolean }) {
  const s = STYLES[prohibited ? "prohibited" : verdict];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}
