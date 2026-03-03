"use client";

import {
  ConstructorStandingsTable,
  DriverStandingsTable,
} from "@/components/StandingsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useConstructorStandings,
  useDriverStandings,
} from "@/hooks/useStandings";
import { useState } from "react";

export default function StandingsPage() {
  const currentYear = new Date().getFullYear();
  const [season] = useState(currentYear);

  const { data: driverData, isLoading: driverLoading } =
    useDriverStandings(season);
  const { data: constructorData, isLoading: constructorLoading } =
    useConstructorStandings(season);

  let driverContent;
  if (driverLoading) {
    driverContent = <Skeleton className="h-96 w-full" />;
  } else if (driverData) {
    driverContent = (
      <DriverStandingsTable
        standings={driverData.standings}
        season={driverData.season}
      />
    );
  } else {
    driverContent = (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  let constructorContent;
  if (constructorLoading) {
    constructorContent = <Skeleton className="h-96 w-full" />;
  } else if (constructorData) {
    constructorContent = (
      <ConstructorStandingsTable
        standings={constructorData.standings}
        season={constructorData.season}
      />
    );
  } else {
    constructorContent = (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

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

        <TabsContent value="drivers">{driverContent}</TabsContent>

        <TabsContent value="constructors">{constructorContent}</TabsContent>
      </Tabs>
    </div>
  );
}
