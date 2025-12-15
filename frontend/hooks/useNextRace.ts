"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Race } from "@/lib/types";

interface NextRaceResponse {
  race: Race | null;
  message?: string;
}

export function useNextRace() {
  return useQuery({
    queryKey: ["nextRace"],
    queryFn: async () => {
      const response = await api.get<NextRaceResponse>("/jolpica/schedule/next");
      return response.data;
    },
  });
}

