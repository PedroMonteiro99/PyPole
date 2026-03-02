"use client";

import { PositionBadge } from "@/components/PositionBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Building2, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function TeamProfilePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const season = new Date().getFullYear();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["team-profile", id, season],
    queryFn: async () => {
      const response = await api.get(`/profiles/teams/${id}?season=${season}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Team Not Found</h1>
      </div>
    );
  }

  const team = profileData.constructor;
  const currentSeason = profileData.current_season;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          <div
            className={`h-24 w-24 rounded-full flex items-center justify-center bg-muted`}
          >
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{team.name}</h1>
            <div className="mt-2">
              <span className="text-muted-foreground text-lg">
                {team.nationality}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">P{currentSeason.position}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentSeason.points}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentSeason.wins}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentSeason.drivers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {season} Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {currentSeason.drivers.map((driver: any) => (
              <Link
                key={driver.driver.driverId}
                href={`/drivers/${driver.driver.driverId}`}
              >
                <div className="flex items-center justify-between p-4 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <PositionBadge position={driver.position} size="md" />
                    <div>
                      <p className="font-semibold text-lg">
                        {driver.driver.givenName} {driver.driver.familyName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {driver.driver.nationality}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">P{driver.position}</p>
                    <p className="text-sm text-muted-foreground">
                      {driver.points} pts • {driver.wins} wins
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Race Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {season} Race Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {profileData.race_results.map((result: any) => (
              <div key={result.round} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold">{result.race}</h4>
                  <span className="font-bold text-lg">
                    {result.total_points} pts
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.results.map((driverResult: any, index: number) => (
                    <div
                      key={driverResult.driver}
                      className="flex items-center justify-between p-2 rounded bg-secondary"
                    >
                      <div className="flex items-center gap-2">
                        <PositionBadge
                          position={driverResult.position}
                          size="sm"
                        />
                        <span className="text-sm font-semibold">
                          {driverResult.driver}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {driverResult.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
