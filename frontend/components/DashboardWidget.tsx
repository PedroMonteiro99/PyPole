"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeamColor } from "@/lib/utils";
import { Calendar, Trophy, Users, Flag, Gauge } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface DashboardWidgetProps {
  widgetId: string;
  data: any;
  isLoading?: boolean;
}

export function DashboardWidget({ widgetId, data, isLoading }: DashboardWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data?.error || "Failed to load widget data"}
          </p>
        </CardContent>
      </Card>
    );
  }

  switch (widgetId) {
    case "next_race":
      return <NextRaceWidget data={data.data} />;
    case "driver_standings":
      return <DriverStandingsWidget data={data.data} />;
    case "constructor_standings":
      return <ConstructorStandingsWidget data={data.data} />;
    case "favorite_driver":
      return <FavoriteDriverWidget data={data.data} />;
    case "favorite_team":
      return <FavoriteTeamWidget data={data.data} />;
    case "championship_leader":
      return <ChampionshipLeaderWidget data={data.data} />;
    case "fastest_lap":
      return <FastestLapWidget data={data.data} />;
    default:
      return null;
  }
}

function NextRaceWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Link href="/race-weekend">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Next Race
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-bold mb-2">{data.raceName}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              {data.Circuit.Location.locality}, {data.Circuit.Location.country}
            </p>
            <p className="font-semibold">
              {format(new Date(data.date), "PPP")}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DriverStandingsWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Link href="/standings">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Driver Standings
          </CardTitle>
          <CardDescription>Top 5</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.standings.slice(0, 5).map((standing: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold w-6">P{standing.position}</span>
                  <span className="text-sm">{standing.Driver.familyName}</span>
                </div>
                <span className="font-bold">{standing.points}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ConstructorStandingsWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Link href="/standings">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Constructor Standings
          </CardTitle>
          <CardDescription>Top 5</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.standings.slice(0, 5).map((standing: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold w-6">P{standing.position}</span>
                  <span className={`text-sm px-2 py-0.5 rounded ${getTeamColor(standing.Constructor.name)}`}>
                    {standing.Constructor.name}
                  </span>
                </div>
                <span className="font-bold">{standing.points}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FavoriteDriverWidget({ data }: { data: any }) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Favorite Driver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set your favorite driver in settings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/drivers/${data.driver.driverId}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {data.driver.givenName} {data.driver.familyName}
          </CardTitle>
          <CardDescription>Your Favorite Driver</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Position</span>
              <span className="font-bold text-lg">P{data.current_season.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Points</span>
              <span className="font-bold">{data.current_season.points}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Wins</span>
              <span className="font-bold">{data.current_season.wins}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FavoriteTeamWidget({ data }: { data: any }) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Favorite Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set your favorite team in settings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/teams/${data.constructor.constructorId}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className={`${getTeamColor(data.constructor.name)}`}>
            {data.constructor.name}
          </CardTitle>
          <CardDescription>Your Favorite Team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Position</span>
              <span className="font-bold text-lg">P{data.current_season.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Points</span>
              <span className="font-bold">{data.current_season.points}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Wins</span>
              <span className="font-bold">{data.current_season.wins}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ChampionshipLeaderWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Championship Leader
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">
            {data.Driver.givenName} {data.Driver.familyName}
          </h3>
          <p className={`text-sm px-2 py-1 rounded inline-block ${getTeamColor(data.Constructors[0]?.name || "")}`}>
            {data.Constructors[0]?.name || "N/A"}
          </p>
          <div className="flex justify-between pt-2">
            <span className="text-muted-foreground">Points</span>
            <span className="font-bold text-xl">{data.points}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wins</span>
            <span className="font-bold text-xl">{data.wins}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FastestLapWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Fastest Lap
        </CardTitle>
        <CardDescription>{data.race}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{data.fastest_lap.driver}</h3>
          <p className="text-3xl font-mono font-bold text-primary">
            {data.fastest_lap.lap_time}
          </p>
          <p className="text-sm text-muted-foreground">
            Lap {data.fastest_lap.lap_number}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

