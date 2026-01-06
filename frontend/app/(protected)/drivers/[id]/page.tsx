"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { getTeamColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { User, Trophy, Calendar, TrendingUp } from "lucide-react";
import { use } from "react";

export default function DriverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const season = new Date().getFullYear();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["driver-profile", id, season],
    queryFn: async () => {
      const response = await api.get(`/profiles/drivers/${id}?season=${season}`);
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
        <h1 className="text-4xl font-bold">Driver Not Found</h1>
      </div>
    );
  }

  const driver = profileData.driver;
  const currentSeason = profileData.current_season;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-4xl">
            {driver.code}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">
              {driver.givenName} {driver.familyName}
            </h1>
            <div className="mt-2 flex items-center gap-4">
              <span className={`inline-block px-3 py-1 rounded text-lg ${getTeamColor(currentSeason.team?.name || "")}`}>
                {currentSeason.team?.name || "N/A"}
              </span>
              <span className="text-muted-foreground">
                {driver.nationality}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Podiums</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentSeason.podiums}</p>
          </CardContent>
        </Card>
      </div>

      {/* Season Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {season} Season Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Races Entered</p>
              <p className="text-2xl font-bold">{currentSeason.races_entered}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">DNFs</p>
              <p className="text-2xl font-bold">{currentSeason.dnfs}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">
                {currentSeason.races_entered > 0
                  ? Math.round((currentSeason.wins / currentSeason.races_entered) * 100)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Podium Rate</p>
              <p className="text-2xl font-bold">
                {currentSeason.races_entered > 0
                  ? Math.round((currentSeason.podiums / currentSeason.races_entered) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Stats */}
      {profileData.career && profileData.career.seasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Career Statistics
            </CardTitle>
            <CardDescription>Last {profileData.career.seasons.length} seasons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Wins</p>
                  <p className="text-2xl font-bold">{profileData.career.total_wins}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{Math.round(profileData.career.total_points)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Championships</p>
                  <p className="text-2xl font-bold">{profileData.career.championships}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seasons</p>
                  <p className="text-2xl font-bold">{profileData.career.seasons.length}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Season by Season</h4>
                <div className="space-y-2">
                  {profileData.career.seasons.map((seasonData: any) => (
                    <div key={seasonData.year} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <span className="font-bold">{seasonData.year}</span>
                        <span className="text-sm">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${getTeamColor(seasonData.team || "")}`}>
                            {seasonData.team || "N/A"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Position: </span>
                          <span className="font-bold">P{seasonData.position}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Points: </span>
                          <span className="font-bold">{seasonData.points}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Wins: </span>
                          <span className="font-bold">{seasonData.wins}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Race Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {season} Race Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {profileData.race_results.map((result: any) => (
              <div key={result.round} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    result.position === 1 ? 'bg-yellow-500 text-white' :
                    result.position === 2 ? 'bg-gray-400 text-white' :
                    result.position === 3 ? 'bg-orange-600 text-white' :
                    'bg-primary text-primary-foreground'
                  }`}>
                    {result.position}
                  </div>
                  <div>
                    <p className="font-semibold">{result.race}</p>
                    <p className="text-sm text-muted-foreground">
                      Grid: {result.grid} • {result.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{result.points} pts</p>
                  {result.fastest_lap && (
                    <p className="text-xs text-muted-foreground">Fastest Lap</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

