export interface MarineConditions {
  waveHeightFt: number | null;
  wavePeriodS: number | null;
  waveDirectionDeg: number | null;
  seaSurfaceTempF: number | null;
  windMph: number | null;
  windDirectionDeg: number | null;
}

const M_TO_FT = 3.28084;

/** Index of the current hour in an Open-Meteo hourly time array (local-time ISO strings). */
function currentHourIndex(times: string[]): number {
  const nowHour = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(" ", "T");
  const idx = times.findIndex((t) => t.startsWith(nowHour));
  return idx >= 0 ? idx : 0;
}

function pick(values: (number | null)[] | undefined, idx: number): number | null {
  const v = values?.[idx];
  return typeof v === "number" ? v : null;
}

export async function fetchMarine(lat: number, lon: number): Promise<MarineConditions> {
  const empty: MarineConditions = {
    waveHeightFt: null,
    wavePeriodS: null,
    waveDirectionDeg: null,
    seaSurfaceTempF: null,
    windMph: null,
    windDirectionDeg: null,
  };

  const marineUrl =
    "https://marine-api.open-meteo.com/v1/marine" +
    `?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    "&hourly=wave_height,wave_period,wave_direction,sea_surface_temperature" +
    "&timezone=America/Los_Angeles&forecast_days=1";
  const windUrl =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    "&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph" +
    "&timezone=America/Los_Angeles&forecast_days=1";

  const [marineRes, windRes] = await Promise.allSettled([
    fetch(marineUrl, { next: { revalidate: 3600 } }).then((r) => (r.ok ? r.json() : null)),
    fetch(windUrl, { next: { revalidate: 3600 } }).then((r) => (r.ok ? r.json() : null)),
  ]);

  const out = { ...empty };

  if (marineRes.status === "fulfilled" && marineRes.value?.hourly?.time) {
    const h = marineRes.value.hourly;
    const i = currentHourIndex(h.time);
    const heightM = pick(h.wave_height, i);
    out.waveHeightFt = heightM == null ? null : heightM * M_TO_FT;
    out.wavePeriodS = pick(h.wave_period, i);
    out.waveDirectionDeg = pick(h.wave_direction, i);
    const sstC = pick(h.sea_surface_temperature, i);
    out.seaSurfaceTempF = sstC == null ? null : (sstC * 9) / 5 + 32;
  }

  if (windRes.status === "fulfilled" && windRes.value?.hourly?.time) {
    const h = windRes.value.hourly;
    const i = currentHourIndex(h.time);
    out.windMph = pick(h.wind_speed_10m, i);
    out.windDirectionDeg = pick(h.wind_direction_10m, i);
  }

  return out;
}
