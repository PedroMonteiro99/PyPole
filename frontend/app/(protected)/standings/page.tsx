"use client";

import { useState } from "react";
import { useDriverStandings, useConstructorStandings } from "@/hooks/useStandings";
import {
  DriverStandingsTable,
  ConstructorStandingsTable,
} from "@/components/StandingsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StandingsPage() {
  const currentYear = new Date().getFullYear();
  const [season] = useState(currentYear);

  const { data: driverData, isLoading: driverLoading } = useDriverStandings(season);
  const { data: constructorData, isLoading: constructorLoading } =
    useConstructorStandings(season);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Standings</h1>
        <p className="text-muted-foreground mt-2">
          Current championship standings
        </p>
      </div>

      <Tabs defaultValue="drivers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="constructors">Constructors</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          {driverLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : driverData ? (
            <DriverStandingsTable
              standings={driverData.standings}
              season={driverData.season}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="constructors">
          {constructorLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : constructorData ? (
            <ConstructorStandingsTable
              standings={constructorData.standings}
              season={constructorData.season}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

