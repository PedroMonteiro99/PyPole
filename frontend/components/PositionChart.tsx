"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LapData } from "@/lib/types";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PositionChartProps {
  laps: LapData[];
}

export function PositionChart({ laps }: PositionChartProps) {
  // Get unique lap numbers
  const lapNumbers = Array.from(
    new Set(laps.map((lap) => lap.lap_number))
  ).sort((a, b) => a - b);

  // Calculate cumulative positions for each driver across all laps
  const { chartData, allDrivers, finalPositions } = useMemo(() => {
    const data = lapNumbers.map((lapNum) => {
      const lapsInThisLap = laps.filter((lap) => lap.lap_number === lapNum);

      // Sort by cumulative time to determine real positions
      const sortedLaps = lapsInThisLap
        .filter((lap) => lap.lap_time_seconds !== null)
        .sort((a, b) => (a.lap_time_seconds || 0) - (b.lap_time_seconds || 0));

      const dataPoint: any = { lap: lapNum };

      sortedLaps.forEach((lap, index) => {
        dataPoint[lap.driver] = index + 1;
      });

      return dataPoint;
    });

    // Get all unique drivers
    const drivers = Array.from(new Set(laps.map((lap) => lap.driver)));

    // Calculate final positions (last lap)
    const finalLap = data[data.length - 1];
    const positions = drivers
      .map((driver) => ({
        driver,
        position: finalLap[driver] || 999,
      }))
      .sort((a, b) => a.position - b.position);

    return {
      chartData: data,
      allDrivers: drivers.sort(),
      finalPositions: positions,
    };
  }, [laps, lapNumbers]);

  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(
    finalPositions.slice(0, 5).map((d) => d.driver)
  );
  const [numDrivers, setNumDrivers] = useState(5);

  // Update selected drivers when numDrivers changes
  const handleNumDriversChange = (num: number) => {
    setNumDrivers(num);
    setSelectedDrivers(finalPositions.slice(0, num).map((d) => d.driver));
  };

  // Toggle individual driver
  const toggleDriver = (driver: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(driver)
        ? prev.filter((d) => d !== driver)
        : [...prev, driver]
    );
  };

  // Driver colors - F1 team colors
  const driverColors: Record<string, string> = {
    VER: "#1E3A8A",
    HAM: "#00D2BE",
    LEC: "#DC0000",
    SAI: "#DC0000",
    PER: "#1E3A8A",
    RUS: "#00D2BE",
    NOR: "#FF8700",
    PIA: "#FF8700",
    ALO: "#006F62",
    STR: "#006F62",
    OCO: "#0090FF",
    GAS: "#0090FF",
    BOT: "#900000",
    ZHO: "#900000",
    ALB: "#005AFF",
    SAR: "#005AFF",
    MAG: "#FFFFFF",
    HUL: "#FFFFFF",
    TSU: "#2B4562",
    RIC: "#2B4562",
  };

  const getDriverColor = (driver: string, index: number) => {
    return (
      driverColors[driver] ||
      `hsl(${(index * 360) / allDrivers.length}, 70%, 50%)`
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Show top:</Label>
          <div className="flex gap-2">
            {[3, 5, 10].map((num) => (
              <Button
                key={num}
                variant={numDrivers === num ? "default" : "outline"}
                size="sm"
                onClick={() => handleNumDriversChange(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedDrivers.length} driver
          {selectedDrivers.length !== 1 ? "s" : ""} selected
        </div>
      </div>

      {/* Driver Selection Grid */}
      <div className="border rounded-lg p-4">
        <Label className="text-sm font-medium mb-3 block">
          Select Drivers:
        </Label>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {allDrivers.map((driver) => (
            <Button
              key={driver}
              variant={selectedDrivers.includes(driver) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleDriver(driver)}
              className="text-xs"
            >
              {driver}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="lap"
            label={{
              value: "Lap Number",
              position: "insideBottom",
              offset: -5,
            }}
            className="text-xs"
          />
          <YAxis
            reversed
            domain={[1, 20]}
            label={{ value: "Position", angle: -90, position: "insideLeft" }}
            className="text-xs"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          {selectedDrivers.map((driver, index) => (
            <Line
              key={driver}
              type="monotone"
              dataKey={driver}
              stroke={getDriverColor(driver, allDrivers.indexOf(driver))}
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
