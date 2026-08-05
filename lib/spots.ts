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
  chronicAdvisory?: boolean;
}

export const TIDE_STATIONS: Record<TideStation, string> = {
  "9410170": "San Diego Bay",
  "9410230": "La Jolla (Scripps Pier)",
};

export const SPOTS: Spot[] = [
  {
    name: "Point Loma Kelp Beds",
    slug: "point-loma",
    lat: 32.6889,
    lon: -117.2648,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["point loma"],
    entryNotes:
      "Best by boat or kayak; long swim from shore. Thick kelp holds calico bass, sheephead, and yellowtail in summer.",
  },
  {
    name: "Sunset Cliffs",
    slug: "sunset-cliffs",
    lat: 32.7157,
    lon: -117.2557,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["sunset cliffs", "ocean beach"],
    entryNotes:
      "Cliff entries require care — scout your exit at low tide before diving. Reef and boiler structure close to shore.",
  },
  {
    name: "Mission Beach",
    slug: "mission-beach",
    lat: 32.7707,
    lon: -117.2521,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["mission beach", "mission bay"],
    entryNotes:
      "Easy sand entry; mostly flat sand bottom — target halibut on the flats. Stay outside surfline zones and flag up.",
  },
  {
    name: "Pacific Beach (Crystal Pier)",
    slug: "pacific-beach",
    lat: 32.7963,
    lon: -117.2565,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["pacific beach"],
    entryNotes:
      "Sand entry; halibut ground. Keep well clear of the pier (no take within pier zones) and watch for surfers.",
  },
  {
    name: "La Jolla Cove / Shores",
    slug: "la-jolla-cove",
    lat: 32.8503,
    lon: -117.2721,
    tideStation: "9410230",
    mpa: {
      kind: "prohibited",
      note: "Inside Matlahuayl SMR and San Diego-Scripps Coastal SMCA — all take prohibited. Great freediving, no spearfishing.",
    },
    advisoryMatchNames: ["la jolla cove", "la jolla shores", "children's pool", "childrens pool"],
    entryNotes: "No-take marine reserve. Dive it for fun, leave the speargun home.",
  },
  {
    name: "Windansea / Bird Rock",
    slug: "windansea",
    lat: 32.8301,
    lon: -117.2822,
    tideStation: "9410230",
    mpa: {
      kind: "prohibited",
      note: "Inside South La Jolla SMR — all take prohibited.",
    },
    advisoryMatchNames: ["windansea", "bird rock"],
    entryNotes: "No-take marine reserve covering the South La Jolla reef system.",
  },
  {
    name: "Torrey Pines / Black's Beach",
    slug: "torrey-pines",
    lat: 32.8894,
    lon: -117.2531,
    tideStation: "9410230",
    mpa: {
      kind: "restricted",
      note: "Southern end borders the San Diego-Scripps Coastal SMCA (no take). Stay well north of the SMCA boundary and verify your position before taking game.",
    },
    advisoryMatchNames: ["torrey pines", "black's beach", "blacks beach"],
    entryNotes:
      "Long beach walk-in; sand bottom with scattered reef north of the reserve boundary. Halibut territory.",
  },
  {
    name: "Swami's (Encinitas)",
    slug: "swamis",
    lat: 33.0342,
    lon: -117.2929,
    tideStation: "9410230",
    mpa: {
      kind: "restricted",
      note: "Swami's SMCA — take of most species prohibited; limited exceptions only. Check current CDFW regulations before diving here.",
    },
    advisoryMatchNames: ["swami", "encinitas", "moonlight beach"],
    entryNotes: "Reef ledges and eelgrass. Heavily restricted conservation area — know the rules.",
  },
  {
    name: "Oceanside / Carlsbad",
    slug: "oceanside",
    lat: 33.1622,
    lon: -117.3556,
    tideStation: "9410230",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["oceanside", "carlsbad", "buena vista"],
    entryNotes:
      "Open coast, sand and scattered structure. Halibut and occasional white seabass in spring. Easy beach entries.",
  },
  {
    name: "Imperial Beach",
    slug: "imperial-beach",
    lat: 32.5786,
    lon: -117.1339,
    tideStation: "9410170",
    mpa: { kind: "legal" },
    advisoryMatchNames: ["imperial beach", "tijuana"],
    entryNotes:
      "Legal and uncrowded, but chronically affected by the Tijuana River plume — check advisories every single time.",
    chronicAdvisory: true,
  },
];
