"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { getTeamColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { GitCompare, Trophy, TrendingUp, Target } from "lucide-react";
import { useState } from "react";

export default function ComparisonPage() {
  const [driver1, setDriver1] = useState("");
  const [driver2, setDriver2] = useState("");
  const [compareMode, setCompareMode] = useState<"season" | "race">("season");
  const [season, setSeason] = useState(new Date().getFullYear());

  // Get all drivers for selection
  const { data: driversData } = useQuery({
    queryKey: ["drivers", season],
    queryFn: async () => {
      const response = await api.get(`/profiles/drivers?season=${season}`);
      return response.data;
    },
  });

  // Compare drivers
  const { data: comparisonData, isLoading: isComparing, refetch } = useQuery({
    queryKey: ["comparison", driver1, driver2, season],
    queryFn: async () => {
      if (!driver1 || !driver2) return null;
      const response = await api.get(
        `/comparison/drivers/season?driver1=${driver1}&driver2=${driver2}&season=${season}`
      );
      return response.data;
    },
    enabled: false,
  });

  const handleCompare = () => {
    if (driver1 && driver2) {
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <GitCompare className="h-10 w-10" />
          Head-to-Head Comparison
        </h1>
        <p className="text-muted-foreground mt-2">
          Compare two drivers across the season
        </p>
      </div>

      {/* Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Drivers to Compare</CardTitle>
          <CardDescription>Choose two drivers to see their head-to-head stats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Driver 1 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver 1</label>
              <select
                className="w-full p-2 border rounded-lg bg-background"
                value={driver1}
                onChange={(e) => setDriver1(e.target.value)}
              >
                <option value="">Select driver...</option>
                {driversData?.drivers.map((driver: any) => (
                  <option key={driver.driver_id} value={driver.driver_id}>
                    {driver.name} ({driver.code})
                  </option>
                ))}
              </select>
            </div>

            {/* VS */}
            <div className="flex items-end justify-center pb-2">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                VS
              </div>
            </div>

            {/* Driver 2 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver 2</label>
              <select
                className="w-full p-2 border rounded-lg bg-background"
                value={driver2}
                onChange={(e) => setDriver2(e.target.value)}
              >
                <option value="">Select driver...</option>
                {driversData?.drivers.map((driver: any) => (
                  <option key={driver.driver_id} value={driver.driver_id}>
                    {driver.name} ({driver.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={!driver1 || !driver2 || isComparing}
            className="w-full"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Compare Drivers
          </Button>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {isComparing && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {comparisonData && (
        <div className="space-y-6">
          {/* Driver Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Driver 1 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {comparisonData.driver1.info.givenName} {comparisonData.driver1.info.familyName}
                </CardTitle>
                <CardDescription>
                  <span className={`inline-block px-2 py-1 rounded ${getTeamColor(comparisonData.driver1.team?.name || "")}`}>
                    {comparisonData.driver1.team?.name || "N/A"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Championship Position</span>
                    <span className="text-2xl font-bold">P{comparisonData.driver1.position}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Points</span>
                    <span className="text-xl font-bold">{comparisonData.driver1.points}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wins</span>
                    <span className="text-xl font-bold">{comparisonData.driver1.wins}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver 2 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {comparisonData.driver2.info.givenName} {comparisonData.driver2.info.familyName}
                </CardTitle>
                <CardDescription>
                  <span className={`inline-block px-2 py-1 rounded ${getTeamColor(comparisonData.driver2.team?.name || "")}`}>
                    {comparisonData.driver2.team?.name || "N/A"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Championship Position</span>
                    <span className="text-2xl font-bold">P{comparisonData.driver2.position}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Points</span>
                    <span className="text-xl font-bold">{comparisonData.driver2.points}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wins</span>
                    <span className="text-xl font-bold">{comparisonData.driver2.wins}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Head-to-Head Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Head-to-Head Statistics
              </CardTitle>
              <CardDescription>Direct comparison in races both drivers competed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Win Comparison */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Races Compared</span>
                    <span className="font-bold">{comparisonData.head_to_head.races_compared}</span>
                  </div>
                  
                  <div className="flex gap-2 h-8">
                    <div
                      className="bg-blue-500 rounded-l flex items-center justify-center text-white font-bold text-sm"
                      style={{ width: `${comparisonData.head_to_head.driver1_percentage}%` }}
                    >
                      {comparisonData.head_to_head.driver1_wins}
                    </div>
                    <div
                      className="bg-red-500 rounded-r flex items-center justify-center text-white font-bold text-sm"
                      style={{ width: `${comparisonData.head_to_head.driver2_percentage}%` }}
                    >
                      {comparisonData.head_to_head.driver2_wins}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-blue-500 font-semibold">
                      {comparisonData.driver1.info.familyName}: {comparisonData.head_to_head.driver1_percentage}%
                    </span>
                    <span className="text-red-500 font-semibold">
                      {comparisonData.driver2.info.familyName}: {comparisonData.head_to_head.driver2_percentage}%
                    </span>
                  </div>
                </div>

                {/* Points Comparison */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-blue-500">
                      {comparisonData.head_to_head.total_points_driver1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comparisonData.driver1.info.familyName} Points
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                      {Math.abs(comparisonData.head_to_head.points_difference)}
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-500">
                      {comparisonData.head_to_head.total_points_driver2}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comparisonData.driver2.info.familyName} Points
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Race-by-Race */}
          <Card>
            <CardHeader>
              <CardTitle>Race-by-Race Comparison</CardTitle>
              <CardDescription>Detailed breakdown of each race</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comparisonData.race_by_race.map((race: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{race.race}</p>
                      <span className="text-xs text-muted-foreground">Round {race.round}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className={`p-2 rounded ${race.winner === comparisonData.driver1.id ? 'bg-blue-100 dark:bg-blue-900' : ''}`}>
                        <div className="flex justify-between">
                          <span className="font-semibold">
                            {comparisonData.driver1.info.familyName}
                          </span>
                          <span className="font-bold">P{race.driver1.position}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Grid: {race.driver1.grid}</span>
                          <span>{race.driver1.points} pts</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded ${race.winner === comparisonData.driver2.id ? 'bg-red-100 dark:bg-red-900' : ''}`}>
                        <div className="flex justify-between">
                          <span className="font-semibold">
                            {comparisonData.driver2.info.familyName}
                          </span>
                          <span className="font-bold">P{race.driver2.position}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Grid: {race.driver2.grid}</span>
                          <span>{race.driver2.points} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

