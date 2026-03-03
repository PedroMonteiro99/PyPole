"use client";

import { TeamBadge } from "@/components/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import Link from "next/link";

export default function DriversPage() {
  const season = new Date().getFullYear();

  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ["drivers", season],
    queryFn: async () => {
      const response = await api.get(`/profiles/drivers?season=${season}`);
      return response.data;
    },
  });

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams", season],
    queryFn: async () => {
      const response = await api.get(`/profiles/teams?season=${season}`);
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Users className="h-10 w-10" />
          Drivers &amp; Teams
        </h1>
        <p className="text-muted-foreground mt-2">
          Explore detailed profiles and statistics
        </p>
      </div>

      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="mt-6">
          {driversLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 10 }, (_, i) => i).map((i) => (
                <Skeleton key={`skel-driver-${i}`} className="h-24 w-full" />
              ))}
            </div>
          ) : null}
          {!driversLoading && driversData?.drivers?.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">
                  No driver data available
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Season data for {season} hasn&apos;t been published yet. Check
                  back after the first race.
                </p>
              </CardContent>
            </Card>
          ) : null}
          {!driversLoading && driversData?.drivers?.length ? (
            <div className="grid gap-4">
              {driversData.drivers.map((driver: any) => (
                <Link
                  key={driver.driver_id}
                  href={`/drivers/${driver.driver_id}`}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
                            {driver.code}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{driver.name}</h3>
                            <p className="text-sm">
                              <TeamBadge
                                teamName={driver.team || "N/A"}
                                size="xs"
                              />
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold">
                            P{driver.position}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {driver.points} points
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : null}
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="mt-6">
          {teamsLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 10 }, (_, i) => i).map((i) => (
                <Skeleton key={`skel-team-${i}`} className="h-24 w-full" />
              ))}
            </div>
          ) : null}
          {!teamsLoading && teamsData?.teams?.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">No team data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Season data for {season} hasn&apos;t been published yet. Check
                  back after the first race.
                </p>
              </CardContent>
            </Card>
          ) : null}
          {!teamsLoading && teamsData?.teams?.length ? (
            <div className="grid gap-4">
              {teamsData.teams.map((team: any) => (
                <Link
                  key={team.constructor_id}
                  href={`/teams/${team.constructor_id}`}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-muted">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {team.nationality}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold">P{team.position}</p>
                          <p className="text-sm text-muted-foreground">
                            {team.points} points • {team.wins} wins
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
