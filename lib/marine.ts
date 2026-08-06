export interface MarineConditions {
  waveHeightFt: number | null;
  wavePeriodS: number | null;
  waveDirectionDeg: number | null;
  seaSurfaceTempF: number | null;
  windMph: number | null;
  windDirectionDeg: number | null;
  airTempF: number | null;
  /** The local hour the values represent (current hour today, morning for future days) */
  atHour: number;
}

const M_TO_FT = 3.28084;
const cToF = (c: number) => (c * 9) / 5 + 32;

function currentHourLA(): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hour12: false,
    })
      .formatToParts(new Date())
      .find((p) => p.type === "hour")?.value ?? 0
  ) % 24;
}

function pick(values: (number | null)[] | undefined, idx: number): number | null {
  const v = values?.[idx];
  return typeof v === "number" ? v : null;
}

/**
 * Conditions for a spot on a given local date. For today this is the current
 * hour; for a future day it's 9am — the typical dive window.
 */
export async function fetchMarine(
  lat: number,
  lon: number,
  date: string,
  isToday: boolean
): Promise<MarineConditions> {
  const hour = isToday ? currentHourLA() : 9;
  const empty: MarineConditions = {
    waveHeightFt: null,
    wavePeriodS: null,
    waveDirectionDeg: null,
    seaSurfaceTempF: null,
    windMph: null,
    windDirectionDeg: null,
    airTempF: null,
    atHour: hour,
  };

  const coords = `latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}`;
  const span = `&start_date=${date}&end_date=${date}&timezone=America/Los_Angeles`;
  const marineUrl =
    `https://marine-api.open-meteo.com/v1/marine?${coords}` +
    "&hourly=wave_height,wave_period,wave_direction,sea_surface_temperature" +
    span;
  const windUrl =
    `https://api.open-meteo.com/v1/forecast?${coords}` +
    "&hourly=wind_speed_10m,wind_direction_10m,temperature_2m" +
    "&wind_speed_unit=mph&temperature_unit=fahrenheit" +
    span;

  const [marineRes, windRes] = await Promise.allSettled([
    fetch(marineUrl).then((r) => (r.ok ? r.json() : null)),
    fetch(windUrl).then((r) => (r.ok ? r.json() : null)),
  ]);

  const out = { ...empty };

  if (marineRes.status === "fulfilled" && marineRes.value?.hourly?.time) {
    const h = marineRes.value.hourly;
    const heightM = pick(h.wave_height, hour);
    out.waveHeightFt = heightM == null ? null : heightM * M_TO_FT;
    out.wavePeriodS = pick(h.wave_period, hour);
    out.waveDirectionDeg = pick(h.wave_direction, hour);
    const sstC = pick(h.sea_surface_temperature, hour);
    out.seaSurfaceTempF = sstC == null ? null : cToF(sstC);
  }

  if (windRes.status === "fulfilled" && windRes.value?.hourly?.time) {
    const h = windRes.value.hourly;
    out.windMph = pick(h.wind_speed_10m, hour);
    out.windDirectionDeg = pick(h.wind_direction_10m, hour);
    out.airTempF = pick(h.temperature_2m, hour);
  }

  return out;
}
