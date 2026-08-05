import type { MpaStatus } from "./spots";

export type Verdict = "go" | "caution" | "no-go";
export type AdvisoryStatus = "closure" | "advisory" | "open" | "unknown";

export interface TideState {
  direction: "rising" | "falling" | null;
  nextEvent: { type: "H" | "L"; time: string; heightFt: number } | null;
}

export interface VerdictInput {
  mpa: MpaStatus;
  advisory: AdvisoryStatus;
  waveHeightFt: number | null;
  wavePeriodS: number | null;
  windMph: number | null;
  tide: TideState | null;
}

export interface VerdictResult {
  verdict: Verdict;
  reasons: string[];
}

const RANK: Record<Verdict, number> = { go: 0, caution: 1, "no-go": 2 };

function worst(a: Verdict, b: Verdict): Verdict {
  return RANK[a] >= RANK[b] ? a : b;
}

export function scoreSpot(input: VerdictInput): VerdictResult {
  const reasons: string[] = [];
  let verdict: Verdict = "go";

  // Hard stops first
  if (input.mpa.kind === "prohibited") {
    return {
      verdict: "no-go",
      reasons: [`Spearfishing prohibited: ${input.mpa.note}`],
    };
  }
  if (input.mpa.kind === "restricted") {
    verdict = worst(verdict, "caution");
    reasons.push("Marine protected area — take restrictions apply (see MPA note).");
  }

  if (input.advisory === "closure") {
    verdict = "no-go";
    reasons.push("Beach CLOSED — sewage or chemical contamination. Stay out of the water.");
  } else if (input.advisory === "advisory") {
    verdict = "no-go";
    reasons.push("Water contact advisory — bacteria levels exceed health standards.");
  } else if (input.advisory === "unknown") {
    verdict = worst(verdict, "caution");
    reasons.push("Advisory data unavailable — check the county source before diving.");
  } else {
    reasons.push("No active water quality advisory.");
  }

  // Waves
  if (input.waveHeightFt == null) {
    verdict = worst(verdict, "caution");
    reasons.push("No wave data available.");
  } else if (input.waveHeightFt > 5) {
    verdict = "no-go";
    reasons.push(`Waves ${input.waveHeightFt.toFixed(1)} ft — too big for safe entry and any visibility.`);
  } else if (input.waveHeightFt >= 3) {
    verdict = worst(verdict, "caution");
    reasons.push(`Waves ${input.waveHeightFt.toFixed(1)} ft — expect stirred-up water and tough entries.`);
  } else {
    reasons.push(`Small surf (${input.waveHeightFt.toFixed(1)} ft) — favorable for visibility.`);
  }

  // Swell period as visibility proxy
  if (input.wavePeriodS != null) {
    if (input.wavePeriodS >= 13) {
      reasons.push(`Long-period swell (${Math.round(input.wavePeriodS)} s) — likely cleaner water.`);
    } else if (input.wavePeriodS < 9 && (input.waveHeightFt ?? 0) >= 2) {
      verdict = worst(verdict, "caution");
      reasons.push(`Short-period wind swell (${Math.round(input.wavePeriodS)} s) — poor visibility likely.`);
    }
  }

  // Wind
  if (input.windMph != null) {
    if (input.windMph > 15) {
      verdict = "no-go";
      reasons.push(`Wind ${Math.round(input.windMph)} mph — blown out.`);
    } else if (input.windMph >= 8) {
      verdict = worst(verdict, "caution");
      reasons.push(`Wind ${Math.round(input.windMph)} mph — surface chop building.`);
    } else {
      reasons.push(`Light wind (${Math.round(input.windMph)} mph).`);
    }
  }

  // Tide is informational — never gates alone
  if (input.tide?.direction === "rising") {
    reasons.push("Incoming tide — typically brings cleaner water.");
  } else if (input.tide?.direction === "falling") {
    reasons.push("Outgoing tide — can pull turbid water off the beach.");
  }

  return { verdict, reasons };
}

export function overallHeadline(
  results: { verdict: Verdict; legal: boolean }[]
): { answer: string; detail: string; tone: Verdict } {
  const legal = results.filter((r) => r.legal);
  const goCount = legal.filter((r) => r.verdict === "go").length;
  const cautionCount = legal.filter((r) => r.verdict === "caution").length;

  if (goCount > 0) {
    return {
      answer: "Yes.",
      detail: `Conditions look good at ${goCount} spot${goCount === 1 ? "" : "s"}.`,
      tone: "go",
    };
  }
  if (cautionCount > 0) {
    return {
      answer: "Maybe.",
      detail: `${cautionCount} spot${cautionCount === 1 ? "" : "s"} are marginal — pick carefully.`,
      tone: "caution",
    };
  }
  return {
    answer: "Not today.",
    detail: "No legal spot has decent conditions right now.",
    tone: "no-go",
  };
}
