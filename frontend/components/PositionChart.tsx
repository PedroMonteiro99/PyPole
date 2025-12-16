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

interface PositionChartProps {
  laps: LapData[];
  drivers: string[];
}

export function PositionChart({ laps, drivers }: PositionChartProps) {
  // Get unique lap numbers
  const lapNumbers = Array.from(new Set(laps.map((lap) => lap.lap_number))).sort(
    (a, b) => a - b
  );

  // Calculate position for each driver on each lap based on lap time
  const chartData = lapNumbers.map((lapNum) => {
    const lapsInThisLap = laps.filter((lap) => lap.lap_number === lapNum);
    
    // Sort by lap time to determine positions
    const sortedLaps = lapsInThisLap
      .filter((lap) => lap.lap_time_seconds !== null)
      .sort((a, b) => (a.lap_time_seconds || 0) - (b.lap_time_seconds || 0));
    
    const dataPoint: any = { lap: lapNum };
    
    // Assign positions based on sorted lap times
    sortedLaps.forEach((lap, index) => {
      if (drivers.includes(lap.driver)) {
        dataPoint[lap.driver] = index + 1;
      }
    });
    
    return dataPoint;
  });

  // Driver colors - F1 team colors
  const driverColors = [
    "#1E3A8A", // Blue
    "#DC2626", // Red
    "#059669", // Green
    "#D97706", // Orange
    "#7C3AED", // Purple
    "#EC4899", // Pink
    "#0891B2", // Cyan
    "#65A30D", // Lime
    "#F59E0B", // Amber
    "#8B5CF6", // Violet
  ];

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="lap"
          label={{ value: "Lap Number", position: "insideBottom", offset: -5 }}
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
        {drivers.map((driver, index) => (
          <Line
            key={driver}
            type="monotone"
            dataKey={driver}
            stroke={driverColors[index % driverColors.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

