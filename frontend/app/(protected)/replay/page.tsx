"use client";

import { CircuitMap, type DriverPosition } from "@/components/CircuitMap";
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
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Timer,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const COMPOUND_COLORS: Record<string, { bg: string; text: string }> = {
  SOFT: { bg: "#FF3333", text: "#fff" },
  MEDIUM: { bg: "#FFD700", text: "#000" },
  HARD: { bg: "#E5E5E5", text: "#000" },
  INTER: { bg: "#39B54A", text: "#fff" },
  WET: { bg: "#0067FF", text: "#fff" },
};

function CompoundBadge({ compound }: Readonly<{ compound: string }>) {
  const cfg = COMPOUND_COLORS[compound];
  const bg = cfg?.bg ?? "#888";
  const color = cfg?.text ?? "#fff";
  return (
    <span
      className="text-xs font-medium px-1 rounded mr-1"
      style={{ backgroundColor: bg, color }}
    >
      {compound[0]}
    </span>
  );
}

interface ReplayDriver {
  code: string;
  name: string;
  team: string;
  color: string;
}

interface FrameDriver {
  x: number;
  y: number;
  position: number | null;
  compound: string | null;
  lap_time_s: number | null;
}

interface ReplayFrame {
  lap: number;
  drivers: Record<string, FrameDriver>;
}

interface ReplayData {
  year: number;
  race: number;
  total_laps: number;
  frames: ReplayFrame[];
  drivers: Record<string, ReplayDriver>;
}

interface TrackData {
  points: [number, number][];
}

interface ScheduleRace {
  round: number;
  raceName: string;
}

const PLAYBACK_OPTIONS = [1, 2, 4, 8] as const;
type PlaybackSpeed = (typeof PLAYBACK_OPTIONS)[number];

function formatLapTime({ seconds }: { seconds: number | null }): string {
  if (seconds === null) {
    return "—";
  }
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, "0")}`;
}

export default function ReplayPage() {
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 2018 + 1 },
    (_, i) => currentYear - i,
  );

  const [year, setYear] = useState(currentYear);
  const [race, setRace] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(2);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Schedule for round picker
  const { data: scheduleData } = useQuery({
    queryKey: ["schedule-replay", year],
    queryFn: async () => {
      const response = await api.get(`/jolpica/schedule?season=${year}`);
      return response.data;
    },
  });

  // Track map
  const {
    data: trackData,
    isLoading: trackLoading,
    isError: trackError,
    refetch: refetchTrack,
  } = useQuery<TrackData>({
    queryKey: ["track-map", year, race],
    queryFn: async () => {
      const response = await api.get(`/fastf1/race/${year}/${race}/track-map`);
      return response.data;
    },
    enabled: false,
    retry: false,
  });

  // Lap positions
  const {
    data: replayData,
    isLoading: replayLoading,
    isError: replayError,
    refetch: refetchReplay,
  } = useQuery<ReplayData>({
    queryKey: ["lap-positions", year, race],
    queryFn: async () => {
      const response = await api.get(
        `/fastf1/race/${year}/${race}/lap-positions`,
      );
      return response.data;
    },
    enabled: false,
    retry: false,
  });

  const handleLoad = useCallback(() => {
    setIsSubmitted(true);
    setCurrentFrameIndex(0);
    setIsPlaying(false);
    refetchTrack();
    refetchReplay();
  }, [refetchTrack, refetchReplay]);

  const handleYearChange = (value: string) => {
    setYear(Number.parseInt(value));
    setRace(1);
    setIsSubmitted(false);
  };

  const handleRaceChange = (value: string) => {
    setRace(Number.parseInt(value));
    setIsSubmitted(false);
  };

  // Playback timer
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (!isPlaying || !replayData) {
      return;
    }
    intervalRef.current = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        const next = prev + 1;
        if (next >= replayData.frames.length) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, 1000 / playbackSpeed);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, replayData]);

  const handlePlayPause = () => {
    if (!replayData) {
      return;
    }
    if (currentFrameIndex >= replayData.frames.length - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    if (!replayData) {
      return;
    }
    setIsPlaying(false);
    setCurrentFrameIndex((prev) =>
      Math.min(replayData.frames.length - 1, prev + 1),
    );
  };

  const currentFrame = replayData?.frames[currentFrameIndex] ?? null;
  const isLoading = trackLoading || replayLoading;
  const isError = trackError || replayError;

  // Build driver positions for CircuitMap
  const driverMapPositions: Record<string, DriverPosition> = {};
  if (currentFrame && replayData) {
    for (const [code, frameDriver] of Object.entries(currentFrame.drivers)) {
      const driverInfo = replayData.drivers[code];
      driverMapPositions[code] = {
        x: frameDriver.x,
        y: frameDriver.y,
        color: driverInfo?.color ?? "#ffffff",
        position: frameDriver.position,
        compound: frameDriver.compound,
      };
    }
  }

  // Build sorted leaderboard
  const leaderboard = currentFrame
    ? Object.entries(currentFrame.drivers)
        .map(([code, d]) => ({ code, ...d, info: replayData?.drivers[code] }))
        .sort((a, b) => {
          const pa = a.position ?? 99;
          const pb = b.position ?? 99;
          return pa - pb;
        })
    : [];

  const races: ScheduleRace[] = scheduleData?.races ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Race Replay</h1>
        <p className="text-muted-foreground mt-1">
          Watch races unfold lap by lap with live driver positions on a circuit
          map
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Race</CardTitle>
          <CardDescription>
            Choose a season and round — first load can take up to 60 s while
            FastF1 fetches data
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="replay-year">
              Season
            </label>
            <Select value={String(year)} onValueChange={handleYearChange}>
              <SelectTrigger id="replay-year" className="w-28">
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
            <label className="text-sm font-medium" htmlFor="replay-race">
              Round
            </label>
            <Select value={String(race)} onValueChange={handleRaceChange}>
              <SelectTrigger id="replay-race" className="w-64">
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

          <Button onClick={handleLoad} disabled={isLoading}>
            {isLoading ? "Loading…" : "Load Replay"}
          </Button>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isSubmitted && isLoading && (
        <Card>
          <CardContent className="py-12 space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Timer className="h-5 w-5 animate-pulse" />
              <p className="text-sm">
                FastF1 is loading telemetry data for the first time — this may
                take 30–60 seconds…
              </p>
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {isSubmitted && isError && !isLoading && (
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive font-semibold">
              Failed to load replay data
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This race may not have telemetry available, or the backend is
              still starting up.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Replay viewer */}
      {isSubmitted && !isLoading && replayData && trackData && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Circuit Map */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {replayData.year} — Round {replayData.race}
                </CardTitle>
                <span className="text-sm font-mono text-muted-foreground">
                  Lap {currentFrame?.lap ?? 0} / {replayData.total_laps}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Track SVG */}
              <div className="w-full bg-muted/20 rounded-lg overflow-hidden flex items-center justify-center">
                <CircuitMap
                  trackPoints={trackData.points}
                  drivers={driverMapPositions}
                  selectedDriver={selectedDriver}
                  width={600}
                  height={440}
                  padding={36}
                />
              </div>

              {/* Lap scrubber */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Lap 1</span>
                  <span>Lap {replayData.total_laps}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={replayData.frames.length - 1}
                  value={currentFrameIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentFrameIndex(Number.parseInt(e.target.value));
                  }}
                  className="w-full accent-primary"
                  aria-label="Lap scrubber"
                />
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRestart}
                    title="Restart"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStepBack}
                    title="Previous lap"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handlePlayPause}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStepForward}
                    title="Next lap"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Speed selector */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-1">
                    Speed
                  </span>
                  {PLAYBACK_OPTIONS.map((s) => (
                    <Button
                      key={s}
                      variant={playbackSpeed === s ? "default" : "outline"}
                      size="sm"
                      className="px-2 h-7 text-xs"
                      onClick={() => setPlaybackSpeed(s)}
                    >
                      {s}×
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Leaderboard</CardTitle>
              <CardDescription className="text-xs">
                Click a driver to highlight them
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {leaderboard.map((entry) => {
                  const color = entry.info?.color ?? "#888";
                  const isSelected = selectedDriver === entry.code;

                  return (
                    <button
                      key={entry.code}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent transition-colors ${isSelected ? "bg-accent" : ""}`}
                      onClick={() =>
                        setSelectedDriver(isSelected ? null : entry.code)
                      }
                    >
                      <span className="text-xs text-muted-foreground w-5 shrink-0 text-right font-mono">
                        {entry.position ?? "—"}
                      </span>
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-xs font-semibold w-8 shrink-0">
                        {entry.code}
                      </span>
                      <div className="flex-1 min-w-0 text-right">
                        {entry.compound && (
                          <CompoundBadge compound={entry.compound} />
                        )}
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatLapTime({ seconds: entry.lap_time_s })}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state — not yet loaded */}
      {!isSubmitted && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <Play className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-semibold">Select a race to begin</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a season and round above, then click Load Replay
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
