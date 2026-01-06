"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { getTeamColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Trophy, Timer, Flag, Gauge } from "lucide-react";
import { format } from "date-fns";

interface RaceWeekendData {
  year: number;
  round: number;
  race_info: any;
  sessions: any[];
  results: any;
  qualifying: any;
  fastest_laps: any;
  pit_stops: any;
  status: string;
}

export default function RaceWeekendPage() {
  const { data: weekendData, isLoading } = useQuery<RaceWeekendData>({
    queryKey: ["race-weekend", "current"],
    queryFn: async () => {
      const response = await api.get("/race-weekend/current");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!weekendData) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Race Weekend Hub</h1>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No upcoming race weekend found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const race = weekendData.race_info;
  const isUpcoming = weekendData.status === "upcoming";
  const isInProgress = weekendData.status === "in_progress";
  const isCompleted = weekendData.status === "completed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flag className="h-4 w-4" />
          <span>Round {weekendData.round}</span>
          <span>•</span>
          <span className="capitalize">{weekendData.status}</span>
        </div>
        <h1 className="text-4xl font-bold">{race.raceName}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{race.Circuit.Location.locality}, {race.Circuit.Location.country}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(race.date), "PPP")}</span>
          </div>
        </div>
      </div>

      {/* Circuit Info */}
      <Card>
        <CardHeader>
          <CardTitle>Circuit Information</CardTitle>
          <CardDescription>{race.Circuit.circuitName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coordinates</p>
              <p className="font-mono text-sm">{race.Circuit.Location.lat}, {race.Circuit.Location.long}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekend Schedule</CardTitle>
          <CardDescription>All sessions for this race weekend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weekendData.sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    session.type === 'race' ? 'bg-red-100 dark:bg-red-900' :
                    session.type === 'qualifying' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {session.type === 'race' ? <Trophy className="h-5 w-5" /> :
                     session.type === 'qualifying' ? <Timer className="h-5 w-5" /> :
                     <Flag className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold">{session.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.date && format(new Date(session.date), "PPP")}
                    </p>
                  </div>
                </div>
                {session.time && (
                  <div className="text-right">
                    <p className="font-mono font-semibold">{session.time}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      {(isCompleted || weekendData.qualifying || weekendData.results) && (
        <Tabs defaultValue="qualifying" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qualifying">Qualifying</TabsTrigger>
            <TabsTrigger value="race">Race Results</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="qualifying" className="mt-4">
            {weekendData.qualifying && weekendData.qualifying.QualifyingResults ? (
              <Card>
                <CardHeader>
                  <CardTitle>Qualifying Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weekendData.qualifying.QualifyingResults.map((result: any) => (
                      <div
                        key={result.position}
                        className="flex items-center gap-4 p-3 rounded-lg border"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                          {result.position}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {result.Driver.givenName} {result.Driver.familyName}
                          </p>
                          <p className="text-sm">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${getTeamColor(result.Constructor.name)}`}>
                              {result.Constructor.name}
                            </span>
                          </p>
                        </div>
                        {result.Q3 && (
                          <div className="font-mono text-lg font-bold">
                            {result.Q3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    Qualifying results not yet available
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="race" className="mt-4">
            {weekendData.results && weekendData.results.Results ? (
              <Card>
                <CardHeader>
                  <CardTitle>Race Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weekendData.results.Results.map((result: any) => (
                      <div
                        key={result.position}
                        className="flex items-center gap-4 p-3 rounded-lg border"
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                          result.position === '1' ? 'bg-yellow-500 text-white' :
                          result.position === '2' ? 'bg-gray-400 text-white' :
                          result.position === '3' ? 'bg-orange-600 text-white' :
                          'bg-primary text-primary-foreground'
                        }`}>
                          {result.position}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {result.Driver.givenName} {result.Driver.familyName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${getTeamColor(result.Constructor.name)}`}>
                              {result.Constructor.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Grid: {result.grid}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{result.points} pts</p>
                          {result.Time && (
                            <p className="text-sm text-muted-foreground font-mono">
                              {result.Time.time}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    Race results not yet available
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <div className="grid gap-4">
              {/* Fastest Lap */}
              {weekendData.fastest_laps?.race && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      Fastest Lap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{weekendData.fastest_laps.race.driver}</p>
                      <p className="text-3xl font-mono font-bold text-primary">
                        {weekendData.fastest_laps.race.lap_time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Lap {weekendData.fastest_laps.race.lap_number}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pit Stops */}
              {weekendData.pit_stops && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pit Stop Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Pit Stops</p>
                          <p className="text-2xl font-bold">{weekendData.pit_stops.total_stops}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

