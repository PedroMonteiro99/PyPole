"use client";

import { StintData } from "@/lib/types";
import { useMemo } from "react";

interface PitStopsChartProps {
  stints: StintData[];
  maxLaps: number;
  finalPositions?: { driver: string; position: number }[];
}

export function PitStopsChart({
  stints,
  maxLaps,
  finalPositions,
}: PitStopsChartProps) {
  // Merge consecutive stints with the same compound
  interface MergedStint {
    driver: string;
    compound: string | null;
    start_lap: number;
    end_lap: number;
    num_laps: number;
  }

  // Group stints by driver and merge consecutive stints with same compound
  const { driverStints, sortedDrivers } = useMemo(() => {
    const grouped = stints.reduce((acc, stint) => {
      if (!acc[stint.driver]) {
        acc[stint.driver] = [];
      }
      acc[stint.driver].push(stint);
      return acc;
    }, {} as Record<string, StintData[]>);

    // For each driver, merge consecutive stints with same compound
    const merged: Record<string, MergedStint[]> = {};

    Object.keys(grouped).forEach((driver) => {
      const driverStintsList = grouped[driver].sort(
        (a, b) => a.start_lap - b.start_lap
      );
      const mergedStints: MergedStint[] = [];

      driverStintsList.forEach((stint) => {
        const lastMerged = mergedStints[mergedStints.length - 1];

        // Check if we can merge with the previous stint
        if (
          lastMerged &&
          lastMerged.compound === stint.compound &&
          lastMerged.end_lap + 1 === stint.start_lap
        ) {
          // Merge with previous stint
          lastMerged.end_lap = stint.end_lap;
          lastMerged.num_laps = lastMerged.end_lap - lastMerged.start_lap + 1;
        } else {
          // Create new merged stint
          mergedStints.push({
            driver: stint.driver,
            compound: stint.compound,
            start_lap: stint.start_lap,
            end_lap: stint.end_lap,
            num_laps: stint.num_laps,
          });
        }
      });

      merged[driver] = mergedStints;
    });

    // Sort drivers by final position if provided, otherwise alphabetically
    let sorted = Object.keys(merged);

    if (finalPositions && finalPositions.length > 0) {
      const positionMap = new Map(
        finalPositions.map((fp) => [fp.driver, fp.position])
      );
      sorted = sorted.sort((a, b) => {
        const posA = positionMap.get(a) || 999;
        const posB = positionMap.get(b) || 999;
        return posA - posB;
      });
    } else {
      sorted = sorted.sort();
    }

    return { driverStints: merged, sortedDrivers: sorted };
  }, [stints, finalPositions]);

  // Get compound styling
  const getCompoundStyle = (compound: string | null) => {
    if (!compound) return { bg: "#9CA3AF", text: "#FFFFFF", label: "UNKNOWN" };

    const comp = compound.toLowerCase();

    // Pirelli compound colors (official F1 style)
    if (
      comp.includes("soft") &&
      !comp.includes("medium") &&
      !comp.includes("hard")
    ) {
      return { bg: "#E10600", text: "#FFFFFF", label: "SOFT", border: false };
    }
    if (comp.includes("medium")) {
      return { bg: "#FCD116", text: "#000000", label: "MEDIUM", border: false };
    }
    if (comp.includes("hard")) {
      return { bg: "#F0F0F0", text: "#000000", label: "HARD", border: true };
    }
    if (comp.includes("intermediate")) {
      return {
        bg: "#2ECC71",
        text: "#FFFFFF",
        label: "INTERMEDIATE",
        border: false,
      };
    }
    if (comp.includes("wet")) {
      return { bg: "#2E5CFF", text: "#FFFFFF", label: "WET", border: false };
    }

    return {
      bg: "#9CA3AF",
      text: "#FFFFFF",
      label: compound.toUpperCase(),
      border: false,
    };
  };

  // Calculate each driver's actual last lap for proper width calculation
  const driverMaxLaps = useMemo(() => {
    const maxLapsMap: Record<string, number> = {};
    Object.keys(driverStints).forEach((driver) => {
      const stints = driverStints[driver];
      const lastLap = Math.max(...stints.map((s) => s.end_lap));
      maxLapsMap[driver] = lastLap;
    });
    return maxLapsMap;
  }, [driverStints]);

  return (
    <div className="w-full bg-background">
      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-4 pb-4 border-b">
        <span className="text-sm font-semibold text-foreground">
          Tire Compounds:
        </span>
        {[
          { bg: "#E10600", text: "#FFFFFF", label: "SOFT" },
          { bg: "#FCD116", text: "#000000", label: "MEDIUM" },
          { bg: "#F0F0F0", text: "#000000", label: "HARD", border: true },
          { bg: "#2ECC71", text: "#FFFFFF", label: "INTERMEDIATE" },
          { bg: "#2E5CFF", text: "#FFFFFF", label: "WET" },
        ].map((compound) => (
          <div key={compound.label} className="flex items-center gap-2">
            <div
              className="w-8 h-5 rounded-sm"
              style={{
                backgroundColor: compound.bg,
                border: compound.border ? "1px solid #999" : "none",
              }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {compound.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart Container */}
      <div className="space-y-0 bg-card rounded-lg border p-4">
        {/* Header Row */}
        <div className="flex items-center mb-4 pb-2 border-b">
          <div className="w-16 flex-shrink-0 text-xs font-bold text-muted-foreground uppercase">
            Pos
          </div>
          <div className="w-20 flex-shrink-0 text-xs font-bold text-muted-foreground uppercase">
            Driver
          </div>
          <div className="flex-1 text-xs font-bold text-muted-foreground uppercase text-center">
            Tire Strategy
          </div>
          <div className="w-16 flex-shrink-0 text-xs font-bold text-muted-foreground text-right uppercase">
            Stops
          </div>
        </div>

        {/* Driver Rows */}
        <div className="space-y-1">
          {sortedDrivers.map((driver, driverIndex) => {
            const driverStintsList = driverStints[driver];
            const pitStops = driverStintsList.length - 1;
            const driverLastLap = driverMaxLaps[driver];

            // Get driver position
            const driverPosition =
              finalPositions?.find((fp) => fp.driver === driver)?.position ||
              driverIndex + 1;

            const isRetired = driverLastLap < maxLaps;

            console.log(driverLastLap, maxLaps, driver);

            return (
              <div
                key={driver}
                className="flex items-center group hover:bg-muted/50 transition-colors py-1"
              >
                {/* Position */}
                <div className="w-16 flex-shrink-0 pr-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isRetired ? "DNF" : `P${driverPosition}`}
                  </span>
                </div>

                {/* Driver Code */}
                <div className="w-20 flex-shrink-0 pr-3">
                  <span className="text-sm font-bold text-foreground">
                    {driver}
                  </span>
                </div>

                {/* Tire Strategy Timeline */}
                <div className="flex-1 relative h-10 bg-muted/30 rounded">
                  {/* Stint bars */}
                  {driverStintsList.map((stint, stintIndex) => {
                    const compoundStyle = getCompoundStyle(stint.compound);
                    // Calculate based on driver's own race distance for full width
                    const leftPercent =
                      ((stint.start_lap - 1) / driverLastLap) * 100;
                    const widthPercent = (stint.num_laps / driverLastLap) * 100;

                    return (
                      <div
                        key={`${driver}-stint-${stintIndex}`}
                        className="absolute top-0 h-full group/stint cursor-pointer transition-all hover:brightness-110 hover:scale-105 hover:z-10 rounded-sm"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          backgroundColor: compoundStyle.bg,
                          color: compoundStyle.text,
                          border: compoundStyle.border
                            ? "1px solid #999"
                            : "none",
                        }}
                      >
                        {/* Compound separator */}
                        {stintIndex < driverStintsList.length - 1 && (
                          <div className="absolute right-0 top-0 h-full w-[2px] bg-background/80" />
                        )}

                        {/* Lap count */}
                        {stint.num_laps > 2 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold tracking-tight drop-shadow-md">
                              {stint.num_laps}
                            </span>
                          </div>
                        )}

                        {/* Hover tooltip */}
                        <div className="invisible group-hover/stint:visible absolute -top-20 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl z-30">
                          <div className="font-bold text-sm mb-1">
                            {compoundStyle.label}
                          </div>
                          <div className="text-[11px] opacity-90">
                            Laps {stint.start_lap}-{stint.end_lap}
                          </div>
                          <div className="text-[11px] font-semibold mt-1">
                            {stint.num_laps} lap
                            {stint.num_laps !== 1 ? "s" : ""}
                          </div>
                          {isRetired &&
                            stintIndex === driverStintsList.length - 1 && (
                              <div className="text-[10px] text-destructive font-semibold mt-1">
                                DNF
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pit Stop Count */}
                <div className="w-16 flex-shrink-0 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold">
                    {pitStops}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
        <div>
          <span className="font-semibold">Total Drivers:</span>{" "}
          {sortedDrivers.length}
        </div>
        <div>
          <span className="font-semibold">Total Pit Stops:</span>{" "}
          {Object.values(driverStints).reduce(
            (total, stints) => total + stints.length - 1,
            0
          )}
        </div>
        <div>
          <span className="font-semibold">Race Distance:</span> {maxLaps} laps
        </div>
      </div>
    </div>
  );
}
