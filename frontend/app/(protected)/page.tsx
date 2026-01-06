"use client";

import { RaceCard } from "@/components/RaceCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNextRace } from "@/hooks/useNextRace";
import { useDriverStandings } from "@/hooks/useStandings";
import { getTeamColor } from "@/lib/utils";
import { Calendar, Flag, Trophy } from "lucide-react";

export default function HomePage() {
  const { data: nextRaceData, isLoading: nextRaceLoading } = useNextRace();
  const { data: standingsData, isLoading: standingsLoading } =
    useDriverStandings();

  const topDrivers = standingsData?.standings.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to PyPole F1 Analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Season
            </CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date().getFullYear()}</div>
            <p className="text-xs text-muted-foreground">
              Formula 1 World Championship
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Race</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextRaceLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {nextRaceData?.race
                    ? `Round ${nextRaceData.race.round}`
                    : "TBD"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextRaceData?.race?.raceName || "No upcoming races"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Championship Leader
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {standingsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {topDrivers[0]?.Driver.code || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {topDrivers[0]?.points || "0"} points
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Race */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Next Race</h2>
        {nextRaceLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : nextRaceData?.race ? (
          <RaceCard race={nextRaceData.race} />
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No upcoming races scheduled
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top 5 Drivers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Championship Top 5</h2>
        {standingsLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Driver Standings</CardTitle>
              <CardDescription>Current season top 5 drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDrivers.map((standing, index) => (
                  <div
                    key={standing.Driver.driverId}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {standing.Driver.givenName} {standing.Driver.familyName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${getTeamColor(
                            standing.Constructors[0]?.name || ""
                          )}`}
                        >
                          {standing.Constructors[0]?.name || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{standing.points}</div>
                      <div className="text-xs text-muted-foreground">
                        {standing.wins} wins
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
