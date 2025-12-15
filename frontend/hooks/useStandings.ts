"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  DriverStandingsResponse,
  ConstructorStandingsResponse,
} from "@/lib/types";

export function useDriverStandings(season?: number) {
  return useQuery({
    queryKey: ["driverStandings", season],
    queryFn: async () => {
      const params = season ? { season } : {};
      const response = await api.get<DriverStandingsResponse>(
        "/jolpica/standings/drivers",
        { params }
      );
      return response.data;
    },
  });
}

export function useConstructorStandings(season?: number) {
  return useQuery({
    queryKey: ["constructorStandings", season],
    queryFn: async () => {
      const params = season ? { season } : {};
      const response = await api.get<ConstructorStandingsResponse>(
        "/jolpica/standings/constructors",
        { params }
      );
      return response.data;
    },
  });
}

