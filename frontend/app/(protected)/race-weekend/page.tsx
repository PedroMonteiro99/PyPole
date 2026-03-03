"use client";

import { PositionBadge } from "@/components/PositionBadge";
import { TeamBadge } from "@/components/TeamBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Flag, Gauge, MapPin, Trophy } from "lucide-react";

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
            <span>
              {race.Circuit.Location.locality}, {race.Circuit.Location.country}
            </span>
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
              <p className="font-medium">
                {race.Circuit.Location.locality},{" "}
                {race.Circuit.Location.country}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coordinates</p>
              <p className="font-mono text-sm">
                {race.Circuit.Location.lat}, {race.Circuit.Location.long}
              </p>
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
            {weekendData.sessions.map((session) => (
              <div
                key={session.name}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                    {session.type === "race" ? (
                      <Trophy className="h-5 w-5 text-primary" />
                    ) : (
                      <Flag className="h-5 w-5 text-muted-foreground" />
                    )}
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
                    <p className="font-mono font-semibold">
                      {(() => {
                        try {
                          const dateStr = session.date
                            ? `${session.date}T${session.time}`
                            : session.time;
                          const d = new Date(dateStr);
                          return Number.isNaN(d.getTime())
                            ? session.time
                            : format(d, "HH:mm 'UTC'xxx");
                        } catch {
                          return session.time;
                        }
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const dateStr = session.date
                            ? `${session.date}T${session.time}`
                            : session.time;
                          const d = new Date(dateStr);
                          return Number.isNaN(d.getTime())
                            ? ""
                            : format(d, "h:mm a");
                        } catch {
                          return "";
                        }
                      })()}
                    </p>
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
            {weekendData.qualifying?.QualifyingResults ? (
              <Card>
                <CardHeader>
                  <CardTitle>Qualifying Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weekendData.qualifying.QualifyingResults.map(
                      (result: any) => (
                        <div
                          key={result.position}
                          className="flex items-center gap-4 p-3 rounded-lg border"
                        >
                          <PositionBadge position={result.position} size="md" />
                          <div className="flex-1">
                            <p className="font-semibold">
                              {result.Driver.givenName}{" "}
                              {result.Driver.familyName}
                            </p>
                            <TeamBadge
                              teamName={result.Constructor.name}
                              size="xs"
                            />
                          </div>
                          {result.Q3 && (
                            <div className="font-mono text-lg font-bold">
                              {result.Q3}
                            </div>
                          )}
                        </div>
                      ),
                    )}
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
            {weekendData.results?.Results ? (
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
                        <PositionBadge position={result.position} size="md" />
                        <div className="flex-1">
                          <p className="font-semibold">
                            {result.Driver.givenName} {result.Driver.familyName}
                          </p>
                          <div className="flex items-center gap-2">
                            <TeamBadge
                              teamName={result.Constructor.name}
                              size="xs"
                            />
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
                      <p className="text-2xl font-bold">
                        {weekendData.fastest_laps.race.driver}
                      </p>
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
                          <p className="text-sm text-muted-foreground">
                            Total Pit Stops
                          </p>
                          <p className="text-2xl font-bold">
                            {weekendData.pit_stops.total_stops}
                          </p>
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
