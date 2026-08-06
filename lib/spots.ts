export type MpaStatus =
  | { kind: "legal" }
  | { kind: "prohibited"; note: string }
  | { kind: "restricted"; note: string };

export type TideStation = "9410170" | "9410230";

export interface Spot {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  tideStation: TideStation;
  mpa: MpaStatus;
  /** Substrings matched (case-insensitively, both directions) against Coastkeeper site names */
  advisoryMatchNames: string[];
  entryNotes: string;
  /** Species keys from lib/fish.ts that are realistic targets here */
  targets?: string[];
  chronicAdvisory?: boolean;
}

export const TIDE_STATIONS: Record<TideStation, string> = {
  "9410170": "San Diego Bay",
  "9410230": "Scripps Pier",
};

/**
 * Curated from outputs/san-diego-spearfishing-spots-and-regulations-2026.md.
 * Boundary coordinates and local ordinances are as of that Aug 2026 snapshot —
 * verify on the live CDFW map before every dive.
 */
export const SPOTS: Spot[] = [
  {
    name: "Oceanside / Carlsbad Open Coast",
    slug: "oceanside",
    lat: 33.16,
    lon: -117.36,
    tideStation: "9410230",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["oceanside", "carlsbad", "buena vista"],
    entryNotes:
      "Open coast with kelp, reef, and sand corridors — boat or kayak reaches the best structure. Never swim the harbor entrance. Carlsbad's projectile-weapon ordinance makes shore speargun use there uncertain: confirm with lifeguards first.",
    targets: [
      "kelp-bass",
      "sheephead",
      "ca-halibut",
      "whitefish",
      "rockfish-complex",
      "white-seabass",
      "yellowtail",
      "bonito",
      "barracuda",
    ],
  },
  {
    name: "Leucadia / Encinitas (north of Swami's)",
    slug: "encinitas",
    lat: 33.06,
    lon: -117.31,
    tideStation: "9410230",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["encinitas", "leucadia", "moonlight beach"],
    entryNotes:
      "Reef, kelp, and sand north of Swami's SMCA — the boundary hits the shore at 33°02.900′ N; keep a conservative buffer. Encinitas law: no armed speargun within 100 ft of another person.",
    targets: [
      "kelp-bass",
      "sheephead",
      "ca-halibut",
      "whitefish",
      "rockfish-complex",
      "white-seabass",
      "yellowtail",
      "bonito",
      "barracuda",
    ],
  },
  {
    name: "Swami's SMCA (pelagics only)",
    slug: "swamis",
    lat: 33.034,
    lon: -117.293,
    tideStation: "9410230",
    mpa: {
      kind: "restricted",
      note: "Only white seabass and specified pelagic finfish may be speared here — no bass, sheephead, halibut, rockfish, lobster, or other reef take. The only San Diego MPA allowing any spearfishing.",
    },
    advisoryMatchNames: ["swami", "cardiff", "san elijo"],
    entryNotes:
      "Specialist option: enter only with a deliberate pelagic-only plan and strong species ID. Boundary runs 33°02.900′ N to 33°00.000′ N and extends well offshore.",
    targets: ["white-seabass", "yellowtail", "bonito", "barracuda"],
  },
  {
    name: "Del Mar / Torrey Pines / Black's",
    slug: "torrey-pines",
    lat: 32.9,
    lon: -117.26,
    tideStation: "9410230",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["torrey pines", "black's beach", "blacks beach", "del mar"],
    entryNotes:
      "Halibut-oriented sand edges and scattered reef. Scripps SMCA begins at 32°53.000′ N — a small navigation error puts you inside it. Unstable 300-ft bluffs, long tide-sensitive exits: advanced shore access.",
    targets: ["ca-halibut", "kelp-bass", "sheephead", "whitefish", "white-seabass", "yellowtail"],
  },
  {
    name: "La Jolla Cove / Shores",
    slug: "la-jolla-cove",
    lat: 32.8503,
    lon: -117.2721,
    tideStation: "9410230",
    mpa: {
      kind: "prohibited",
      note: "Matlahuayl SMR and San Diego-Scripps Coastal SMCA — no take of any kind. Point La Jolla and Boomer Beach are also under a year-round public access closure.",
    },
    advisoryMatchNames: ["la jolla cove", "la jolla shores"],
    entryNotes: "No-take marine reserve. Dive it for fun, leave the speargun home.",
  },
  {
    name: "La Jolla Open Corridor (Marine St / Windansea)",
    slug: "la-jolla-corridor",
    lat: 32.833,
    lon: -117.281,
    tideStation: "9410230",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["windansea", "marine street", "children's pool", "childrens pool"],
    entryNotes:
      "The best all-around shore option: kelp, reef, ledges, and sand in the narrow open gap between Matlahuayl SMR (32°51.067′ N) and South La Jolla SMR (32°49.573′ N). Check the live CDFW map pin for entry AND the full swim. Serious shorebreak over reef; crowds can make it unusable.",
    targets: [
      "kelp-bass",
      "sheephead",
      "ca-halibut",
      "whitefish",
      "rockfish-complex",
      "white-seabass",
      "yellowtail",
      "bonito",
      "barracuda",
    ],
  },
  {
    name: "Bird Rock / South La Jolla",
    slug: "bird-rock",
    lat: 32.815,
    lon: -117.275,
    tideStation: "9410230",
    mpa: {
      kind: "prohibited",
      note: "South La Jolla SMR (shore to 32°47.945′ N) and its offshore SMCA — no spearfishing. Bird Rock, False Point, and Tourmaline waters are inside or against the reserve.",
    },
    advisoryMatchNames: ["bird rock", "tourmaline", "false point"],
    entryNotes: "No-take reserve covering the South La Jolla reef system.",
  },
  {
    name: "Pacific & Mission Beach",
    slug: "pacific-mission",
    lat: 32.783,
    lon: -117.255,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["pacific beach", "mission beach", "mission bay"],
    entryNotes:
      "Mostly sand with isolated hard bottom — a halibut search area, not a reef destination. City rule: no armed speargun within 50 ft of a swimmer; heavy surfer/swimmer traffic often eliminates a safe lane.",
    targets: ["ca-halibut", "kelp-bass", "whitefish"],
  },
  {
    name: "Ocean Beach / Sunset Cliffs",
    slug: "sunset-cliffs",
    lat: 32.72,
    lon: -117.256,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["ocean beach", "sunset cliffs", "san diego river"],
    entryNotes:
      "Rocky, kelp-influenced water with bass, sheephead, and halibut — but steep cliffs, caves, surge, and poor exits. Use only a documented open entry/exit that works at the expected tide; boat access is often smarter. Avoid the pier and jetties.",
    targets: ["kelp-bass", "sheephead", "ca-halibut", "whitefish", "rockfish-complex", "scorpionfish"],
  },
  {
    name: "Point Loma Kelp Beds",
    slug: "point-loma",
    lat: 32.6889,
    lon: -117.2648,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["point loma"],
    entryNotes:
      "Best boat-based option: outer kelp and rock hold reef fish plus passing pelagics. Cabrillo SMR at the tip (≈32°40.600′–32°39.700′ N plus offshore polygon) is no-take — plot the full polygon. Current, traffic, and kelp entanglement make this advanced.",
    targets: [
      "kelp-bass",
      "sheephead",
      "whitefish",
      "rockfish-complex",
      "lingcod",
      "white-seabass",
      "yellowtail",
      "bonito",
      "barracuda",
    ],
  },
  {
    name: "Coronado / Silver Strand",
    slug: "coronado",
    lat: 32.68,
    lon: -117.19,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["coronado", "silver strand"],
    entryNotes:
      "Long sandy halibut corridors — dive only on fully open water-quality days; South Bay contamination is invisible and odorless. Stay well clear of bay entrances and navigation channels.",
    targets: ["ca-halibut", "whitefish"],
    chronicAdvisory: true,
  },
  {
    name: "Imperial Beach",
    slug: "imperial-beach",
    lat: 32.5786,
    lon: -117.1339,
    tideStation: "9410170",
    mpa: {
      kind: "prohibited",
      note: "Imperial Beach Municipal Code bans spear/speargun use within 1,000 ft of the shoreline, and Tijuana River Mouth SMCA (32°34.000′ N to the border) prohibits spearfishing. Chronic sewage contamination on top.",
    },
    advisoryMatchNames: ["imperial beach", "tijuana"],
    entryNotes: "Excluded from the shortlist — not a legal or safe shore-spearfishing option.",
    chronicAdvisory: true,
  },
];
