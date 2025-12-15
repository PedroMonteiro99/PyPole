"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LapTimesResponse, StintsResponse } from "@/lib/types";
import { LapTimeChart } from "@/components/LapTimeChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompoundColor, formatLapTime } from "@/lib/utils";

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
        { params: { session_type: sessionType } }
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
        { params: { session_type: sessionType } }
      );
      return response.data;
    },
    enabled: isSubmitted,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  // Get unique drivers from laps data
  const drivers = lapsData?.laps
    ? Array.from(new Set(lapsData.laps.map((lap) => lap.driver)))
    : [];

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
                <select
                  id="session"
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="FP1">FP1</option>
                  <option value="FP2">FP2</option>
                  <option value="FP3">FP3</option>
                  <option value="Q">Qualifying</option>
                  <option value="S">Sprint</option>
                  <option value="R">Race</option>
                </select>
              </div>
            </div>
            <Button type="submit">Load Data</Button>
          </form>
        </CardContent>
      </Card>

      {/* Analysis Content */}
      {isSubmitted && (
        <Tabs defaultValue="laps" className="space-y-6">
          <TabsList>
            <TabsTrigger value="laps">Lap Times</TabsTrigger>
            <TabsTrigger value="stints">Tire Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="laps">
            {lapsLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : lapsData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Lap Time Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <LapTimeChart laps={lapsData.laps} drivers={drivers.slice(0, 5)} />
                  <div className="mt-4 text-sm text-muted-foreground">
                    Showing top 5 drivers. Total laps: {lapsData.total_laps}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    Failed to load lap data
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stints">
            {stintsLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : stintsData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Tire Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-semibold">
                            Driver
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Stint
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Compound
                          </th>
                          <th className="px-4 py-3 text-center font-semibold">
                            Laps
                          </th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Avg Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stintsData.stints.map((stint, index) => (
                          <tr
                            key={`${stint.driver}-${stint.stint}`}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="px-4 py-3 font-medium">
                              {stint.driver}
                            </td>
                            <td className="px-4 py-3">{stint.stint}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCompoundColor(
                                  stint.compound
                                )}`}
                              >
                                {stint.compound || "Unknown"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {stint.num_laps} ({stint.start_lap}-{stint.end_lap})
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              {formatLapTime(stint.avg_lap_time)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    Failed to load stint data
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

