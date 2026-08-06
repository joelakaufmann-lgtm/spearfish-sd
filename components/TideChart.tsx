"use client";

import { useEffect, useRef, useState } from "react";
import type { TidePoint, TideEvent } from "@/lib/tides";
import type { SunTimes } from "@/lib/sun";

const W = 640;
const H = 230;
const M = { l: 38, r: 14, t: 32, b: 26 };
const PW = W - M.l - M.r;
const PH = H - M.t - M.b;

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  const ampm = h >= 12 ? "p" : "a";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

/** Minutes since midnight in America/Los_Angeles right now. */
function nowMinutesLA(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return (h % 24) * 60 + m;
}

export function TideChart({
  title,
  curve,
  events,
  sun,
  showNow = true,
}: {
  title: string;
  curve: TidePoint[];
  events: TideEvent[];
  sun: SunTimes | null;
  showNow?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<TidePoint | null>(null);
  const [nowMin, setNowMin] = useState<number | null>(null);

  useEffect(() => {
    if (!showNow) {
      setNowMin(null);
      return;
    }
    setNowMin(nowMinutesLA());
    const id = setInterval(() => setNowMin(nowMinutesLA()), 60_000);
    return () => clearInterval(id);
  }, [showNow]);

  if (curve.length < 2) {
    return <p className="text-xs text-gray-500">Tide curve unavailable for {title}.</p>;
  }

  const heights = curve.map((p) => p.heightFt);
  const yMin = Math.floor(Math.min(...heights) - 0.4);
  const yMax = Math.ceil(Math.max(...heights) + 0.4);
  const x = (min: number) => M.l + (min / 1440) * PW;
  const y = (ft: number) => M.t + PH - ((ft - yMin) / (yMax - yMin)) * PH;

  const step = yMax - yMin > 6 ? 2 : 1;
  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax; v += step) yTicks.push(v);
  const hourTicks = Array.from({ length: 24 }, (_, h) => h); // hourly axis

  // Slack windows: ±2h around each high/low, merged where they overlap
  const eventMinutes = events.map(
    (e) => Number(e.time.slice(11, 13)) * 60 + Number(e.time.slice(14, 16))
  );
  const slackWindows: [number, number][] = [];
  for (const min of [...eventMinutes].sort((a, b) => a - b)) {
    const from = Math.max(0, min - 120);
    const to = Math.min(1440, min + 120);
    const last = slackWindows[slackWindows.length - 1];
    if (last && from <= last[1]) last[1] = to;
    else slackWindows.push([from, to]);
  }

  const linePath = curve
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.minutes).toFixed(1)},${y(p.heightFt).toFixed(1)}`)
    .join("");
  const areaPath = `${linePath}L${x(curve[curve.length - 1].minutes).toFixed(1)},${
    M.t + PH
  }L${x(curve[0].minutes).toFixed(1)},${M.t + PH}Z`;

  const nearest = (min: number): TidePoint =>
    curve.reduce((a, b) => (Math.abs(b.minutes - min) < Math.abs(a.minutes - min) ? b : a));

  function pointerToPoint(clientX: number): TidePoint | null {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const min = ((clientX - rect.left) / rect.width) * W;
    if (min < M.l || min > W - M.r) return null;
    return nearest(((min - M.l) / PW) * 1440);
  }

  const nowPoint = nowMin != null ? nearest(nowMin) : null;

  return (
    <div
      className="viz-root relative rounded-xl border p-3"
      style={{ background: "var(--viz-surface)", borderColor: "var(--viz-border)" }}
    >
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 px-1">
        <h3 className="text-sm font-semibold" style={{ color: "var(--viz-ink)" }}>
          {title}
          <span className="ml-2 font-normal" style={{ color: "var(--viz-muted)" }}>
            tide height (ft, MLLW)
          </span>
        </h3>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--viz-ink-2)" }}>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: "var(--viz-slack)", border: "1px solid var(--viz-slack-solid)" }}
            />
            slack (±2h of high/low) — good time to go
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: "var(--viz-night)", border: "1px solid var(--viz-border)" }}
            />
            night
          </span>
        </div>
      </div>
      <div ref={wrapRef}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full outline-none"
          role="img"
          aria-label={`Tide chart for ${title}: ${events
            .map((e) => `${e.type === "H" ? "high" : "low"} ${e.heightFt.toFixed(1)} feet at ${fmtMin(
              Number(e.time.slice(11, 13)) * 60 + Number(e.time.slice(14, 16))
            )}`)
            .join(", ")}`}
          tabIndex={0}
          onPointerMove={(e) => setHover(pointerToPoint(e.clientX))}
          onPointerLeave={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setHover(null);
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              const cur = hover?.minutes ?? nowMin ?? 720;
              setHover(nearest(cur + (e.key === "ArrowRight" ? 30 : -30)));
            }
          }}
        >
          {/* night shading */}
          {sun && (
            <>
              <rect x={M.l} y={M.t} width={x(sun.sunriseMinutes) - M.l} height={PH} fill="var(--viz-night)" />
              <rect
                x={x(sun.sunsetMinutes)}
                y={M.t}
                width={W - M.r - x(sun.sunsetMinutes)}
                height={PH}
                fill="var(--viz-night)"
              />
              <text x={x(sun.sunriseMinutes) + 4} y={M.t + PH - 6} fontSize="10" fill="var(--viz-ink-2)">
                ☀ {fmtMin(sun.sunriseMinutes)}
              </text>
              <text
                x={x(sun.sunsetMinutes) - 4}
                y={M.t + PH - 6}
                fontSize="10"
                textAnchor="end"
                fill="var(--viz-ink-2)"
              >
                ☾ {fmtMin(sun.sunsetMinutes)}
              </text>
            </>
          )}

          {/* slack-tide windows (over night shading, under the data) */}
          {slackWindows.map(([from, to]) => (
            <rect
              key={from}
              x={x(from)}
              y={M.t}
              width={x(to) - x(from)}
              height={PH}
              fill="var(--viz-slack)"
            />
          ))}

          {/* gridlines + y ticks */}
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} stroke="var(--viz-grid)" strokeWidth="1" />
              <text x={M.l - 6} y={y(v) + 3} fontSize="10" textAnchor="end" fill="var(--viz-ink-2)"
                style={{ fontVariantNumeric: "tabular-nums" }}>
                {v}
              </text>
            </g>
          ))}

          {/* hourly x axis */}
          {hourTicks.map((h) => {
            const min = h * 60;
            const label = h === 0 ? "12a" : h === 12 ? "12p" : String(h % 12);
            return (
              <g key={h}>
                <line
                  x1={x(min)}
                  x2={x(min)}
                  y1={M.t + PH}
                  y2={M.t + PH + 4}
                  stroke="var(--viz-axis)"
                  strokeWidth="1"
                />
                <text
                  x={x(min)}
                  y={H - 6}
                  fontSize="9"
                  textAnchor="middle"
                  fill="var(--viz-ink-2)"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* area + line */}
          <path d={areaPath} fill="var(--viz-series)" opacity="0.1" />
          <path d={linePath} fill="none" stroke="var(--viz-series)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* baseline */}
          <line x1={M.l} x2={W - M.r} y1={M.t + PH} y2={M.t + PH} stroke="var(--viz-axis)" strokeWidth="1" />

          {/* now marker (client-only) */}
          {nowPoint && nowMin != null && (
            <g>
              <line x1={x(nowMin)} x2={x(nowMin)} y1={M.t} y2={M.t + PH} stroke="var(--viz-ink-2)" strokeWidth="1" opacity="0.5" />
              <circle cx={x(nowPoint.minutes)} cy={y(nowPoint.heightFt)} r="4.5" fill="var(--viz-ink-2)" stroke="var(--viz-surface)" strokeWidth="2" />
              <text x={x(nowMin)} y={M.t - 4} fontSize="10" textAnchor="middle" fill="var(--viz-ink-2)">
                now
              </text>
            </g>
          )}

          {/* high/low markers with direct labels */}
          {events.map((e) => {
            const min = Number(e.time.slice(11, 13)) * 60 + Number(e.time.slice(14, 16));
            const isH = e.type === "H";
            const ly = isH ? y(e.heightFt) - 20 : Math.min(y(e.heightFt) + 16, M.t + PH - 12);
            const lx = Math.min(Math.max(x(min), M.l + 24), W - M.r - 24);
            return (
              <g key={e.time}>
                <circle cx={x(min)} cy={y(e.heightFt)} r="4.5" fill="var(--viz-series)" stroke="var(--viz-surface)" strokeWidth="2" />
                <text x={lx} y={ly} fontSize="11" fontWeight="600" textAnchor="middle" fill="var(--viz-ink)">
                  {isH ? "H" : "L"} {e.heightFt.toFixed(1)} ft
                </text>
                <text x={lx} y={ly + 11} fontSize="10" textAnchor="middle" fill="var(--viz-ink-2)">
                  {fmtMin(min)}
                </text>
              </g>
            );
          })}

          {/* crosshair */}
          {hover && (
            <g pointerEvents="none">
              <line x1={x(hover.minutes)} x2={x(hover.minutes)} y1={M.t} y2={M.t + PH} stroke="var(--viz-axis)" strokeWidth="1" />
              <circle cx={x(hover.minutes)} cy={y(hover.heightFt)} r="4.5" fill="var(--viz-series)" stroke="var(--viz-surface)" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* tooltip */}
        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border px-2 py-1 text-xs shadow-sm"
            style={{
              left: `${(x(hover.minutes) / W) * 100}%`,
              top: 30,
              transform: x(hover.minutes) > W / 2 ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
              background: "var(--viz-tooltip-bg)",
              borderColor: "var(--viz-border)",
            }}
          >
            <span className="font-bold" style={{ color: "var(--viz-ink)" }}>
              {hover.heightFt.toFixed(1)} ft
            </span>{" "}
            <span style={{ color: "var(--viz-ink-2)" }}>{fmtMin(hover.minutes)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
