"use client";

import { StintData } from "@/lib/types";
import { getCompoundColor } from "@/lib/utils";

interface PitStopsChartProps {
  stints: StintData[];
  maxLaps: number;
}

export function PitStopsChart({ stints, maxLaps }: PitStopsChartProps) {
  // Group stints by driver
  const driverStints = stints.reduce((acc, stint) => {
    if (!acc[stint.driver]) {
      acc[stint.driver] = [];
    }
    acc[stint.driver].push(stint);
    return acc;
  }, {} as Record<string, StintData[]>);

  // Sort drivers by their final position (sum of points, or alphabetically)
  const sortedDrivers = Object.keys(driverStints).sort();

  // Calculate the width scale (percentage per lap)
  const lapWidth = 100 / maxLaps;

  // Get compound display info
  const getCompoundInfo = (compound: string | null) => {
    if (!compound) return { color: "bg-gray-400", label: "UNK" };
    
    const comp = compound.toLowerCase();
    
    if (comp.includes("soft") && !comp.includes("medium") && !comp.includes("hard")) {
      return { color: "bg-red-500", label: "SOFT" };
    }
    if (comp.includes("medium")) {
      return { color: "bg-yellow-400", label: "MEDIUM" };
    }
    if (comp.includes("hard")) {
      return { color: "bg-gray-100 border border-gray-400", label: "HARD", textDark: true };
    }
    if (comp.includes("intermediate")) {
      return { color: "bg-green-500", label: "INT" };
    }
    if (comp.includes("wet")) {
      return { color: "bg-blue-500", label: "WET" };
    }
    
    return { color: "bg-gray-400", label: compound.slice(0, 3).toUpperCase() };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Pit Stops & Tire Strategy</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-red-500 rounded"></div>
            <span>Soft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-yellow-400 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-gray-100 border border-gray-400 rounded"></div>
            <span>Hard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-green-500 rounded"></div>
            <span>Intermediate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-blue-500 rounded"></div>
            <span>Wet</span>
          </div>
        </div>
      </div>

      {/* Lap number scale */}
      <div className="flex items-center gap-2">
        <div className="w-24 flex-shrink-0"></div>
        <div className="flex-1 relative h-6 border-b border-border">
          {Array.from({ length: Math.ceil(maxLaps / 10) + 1 }, (_, i) => i * 10)
            .filter((lap) => lap <= maxLaps)
            .map((lap) => (
              <div
                key={lap}
                className="absolute text-xs text-muted-foreground"
                style={{ left: `${(lap / maxLaps) * 100}%` }}
              >
                {lap}
              </div>
            ))}
        </div>
        <div className="w-12 flex-shrink-0 text-right text-xs text-muted-foreground">
          Used
        </div>
      </div>

      {/* Driver rows */}
      <div className="space-y-1">
        {sortedDrivers.map((driver) => {
          const driverStintsList = driverStints[driver].sort(
            (a, b) => a.stint - b.stint
          );
          
          // Calculate total laps used
          const totalLapsUsed = driverStintsList.reduce(
            (sum, stint) => sum + stint.num_laps,
            0
          );

          return (
            <div key={driver} className="flex items-center gap-2">
              {/* Driver name */}
              <div className="w-24 flex-shrink-0 text-sm font-medium truncate">
                {driver}
              </div>

              {/* Stint bars */}
              <div className="flex-1 relative h-10 bg-muted/30 rounded">
                {driverStintsList.map((stint, index) => {
                  const compoundInfo = getCompoundInfo(stint.compound);
                  const startPercent = ((stint.start_lap - 1) / maxLaps) * 100;
                  const widthPercent = (stint.num_laps / maxLaps) * 100;

                  return (
                    <div
                      key={`${driver}-${stint.stint}`}
                      className={`absolute h-full flex items-center justify-center ${compoundInfo.color} ${
                        compoundInfo.textDark ? "text-gray-800" : "text-white"
                      } text-xs font-bold transition-all hover:opacity-80 cursor-pointer`}
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      title={`${compoundInfo.label}: Laps ${stint.start_lap}-${stint.end_lap} (${stint.num_laps} laps)`}
                    >
                      {stint.num_laps > 3 && (
                        <span className="drop-shadow-sm">{stint.num_laps}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total laps used */}
              <div className="w-12 flex-shrink-0 text-right text-sm text-muted-foreground">
                {totalLapsUsed}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total pit stops count */}
      <div className="text-sm text-muted-foreground mt-4">
        <span className="font-semibold">Total Pit Stops:</span>{" "}
        {Object.values(driverStints).reduce(
          (total, stints) => total + stints.length - 1,
          0
        )}
      </div>
    </div>
  );
}

