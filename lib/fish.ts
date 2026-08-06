/**
 * Species, limits, and seasonal expectations for San Diego spearfishing.
 * Distilled from outputs/san-diego-spearfishing-spots-and-regulations-2026.md
 * (2026 CDFW rules snapshot — verify live regs before taking game).
 */

export interface Species {
  key: string;
  name: string;
  bag: string; // daily bag summary
  size: string; // minimum size summary
  /** Months (1-12) when the species is a realistic target in SD waters */
  months: number[];
}

const ALL_YEAR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SUMMER_FALL = [6, 7, 8, 9, 10, 11];

export const SPECIES: Record<string, Species> = {
  "kelp-bass": {
    key: "kelp-bass",
    name: "Kelp & sand bass",
    bag: "5 combined (max 4 barred)",
    size: "14 in",
    months: ALL_YEAR,
  },
  sheephead: {
    key: "sheephead",
    name: "Sheephead",
    bag: "2",
    size: "12 in",
    months: ALL_YEAR,
  },
  "white-seabass": {
    key: "white-seabass",
    name: "White seabass",
    bag: "3 (1 during Mar 15–Jun 15)",
    size: "28 in",
    months: [3, 4, 5, 6, 7, 8, 9],
  },
  yellowtail: {
    key: "yellowtail",
    name: "Yellowtail",
    bag: "10",
    size: "24 in fork",
    months: SUMMER_FALL,
  },
  "ca-halibut": {
    key: "ca-halibut",
    name: "California halibut",
    bag: "5",
    size: "22 in",
    months: [2, 3, 4, 5, 6, 7, 8, 9],
  },
  whitefish: {
    key: "whitefish",
    name: "Ocean whitefish",
    bag: "10",
    size: "none",
    months: ALL_YEAR,
  },
  "rockfish-complex": {
    key: "rockfish-complex",
    name: "Rockfish / cabezon / greenling",
    bag: "10 combined",
    size: "none",
    months: ALL_YEAR,
  },
  lingcod: {
    key: "lingcod",
    name: "Lingcod",
    bag: "2",
    size: "22 in",
    months: ALL_YEAR,
  },
  scorpionfish: {
    key: "scorpionfish",
    name: "Scorpionfish",
    bag: "5",
    size: "none",
    months: ALL_YEAR,
  },
  barracuda: {
    key: "barracuda",
    name: "Barracuda",
    bag: "10",
    size: "28 in",
    months: SUMMER_FALL,
  },
  bonito: {
    key: "bonito",
    name: "Pacific bonito",
    bag: "10",
    size: "24 in fork / 5 lb",
    months: SUMMER_FALL,
  },
};

export interface FishNow {
  species: Species;
  likelyNow: boolean;
}

/** Species report for a spot: which of its targets are realistic this month. */
export function fishForSpot(targets: string[] | undefined, month: number): FishNow[] {
  if (!targets?.length) return [];
  return targets
    .map((key) => SPECIES[key])
    .filter((s): s is Species => Boolean(s))
    .map((species) => ({ species, likelyNow: species.months.includes(month) }))
    .sort((a, b) => Number(b.likelyNow) - Number(a.likelyNow));
}

function inWindow(month: number, day: number, from: [number, number], to: [number, number]): boolean {
  const v = month * 100 + day;
  const a = from[0] * 100 + from[1];
  const b = to[0] * 100 + to[1];
  return a <= b ? v >= a && v <= b : v >= a || v <= b;
}

/** County-wide seasonal regulation notes for the current date. */
export function seasonNotes(month: number, day: number): string[] {
  const notes: string[] = [];

  notes.push(
    inWindow(month, day, [3, 15], [6, 15])
      ? "White seabass: reduced limit of 1 fish (Mar 15–Jun 15)."
      : "White seabass: 3-fish limit in effect."
  );

  notes.push(
    inWindow(month, day, [4, 1], [12, 31])
      ? "Pacific halibut season open (1 fish, through Dec 31 unless closed early)."
      : "Pacific halibut season closed (opens Apr 1)."
  );

  notes.push(
    inWindow(month, day, [10, 2], [3, 17])
      ? "Lobster season OPEN — hand take only (never spear), report card + 3.25 in gauge required."
      : "Lobster season closed (2026–27 season opens Oct 2 at 6 pm)."
  );

  return notes;
}
