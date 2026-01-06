"use client";

import { F1Logo } from "@/components/F1Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTeamTheme } from "@/hooks/useTeamTheme";
import { api } from "@/lib/api";
import { getTeamColor } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  code: string;
  team?: string;
}

interface Team {
  constructorId: string;
  name: string;
  nationality: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { updateTeamTheme } = useTeamTheme();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch current drivers and constructors from standings
    const fetchData = async () => {
      try {
        const currentYear = new Date().getFullYear();

        // Try current season first
        let driversResponse = await api.get("/jolpica/standings/drivers");
        let constructorsResponse = await api.get(
          "/jolpica/standings/constructors"
        );

        // If empty (season hasn't started), try previous year
        if (driversResponse.data.standings.length === 0) {
          driversResponse = await api.get(
            `/jolpica/standings/drivers?season=${currentYear - 1}`
          );
          constructorsResponse = await api.get(
            `/jolpica/standings/constructors?season=${currentYear - 1}`
          );
        }

        const standings = driversResponse.data.standings;
        const driversList: Driver[] = standings.map((s: any) => ({
          driverId: s.Driver.driverId,
          givenName: s.Driver.givenName,
          familyName: s.Driver.familyName,
          code: s.Driver.code,
          // Get the last constructor (most recent team) in case driver changed teams
          team: s.Constructors[s.Constructors.length - 1]?.name || "",
        }));
        setDrivers(driversList);

        const constructorStandings = constructorsResponse.data.standings;
        const teamsList: Team[] = constructorStandings.map((s: any) => ({
          constructorId: s.Constructor.constructorId,
          name: s.Constructor.name,
          nationality: s.Constructor.nationality,
        }));
        setTeams(teamsList);
      } catch (err) {
        console.error("Error fetching data:", err);
        setDrivers([]);
        setTeams([]);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeam || !selectedDriver) {
      setError("Please select both a favorite team and driver");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Update user preferences
      await api.put("/auth/preferences", {
        favorite_team: selectedTeam,
        favorite_driver: selectedDriver,
        theme: "dark",
      });

      // Apply team theme
      updateTeamTheme(selectedTeam);

      // Remove first login flag
      localStorage.removeItem("first_login");

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem("first_login");
    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1563899522385-cc0ed4a4d1e6?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <F1Logo className="h-6 w-auto text-primary mr-2" />
              <span className="text-3xl font-bold">PyPole</span>
            </div>
            <CardTitle className="text-2xl text-center">Welcome! 🏎️</CardTitle>
            <CardDescription className="text-center">
              Let's customize your F1 experience. Choose your favorite team and
              driver.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Teams Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Favorite Team</Label>
                <div className="grid grid-cols-2 gap-3">
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <button
                        key={team.constructorId}
                        type="button"
                        onClick={() => setSelectedTeam(team.name)}
                        className={`p-4 rounded-lg border-2 transition-all text-center font-medium relative ${
                          selectedTeam === team.name
                            ? "border-primary ring-2 ring-primary ring-offset-0 scale-105 z-10"
                            : "border-border hover:border-primary/50"
                        } ${getTeamColor(team.name)}`}
                      >
                        {team.name}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      Loading teams...
                    </div>
                  )}
                </div>
              </div>

              {/* Drivers Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Favorite Driver
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <button
                        key={driver.driverId}
                        type="button"
                        onClick={() => setSelectedDriver(driver.code)}
                        className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                          selectedDriver === driver.code
                            ? "border-primary ring-2 ring-primary ring-offset-0 z-10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-semibold">
                          {driver.givenName} {driver.familyName}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center justify-between">
                          <span>{driver.code}</span>
                          {driver.team && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${getTeamColor(
                                driver.team
                              )}`}
                            >
                              {driver.team.split(" ").pop()}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      Loading drivers...
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
