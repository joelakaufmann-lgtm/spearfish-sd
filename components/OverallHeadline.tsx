import type { Verdict } from "@/lib/verdict";

const TONE_CLS: Record<Verdict, string> = {
  go: "text-emerald-600 dark:text-emerald-400",
  caution: "text-amber-600 dark:text-amber-400",
  "no-go": "text-red-600 dark:text-red-400",
};

export function OverallHeadline({
  answer,
  detail,
  tone,
  generatedAt,
  dayLabel,
}: {
  answer: string;
  detail: string;
  tone: Verdict;
  generatedAt: string;
  dayLabel?: string | null;
}) {
  const asOf = new Date(generatedAt).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <section className="py-8 text-center">
      <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Should I spearfish in San Diego{dayLabel ? ` on ${dayLabel}` : ""}?
      </p>
      <h1 className={`mt-2 text-6xl font-black ${TONE_CLS[tone]}`}>{answer}</h1>
      <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">{detail}</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Data as of {asOf} PT</p>
    </section>
  );
}
