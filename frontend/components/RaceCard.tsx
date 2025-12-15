"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Race } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin } from "lucide-react";

interface RaceCardProps {
  race: Race;
}

export function RaceCard({ race }: RaceCardProps) {
  const raceDate = parseISO(race.date);
  const isPast = raceDate < new Date();

  return (
    <Card className={isPast ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{race.raceName}</CardTitle>
            <CardDescription className="mt-1">
              Round {race.round} • {race.season}
            </CardDescription>
          </div>
          {!isPast && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Upcoming
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {race.Circuit.Location.locality}, {race.Circuit.Location.country}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(raceDate, "PPP")}</span>
          </div>

          {race.Circuit.circuitName && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                {race.Circuit.circuitName}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
