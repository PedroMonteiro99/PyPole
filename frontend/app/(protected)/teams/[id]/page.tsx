"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { getTeamColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Building2, Trophy, Users, TrendingUp } from "lucide-react";
import { use } from "react";
import Link from "next/link";

export default function TeamProfilePage({ params }: { params: Promise<{ id: string }> }) {
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
          <div className={`h-24 w-24 rounded-full flex items-center justify-center ${getTeamColor(team.name)}`}>
            <Building2 className="h-12 w-12" />
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Position</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">P{currentSeason.position}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentSeason.points}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentSeason.wins}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drivers</CardTitle>
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
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {driver.driver.code}
                    </div>
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
                  <span className="font-bold text-lg">{result.total_points} pts</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.results.map((driverResult: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-secondary">
                      <div className="flex items-center gap-2">
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          driverResult.position === 1 ? 'bg-yellow-500 text-white' :
                          driverResult.position === 2 ? 'bg-gray-400 text-white' :
                          driverResult.position === 3 ? 'bg-orange-600 text-white' :
                          'bg-primary text-primary-foreground'
                        }`}>
                          {driverResult.position}
                        </span>
                        <span className="text-sm font-semibold">{driverResult.driver}</span>
                      </div>
                      <span className="text-sm font-bold">{driverResult.points} pts</span>
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

