"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ScheduleResponse } from "@/lib/types";
import { RaceCard } from "@/components/RaceCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function SchedulePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      const response = await api.get<ScheduleResponse>("/jolpica/schedule/current");
      return response.data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Race Schedule</h1>
        <p className="text-muted-foreground mt-2">
          {data ? `${data.season} Season Calendar` : "Loading..."}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.races.map((race) => (
            <RaceCard key={`${race.season}-${race.round}`} race={race} />
          ))}
        </div>
      )}
    </div>
  );
}

