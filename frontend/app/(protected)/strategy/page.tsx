"use client";

import { PositionBadge } from "@/components/PositionBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { Award, Clock, Gauge, TrendingDown } from "lucide-react";
import { useState } from "react";

export default function StrategyPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [race, setRace] = useState<number>(1);

  // Get race schedule for race selection
  const { data: scheduleData } = useQuery({
    queryKey: ["schedule", year],
    queryFn: async () => {
      const response = await api.get(`/jolpica/schedule?season=${year}`);
      return response.data;
    },
  });

  // Get strategy analysis
  const {
    data: strategyData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["strategy", year, race],
    queryFn: async () => {
      const response = await api.get(`/strategy/race/${year}/${race}`);
      return response.data;
    },
    enabled: false,
  });

  const handleAnalyze = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Gauge className="h-10 w-10" />
          Pit Stop Strategy Analysis
        </h1>
        <p className="text-muted-foreground mt-2">
          Analyze tire strategies and pit stop decisions
        </p>
      </div>

      {/* Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Race to Analyze</CardTitle>
          <CardDescription>
            Choose a race to see detailed strategy analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy-year">Year</Label>
              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
              >
                <SelectTrigger id="strategy-year">
                  <SelectValue placeholder="Select year..." />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy-race">Race</Label>
              <Select
                value={String(race)}
                onValueChange={(v) => setRace(Number(v))}
              >
                <SelectTrigger id="strategy-race">
                  <SelectValue placeholder="Select race..." />
                </SelectTrigger>
                <SelectContent>
                  {scheduleData?.races.map((r: any) => (
                    <SelectItem key={r.round} value={String(r.round)}>
                      Round {r.round}: {r.raceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full"
          >
            <Gauge className="h-4 w-4 mr-2" />
            Analyze Strategy
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {/* Strategy Analysis Results */}
      {strategyData && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Strategy Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Drivers</p>
                  <p className="text-2xl font-bold">
                    {strategyData.summary.total_drivers}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fastest Compound
                  </p>
                  <p className="text-2xl font-bold">
                    {strategyData.summary.fastest_compound}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Strategy Types
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      Object.keys(strategyData.summary.strategy_distribution)
                        .length
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Most Common</p>
                  <p className="text-xl font-bold">
                    {
                      Object.entries(
                        strategyData.summary.strategy_distribution,
                      ).sort(([, a]: any, [, b]: any) => b - a)[0]?.[0]
                    }
                    -stop
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimal Strategies */}
          {strategyData.optimal_strategies && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Most Successful Strategies
                </CardTitle>
                <CardDescription>
                  Ranked by average finishing position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {strategyData.optimal_strategies.all_strategies.map(
                    (strategy: any, index: number) => (
                      <div
                        key={strategy.strategy}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <PositionBadge position={index + 1} size="lg" />
                          <div>
                            <p className="font-bold text-lg">
                              {strategy.strategy}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {strategy.drivers.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            P{strategy.avg_finishing_position.toFixed(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg Position
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compound Performance */}
          {strategyData.compound_performance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Tire Compound Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.values(strategyData.compound_performance).map(
                    (compound: any) => (
                      <div
                        key={compound.compound}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg">
                            {compound.compound}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {compound.total_laps} laps
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Avg Lap Time
                            </p>
                            <p className="font-bold font-mono">
                              {compound.avg_lap_time.toFixed(3)}s
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fastest Lap</p>
                            <p className="font-bold font-mono">
                              {compound.fastest_lap.toFixed(3)}s
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Slowest Lap</p>
                            <p className="font-bold font-mono">
                              {compound.slowest_lap.toFixed(3)}s
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pit Stop Timing */}
          {strategyData.pit_stop_timing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pit Stop Windows
                </CardTitle>
                <CardDescription>
                  Most common laps for pit stops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {strategyData.pit_stop_timing.most_common_windows.map(
                    (window: any) => (
                      <div
                        key={window.lap}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <span className="font-semibold">Lap {window.lap}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${window.count * 10}px` }}
                          ></div>
                          <span className="font-bold">
                            {window.count} stops
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Driver Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Driver-by-Driver Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategyData.driver_strategies.map((driver: any) => (
                  <div key={driver.driver} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                          {driver.driver}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {driver.strategy_name}
                        </span>
                      </div>
                      <span className="font-bold">
                        {driver.total_laps} laps
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {driver.stints.map((stint: any) => (
                        <div
                          key={`${driver.driver}-${stint.stint}`}
                          className="flex-1 p-2 rounded bg-secondary text-center"
                          title={`Stint ${stint.stint}: ${stint.compound}`}
                        >
                          <p className="text-xs font-semibold">
                            {stint.compound}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stint.num_laps} laps
                          </p>
                        </div>
                      ))}
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
