"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LapData } from "@/lib/types";
import { formatLapTime } from "@/lib/utils";

interface LapTimeChartProps {
  laps: LapData[];
  drivers?: string[];
}

export function LapTimeChart({ laps, drivers }: LapTimeChartProps) {
  // Filter by selected drivers if provided
  const filteredLaps = drivers
    ? laps.filter((lap) => drivers.includes(lap.driver))
    : laps;

  // Group laps by driver
  const driverLaps = filteredLaps.reduce((acc, lap) => {
    if (!acc[lap.driver]) {
      acc[lap.driver] = [];
    }
    acc[lap.driver].push(lap);
    return acc;
  }, {} as Record<string, LapData[]>);

  // Get all lap numbers
  const allLapNumbers = Array.from(
    new Set(filteredLaps.map((lap) => lap.lap_number))
  ).sort((a, b) => a - b);

  // Create chart data
  const chartData = allLapNumbers.map((lapNumber) => {
    const point: any = { lap: lapNumber };
    Object.keys(driverLaps).forEach((driver) => {
      const lap = driverLaps[driver].find((l) => l.lap_number === lapNumber);
      point[driver] = lap?.lap_time_seconds || null;
    });
    return point;
  });

  // Colors for different drivers
  const colors = [
    "#e8002d",
    "#3671c6",
    "#27f4d2",
    "#ff8000",
    "#229971",
    "#ff87bc",
    "#64c4ff",
    "#6692ff",
    "#52e252",
    "#b6babd",
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="lap"
          label={{ value: "Lap Number", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          label={{ value: "Lap Time (s)", angle: -90, position: "insideLeft" }}
          tickFormatter={(value) => value.toFixed(1)}
        />
        <Tooltip
          formatter={(value: any) =>
            value ? formatLapTime(value) : "No time"
          }
          labelFormatter={(label) => `Lap ${label}`}
        />
        <Legend />
        {Object.keys(driverLaps).map((driver, index) => (
          <Line
            key={driver}
            type="monotone"
            dataKey={driver}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

