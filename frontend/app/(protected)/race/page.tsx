"use client";

import { PitStopsChart } from "@/components/PitStopsChart";
import { PositionChart } from "@/components/PositionChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { LapTimesResponse, StintsResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function RaceAnalysisPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [race, setRace] = useState(1);
  const [sessionType, setSessionType] = useState("R");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: lapsData, isLoading: lapsLoading } = useQuery({
    queryKey: ["laps", year, race, sessionType],
    queryFn: async () => {
      const response = await api.get<LapTimesResponse>(
        `/fastf1/race/${year}/${race}/laps`,
        { params: { session_type: sessionType } },
      );
      return response.data;
    },
    enabled: isSubmitted,
  });

  const { data: stintsData, isLoading: stintsLoading } = useQuery({
    queryKey: ["stints", year, race, sessionType],
    queryFn: async () => {
      const response = await api.get<StintsResponse>(
        `/fastf1/race/${year}/${race}/stints`,
        { params: { session_type: sessionType } },
      );
      return response.data;
    },
    enabled: isSubmitted,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  // Calculate final positions for pit stops chart
  let finalPositions: { driver: string; position: number }[] = [];
  if (lapsData?.laps) {
    const lapNumbers = Array.from(
      new Set(lapsData.laps.map((lap) => lap.lap_number)),
    ).sort((a, b) => a - b);

    const lastLapNum = lapNumbers.at(-1);
    const lastLapData = lapsData.laps.filter(
      (lap) => lap.lap_number === lastLapNum,
    );

    const sortedDrivers = lastLapData
      .filter((lap) => lap.lap_time_seconds !== null)
      .sort((a, b) => (a.lap_time_seconds ?? 0) - (b.lap_time_seconds ?? 0));

    finalPositions = sortedDrivers.map((lap, index) => ({
      driver: lap.driver,
      position: index + 1,
    }));
  }

  let positionsContent;
  if (lapsLoading) {
    positionsContent = <Skeleton className="h-96 w-full" />;
  } else if (lapsData) {
    positionsContent = (
      <Card>
        <CardHeader>
          <CardTitle>Position Changes Throughout the Race</CardTitle>
        </CardHeader>
        <CardContent>
          <PositionChart laps={lapsData.laps} />
        </CardContent>
      </Card>
    );
  } else {
    positionsContent = (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Failed to load lap data
          </p>
        </CardContent>
      </Card>
    );
  }

  const lapNumberSet = Array.from(
    new Set(lapsData?.laps.map((lap) => lap.lap_number) ?? []),
  ).sort((a, b) => a - b);
  const maxLaps = lapNumberSet.length > 0 ? lapNumberSet.length : 60;

  let stintsContent;
  if (stintsLoading) {
    stintsContent = <Skeleton className="h-96 w-full" />;
  } else if (stintsData) {
    stintsContent = (
      <Card>
        <CardHeader>
          <CardTitle>Pit Stops &amp; Tire Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <PitStopsChart
            stints={stintsData.stints}
            maxLaps={maxLaps}
            finalPositions={finalPositions}
          />
        </CardContent>
      </Card>
    );
  } else {
    stintsContent = (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Failed to load stint data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Race Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Detailed lap times and telemetry data
        </p>
      </div>

      {/* Race Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Race</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={2018}
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="race">Round</Label>
                <Input
                  id="race"
                  type="number"
                  value={race}
                  onChange={(e) => setRace(Number(e.target.value))}
                  min={1}
                  max={24}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session">Session</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger id="session">
                    <SelectValue placeholder="Select session..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FP1">FP1</SelectItem>
                    <SelectItem value="FP2">FP2</SelectItem>
                    <SelectItem value="FP3">FP3</SelectItem>
                    <SelectItem value="Q">Qualifying</SelectItem>
                    <SelectItem value="S">Sprint</SelectItem>
                    <SelectItem value="R">Race</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">Load Data</Button>
          </form>
        </CardContent>
      </Card>

      {/* Analysis Content */}
      {isSubmitted && (
        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="positions">Position Changes</TabsTrigger>
            <TabsTrigger value="stints">Tire Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="positions">{positionsContent}</TabsContent>

          <TabsContent value="stints">{stintsContent}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
