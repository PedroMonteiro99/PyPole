"use client";

import { useMemo } from "react";
import { StintData } from "@/lib/types";

interface PitStopsChartProps {
  stints: StintData[];
  maxLaps: number;
}

export function PitStopsChart({ stints, maxLaps }: PitStopsChartProps) {
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
      const driverStintsList = grouped[driver].sort((a, b) => a.start_lap - b.start_lap);
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

    // Sort drivers alphabetically for now (could be by race position if available)
    const sorted = Object.keys(merged).sort();

    return { driverStints: merged, sortedDrivers: sorted };
  }, [stints]);

  // Get compound styling
  const getCompoundStyle = (compound: string | null) => {
    if (!compound) return { bg: "#9CA3AF", text: "#FFFFFF", label: "UNKNOWN" };

    const comp = compound.toLowerCase();

    // Pirelli compound colors (official F1 style)
    if (comp.includes("soft") && !comp.includes("medium") && !comp.includes("hard")) {
      return { bg: "#E10600", text: "#FFFFFF", label: "SOFT", border: false };
    }
    if (comp.includes("medium")) {
      return { bg: "#FCD116", text: "#000000", label: "MEDIUM", border: false };
    }
    if (comp.includes("hard")) {
      return { bg: "#F0F0F0", text: "#000000", label: "HARD", border: true };
    }
    if (comp.includes("intermediate")) {
      return { bg: "#2ECC71", text: "#FFFFFF", label: "INTERMEDIATE", border: false };
    }
    if (comp.includes("wet")) {
      return { bg: "#2E5CFF", text: "#FFFFFF", label: "WET", border: false };
    }

    return { bg: "#9CA3AF", text: "#FFFFFF", label: compound.toUpperCase(), border: false };
  };

  // Generate lap markers (every 5 laps)
  const lapMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i <= maxLaps; i += 5) {
      markers.push(i);
    }
    return markers;
  }, [maxLaps]);

  return (
    <div className="w-full bg-background">
      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-4 pb-4 border-b">
        <span className="text-sm font-semibold text-foreground">Tire Compounds:</span>
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
            <span className="text-xs font-medium text-muted-foreground">{compound.label}</span>
          </div>
        ))}
      </div>

      {/* Chart Container */}
      <div className="space-y-0 bg-card rounded-lg border p-4">
        {/* Header Row */}
        <div className="flex items-center mb-2">
          <div className="w-20 flex-shrink-0 text-xs font-bold text-muted-foreground uppercase">
            Driver
          </div>
          <div className="flex-1 relative h-6">
            {/* Lap number markers */}
            {lapMarkers.map((lap) => (
              <div
                key={lap}
                className="absolute flex flex-col items-center"
                style={{ left: `${(lap / maxLaps) * 100}%` }}
              >
                <div className="text-[10px] font-medium text-muted-foreground">{lap}</div>
                <div className="w-px h-2 bg-border" />
              </div>
            ))}
          </div>
          <div className="w-16 flex-shrink-0 text-xs font-bold text-muted-foreground text-right uppercase">
            Stops
          </div>
        </div>

        {/* Driver Rows */}
        <div className="space-y-[2px]">
          {sortedDrivers.map((driver, driverIndex) => {
            const driverStintsList = driverStints[driver];
            const pitStops = driverStintsList.length - 1;

            return (
              <div
                key={driver}
                className="flex items-center group hover:bg-muted/50 transition-colors"
              >
                {/* Driver Code */}
                <div className="w-20 flex-shrink-0 pr-2">
                  <span className="text-sm font-bold text-foreground">{driver}</span>
                </div>

                {/* Tire Strategy Timeline */}
                <div className="flex-1 relative h-8">
                  {/* Background grid lines */}
                  {lapMarkers.map((lap) => (
                    <div
                      key={lap}
                      className="absolute h-full w-px bg-border/30"
                      style={{ left: `${(lap / maxLaps) * 100}%` }}
                    />
                  ))}

                  {/* Stint bars */}
                  {driverStintsList.map((stint, stintIndex) => {
                    const compoundStyle = getCompoundStyle(stint.compound);
                    const leftPercent = ((stint.start_lap - 1) / maxLaps) * 100;
                    const widthPercent = (stint.num_laps / maxLaps) * 100;

                    return (
                      <div
                        key={`${driver}-stint-${stintIndex}`}
                        className="absolute top-0 h-full group/stint cursor-pointer transition-all hover:brightness-110 hover:z-10 border-r-2 border-background"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          backgroundColor: compoundStyle.bg,
                          color: compoundStyle.text,
                          border: compoundStyle.border ? "1px solid #999" : "none",
                          borderRight: stintIndex < driverStintsList.length - 1 ? "2px solid hsl(var(--background))" : "none",
                        }}
                        title={`${compoundStyle.label}: Lap ${stint.start_lap}-${stint.end_lap} (${stint.num_laps} laps)`}
                      >
                        {/* Lap count */}
                        {stint.num_laps > 2 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[11px] font-bold tracking-tight drop-shadow-sm">
                              {stint.num_laps}
                            </span>
                          </div>
                        )}

                        {/* Hover tooltip */}
                        <div className="invisible group-hover/stint:visible absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border rounded px-3 py-2 text-xs whitespace-nowrap shadow-lg z-20">
                          <div className="font-bold text-sm mb-1">{compoundStyle.label}</div>
                          <div className="text-[11px] opacity-90">
                            Laps {stint.start_lap}-{stint.end_lap}
                          </div>
                          <div className="text-[11px] font-semibold mt-1">
                            {stint.num_laps} lap{stint.num_laps !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pit Stop Count */}
                <div className="w-16 flex-shrink-0 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-foreground text-xs font-bold">
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
          <span className="font-semibold">Total Drivers:</span> {sortedDrivers.length}
        </div>
        <div>
          <span className="font-semibold">Total Pit Stops:</span>{" "}
          {Object.values(driverStints).reduce((total, stints) => total + stints.length - 1, 0)}
        </div>
        <div>
          <span className="font-semibold">Race Distance:</span> {maxLaps} laps
        </div>
      </div>
    </div>
  );
}

