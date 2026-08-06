import Link from "next/link";
import { selectableDays } from "@/lib/dates";

export function DaySelector({ selected }: { selected: string }) {
  return (
    <nav aria-label="Choose a day" className="flex flex-wrap gap-1.5">
      {selectableDays().map((d) => {
        const active = d.date === selected;
        return (
          <Link
            key={d.date}
            href={d.isToday ? "/" : `/?date=${d.date}`}
            prefetch={false}
            aria-current={active ? "date" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sky-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {d.label}
          </Link>
        );
      })}
    </nav>
  );
}
