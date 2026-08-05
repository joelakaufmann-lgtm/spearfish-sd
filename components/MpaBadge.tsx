import type { MpaStatus } from "@/lib/spots";

export function MpaBadge({ mpa }: { mpa: MpaStatus }) {
  if (mpa.kind === "legal") return null;
  const isProhibited = mpa.kind === "prohibited";
  return (
    <div
      className={`mt-2 rounded-md border px-3 py-2 text-xs ${
        isProhibited
          ? "border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
      }`}
    >
      <span className="font-semibold">{isProhibited ? "MPA — No Take: " : "MPA — Restricted: "}</span>
      {mpa.note}
    </div>
  );
}
