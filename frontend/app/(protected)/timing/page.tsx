"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Clock, Timer } from "lucide-react";
import { useMemo, useState } from "react";

interface LapData {
  driver: string;
  lap_number: number;
  lap_time: string | null;
  lap_time_seconds: number | null;
  sector1_time: number | null;
  sector2_time: number | null;
  sector3_time: number | null;
  compound: string | null;
  tyre_life: number | null;
  stint: number;
  is_personal_best: boolean;
}

interface ScheduleRace {
  round: number;
  raceName: string;
}

interface DriverTiming {
  driver: string;
  position: number;
  completedLaps: number;
  cumulativeSeconds: number;
  gap: string | null;
  lastLapSeconds: number | null;
  lastLapTime: string | null;
  bestLapSeconds: number | null;
  compound: string | null;
  tyreLife: number | null;
  isPersonalBest: boolean;
}

const COMPOUND_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  SOFT: { bg: "#FF3333", text: "#fff", label: "S" },
  MEDIUM: { bg: "#FFD700", text: "#000", label: "M" },
  HARD: { bg: "#E5E5E5", text: "#000", label: "H" },
  INTER: { bg: "#39B54A", text: "#fff", label: "I" },
  WET: { bg: "#0067FF", text: "#fff", label: "W" },
};

function formatSeconds({ seconds }: { seconds: number | null }): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "—";
  }
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return mins > 0 ? `${mins}:${secs.padStart(6, "0")}` : secs;
}

function buildTiming({
  laps,
  currentLap,
}: {
  laps: LapData[];
  currentLap: number;
}): DriverTiming[] {
  const completed = laps.filter(
    (l) => l.lap_number <= currentLap && l.lap_time_seconds !== null,
  );

  const byDriver = new Map<string, LapData[]>();
  for (const lap of completed) {
    const existing = byDriver.get(lap.driver) ?? [];
    existing.push(lap);
    byDriver.set(lap.driver, existing);
  }

  const states = Array.from(byDriver.entries()).map(([driver, driverLaps]) => {
    const completedLaps = driverLaps.length;
    const cumulativeSeconds = driverLaps.reduce(
      (sum, l) => sum + (l.lap_time_seconds ?? 0),
      0,
    );
    const sorted = [...driverLaps].sort((a, b) => b.lap_number - a.lap_number);
    const lastLap = sorted[0];
    const bestLapSeconds = driverLaps.reduce<number | null>((best, l) => {
      if (l.lap_time_seconds === null) {
        return best;
      }
      return best === null
        ? l.lap_time_seconds
        : Math.min(best, l.lap_time_seconds);
    }, null);

    return {
      driver,
      completedLaps,
      cumulativeSeconds,
      lastLapSeconds: lastLap?.lap_time_seconds ?? null,
      lastLapTime: lastLap?.lap_time ?? null,
      bestLapSeconds,
      compound: lastLap?.compound ?? null,
      tyreLife: lastLap?.tyre_life ?? null,
      isPersonalBest: lastLap?.is_personal_best ?? false,
    };
  });

  states.sort((a, b) => {
    if (b.completedLaps !== a.completedLaps) {
      return b.completedLaps - a.completedLaps;
    }
    return a.cumulativeSeconds - b.cumulativeSeconds;
  });

  const leader = states[0];

  return states.map((d, i) => {
    let gap: string | null = null;
    if (i > 0 && leader) {
      const lapDiff = leader.completedLaps - d.completedLaps;
      if (lapDiff > 0) {
        gap = `+${lapDiff} Lap${lapDiff > 1 ? "s" : ""}`;
      } else {
        const diff = d.cumulativeSeconds - leader.cumulativeSeconds;
        gap = `+${diff.toFixed(3)}`;
      }
    }

    return { ...d, position: i + 1, gap };
  });
}

export default function TimingPage() {
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 2018 + 1 },
    (_, i) => currentYear - i,
  );

  const [year, setYear] = useState(currentYear);
  const [race, setRace] = useState(1);
  const [sessionType, setSessionType] = useState("R");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: scheduleData } = useQuery({
    queryKey: ["schedule-timing", year],
    queryFn: async () => {
      const response = await api.get(`/jolpica/schedule?season=${year}`);
      return response.data;
    },
  });

  const {
    data: lapsData,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ laps: LapData[]; total_laps: number }>({
    queryKey: ["timing-laps", year, race, sessionType],
    queryFn: async () => {
      const response = await api.get(
        `/fastf1/race/${year}/${race}/laps?session_type=${sessionType}`,
      );
      return response.data;
    },
    enabled: false,
    retry: false,
  });

  const totalLaps = lapsData?.total_laps
    ? Math.max(...lapsData.laps.map((l) => l.lap_number))
    : 0;

  const [currentLap, setCurrentLap] = useState(1);

  const handleLoad = () => {
    setIsSubmitted(true);
    setCurrentLap(1);
    refetch();
  };

  const handleYearChange = (value: string) => {
    setYear(Number.parseInt(value));
    setRace(1);
    setIsSubmitted(false);
  };

  const timing = useMemo(() => {
    if (!lapsData?.laps) {
      return [];
    }
    return buildTiming({ laps: lapsData.laps, currentLap });
  }, [lapsData, currentLap]);

  // Fastest lap in the current timing snapshot
  const overallBestSeconds = timing.reduce<number | null>((best, d) => {
    if (d.bestLapSeconds === null) {
      return best;
    }
    return best === null ? d.bestLapSeconds : Math.min(best, d.bestLapSeconds);
  }, null);

  const races: ScheduleRace[] = scheduleData?.races ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timing Tower</h1>
        <p className="text-muted-foreground mt-1">
          F1-style lap-by-lap timing with gaps, sector times, and tyre data
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Session</CardTitle>
          <CardDescription>
            Choose a race weekend and session type to analyse
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="timing-year">
              Season
            </label>
            <Select value={String(year)} onValueChange={handleYearChange}>
              <SelectTrigger
                id="timing-year"
                className="w-28"
                suppressHydrationWarning
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="timing-race">
              Round
            </label>
            <Select
              value={String(race)}
              onValueChange={(v) => {
                setRace(Number.parseInt(v));
                setIsSubmitted(false);
              }}
            >
              <SelectTrigger
                id="timing-race"
                className="w-64"
                suppressHydrationWarning
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {races.length > 0
                  ? races.map((r) => (
                      <SelectItem key={r.round} value={String(r.round)}>
                        Round {r.round}: {r.raceName}
                      </SelectItem>
                    ))
                  : Array.from({ length: 24 }, (_, i) => i + 1).map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        Round {r}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="timing-session">
              Session
            </label>
            <Select
              value={sessionType}
              onValueChange={(v) => {
                setSessionType(v);
                setIsSubmitted(false);
              }}
            >
              <SelectTrigger
                id="timing-session"
                className="w-24"
                suppressHydrationWarning
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R">Race</SelectItem>
                <SelectItem value="Q">Qualifying</SelectItem>
                <SelectItem value="FP1">FP1</SelectItem>
                <SelectItem value="FP2">FP2</SelectItem>
                <SelectItem value="FP3">FP3</SelectItem>
                <SelectItem value="S">Sprint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleLoad} disabled={isLoading}>
            {isLoading ? "Loading…" : "Load Timing"}
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {isSubmitted && isLoading && (
        <Card>
          <CardContent className="py-12 space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Timer className="h-5 w-5 animate-pulse" />
              <p className="text-sm">
                Loading lap time data from FastF1 — first load may take up to 60
                s…
              </p>
            </div>
            {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
              <Skeleton key={key} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {isSubmitted && isError && !isLoading && (
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive font-semibold">
              Failed to load timing data
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This session may not be available yet. Try a different year or
              round.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timing display */}
      {isSubmitted && !isLoading && lapsData && (
        <div className="space-y-4">
          {/* Lap Slider */}
          <Card>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Lap {currentLap} / {totalLaps}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentLap((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentLap((p) => Math.min(totalLaps, p + 1))
                    }
                  >
                    Next →
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentLap(totalLaps)}
                  >
                    End
                  </Button>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={totalLaps || 1}
                value={currentLap}
                onChange={(e) => setCurrentLap(Number.parseInt(e.target.value))}
                className="w-full accent-primary"
                aria-label="Lap selector"
              />
            </CardContent>
          </Card>

          {/* Timing Tower Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Timing Tower — Lap {currentLap}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="px-4 py-2.5 text-left w-8">P</th>
                      <th className="px-4 py-2.5 text-left w-14">Driver</th>
                      <th className="px-4 py-2.5 text-right">Gap</th>
                      <th className="px-4 py-2.5 text-right">Last Lap</th>
                      <th className="px-4 py-2.5 text-right">Best Lap</th>
                      <th className="px-4 py-2.5 text-right">S1</th>
                      <th className="px-4 py-2.5 text-right">S2</th>
                      <th className="px-4 py-2.5 text-right">S3</th>
                      <th className="px-4 py-2.5 text-center w-10">Tyre</th>
                      <th className="px-4 py-2.5 text-right w-10">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timing.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          No timing data available for lap {currentLap}
                        </td>
                      </tr>
                    ) : (
                      timing.map((d) => {
                        // Find the most recent lap data for this driver at currentLap for sectors
                        const lastLapData = lapsData.laps
                          .filter(
                            (l) =>
                              l.driver === d.driver &&
                              l.lap_number <= currentLap,
                          )
                          .sort((a, b) => b.lap_number - a.lap_number)[0];

                        const compoundCfg = d.compound
                          ? COMPOUND_CONFIG[d.compound]
                          : null;
                        const isFastestLap =
                          d.bestLapSeconds !== null &&
                          overallBestSeconds !== null &&
                          Math.abs(d.bestLapSeconds - overallBestSeconds) <
                            0.001;

                        return (
                          <tr
                            key={d.driver}
                            className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-4 py-2.5 font-bold text-muted-foreground">
                              {d.position}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-semibold">
                                  {d.driver}
                                </span>
                                {d.isPersonalBest && (
                                  <span className="text-green-500 text-xs">
                                    PB
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-muted-foreground text-xs">
                              {d.gap ?? (
                                <span className="text-primary font-semibold">
                                  LEADER
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs">
                              <span
                                className={
                                  d.isPersonalBest
                                    ? "text-green-500 font-semibold"
                                    : ""
                                }
                              >
                                {formatSeconds({ seconds: d.lastLapSeconds })}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs">
                              <span
                                className={
                                  isFastestLap
                                    ? "text-purple-500 font-semibold"
                                    : ""
                                }
                              >
                                {formatSeconds({ seconds: d.bestLapSeconds })}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                              {formatSeconds({
                                seconds: lastLapData?.sector1_time ?? null,
                              })}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                              {formatSeconds({
                                seconds: lastLapData?.sector2_time ?? null,
                              })}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                              {formatSeconds({
                                seconds: lastLapData?.sector3_time ?? null,
                              })}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {compoundCfg ? (
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                  style={{
                                    backgroundColor: compoundCfg.bg,
                                    color: compoundCfg.text,
                                  }}
                                  title={d.compound ?? ""}
                                >
                                  {compoundCfg.label}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right text-xs text-muted-foreground font-mono">
                              {d.tyreLife ?? "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="text-green-500 font-semibold">Green</span>
              <span>= Personal best lap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-purple-500 font-semibold">Purple</span>
              <span>= Fastest lap of session</span>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              {Object.entries(COMPOUND_CONFIG).map(([compound, cfg]) => (
                <div key={compound} className="flex items-center gap-1">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: cfg.bg, color: cfg.text }}
                  >
                    {cfg.label}
                  </span>
                  <span>
                    {compound[0]}
                    {compound.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isSubmitted && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-semibold">Select a session to begin</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a season, round, and session type above
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
              {[
                {
                  label: "Live-style Timing",
                  desc: "Lap-by-lap tower with gaps",
                },
                { label: "Sector Times", desc: "S1, S2, S3 per driver" },
                { label: "Tyre Tracker", desc: "Compound and age per driver" },
                { label: "Fastest Lap", desc: "Purple sector highlights" },
              ].map((feat) => (
                <Badge
                  key={feat.label}
                  variant="outline"
                  className="flex flex-col items-center px-4 py-2 h-auto gap-0.5"
                >
                  <span className="font-semibold">{feat.label}</span>
                  <span className="font-normal text-muted-foreground">
                    {feat.desc}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
