"use client";

import { DriverStanding, ConstructorStanding } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTeamColor } from "@/lib/utils";

interface DriverStandingsTableProps {
  standings: DriverStanding[];
  season: number;
}

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[];
  season: number;
}

export function DriverStandingsTable({
  standings,
  season,
}: DriverStandingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Standings</CardTitle>
        <CardDescription>{season} Season</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold">Pos</th>
                <th className="px-4 py-3 text-left font-semibold">Driver</th>
                <th className="px-4 py-3 text-left font-semibold">Team</th>
                <th className="px-4 py-3 text-right font-semibold">Points</th>
                <th className="px-4 py-3 text-right font-semibold">Wins</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => (
                <tr
                  key={standing.Driver.driverId}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-bold">{standing.position}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">
                        {standing.Driver.givenName} {standing.Driver.familyName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {standing.Driver.code}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTeamColor(
                        standing.Constructors[0]?.name || ""
                      )}`}
                    >
                      {standing.Constructors[0]?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {standing.points}
                  </td>
                  <td className="px-4 py-3 text-right">{standing.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConstructorStandingsTable({
  standings,
  season,
}: ConstructorStandingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Constructor Standings</CardTitle>
        <CardDescription>{season} Season</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold">Pos</th>
                <th className="px-4 py-3 text-left font-semibold">Team</th>
                <th className="px-4 py-3 text-right font-semibold">Points</th>
                <th className="px-4 py-3 text-right font-semibold">Wins</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => (
                <tr
                  key={standing.Constructor.constructorId}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-bold">{standing.position}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1.5 rounded font-medium ${getTeamColor(
                        standing.Constructor.name
                      )}`}
                    >
                      {standing.Constructor.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {standing.points}
                  </td>
                  <td className="px-4 py-3 text-right">{standing.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

