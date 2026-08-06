export interface SunTimes {
  sunrise: string; // "YYYY-MM-DDTHH:mm" local
  sunset: string;
  sunriseMinutes: number; // minutes since local midnight
  sunsetMinutes: number;
}

function toMinutes(iso: string): number {
  const [h, m] = iso.split("T")[1].split(":").map(Number);
  return h * 60 + m;
}

/** Sunrise/sunset for San Diego — varies by <2 min across the county, so one call covers all spots. */
export async function fetchSun(date: string): Promise<SunTimes | null> {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=32.72&longitude=-117.17" +
    `&daily=sunrise,sunset&timezone=America/Los_Angeles&start_date=${date}&end_date=${date}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const sunrise: string | undefined = data?.daily?.sunrise?.[0];
    const sunset: string | undefined = data?.daily?.sunset?.[0];
    if (!sunrise || !sunset) return null;
    return {
      sunrise,
      sunset,
      sunriseMinutes: toMinutes(sunrise),
      sunsetMinutes: toMinutes(sunset),
    };
  } catch {
    return null;
  }
}
