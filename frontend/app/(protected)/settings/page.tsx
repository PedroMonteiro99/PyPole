"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
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

export default function SettingsPage() {
  const { updateTeamTheme } = useTeamTheme();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user preferences
        const userResponse = await api.get("/auth/me");
        setSelectedTeam(userResponse.data.favorite_team || "");
        setSelectedDriver(userResponse.data.favorite_driver || "");

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
      }
    };

    fetchData();
  }, []);

  const handleSavePreferences = async () => {
    if (!selectedTeam || !selectedDriver) {
      setError("Please select both a favorite team and driver");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await api.put("/auth/preferences", {
        favorite_team: selectedTeam,
        favorite_driver: selectedDriver,
        theme: "dark",
      });

      // Update team theme
      updateTeamTheme(selectedTeam);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your preferences and account settings
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how PyPole looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <CardTitle>F1 Favorites</CardTitle>
            <CardDescription>
              Set your favorite team and driver - this will customize the app
              colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">Favorite Team</Label>
              <div className="grid grid-cols-2 gap-3">
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <button
                      key={team.constructorId}
                      type="button"
                      onClick={() => setSelectedTeam(team.name)}
                      className={`p-2 rounded-lg border-2 transition-all text-sm text-center relative ${
                        selectedTeam === team.name
                          ? "border-primary ring-2 ring-primary ring-offset-0 z-10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {team.name}
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-4 text-muted-foreground text-sm">
                    Loading teams...
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base">Favorite Driver</Label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <button
                      key={driver.driverId}
                      type="button"
                      onClick={() => setSelectedDriver(driver.code)}
                      className={`p-3 rounded-lg border-2 transition-all text-left text-sm relative ${
                        selectedDriver === driver.code
                          ? "border-primary ring-2 ring-primary ring-offset-0 z-10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold">
                        {driver.givenName} {driver.familyName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{driver.code}</span>
                        {driver.team && (
                          <span
                            className={`text-xs px-1 py-0.5 rounded ${getTeamColor(
                              driver.team
                            )}`}
                          >
                            {driver.team}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-4 text-muted-foreground text-sm">
                    Loading drivers...
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-600/10 p-3 rounded-lg">
                Preferences saved successfully!
              </div>
            )}

            <Button
              onClick={handleSavePreferences}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Information about PyPole</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium">Data Sources</p>
              <p className="text-sm text-muted-foreground">
                FastF1, Jolpica F1 API
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Technology Stack</p>
              <p className="text-sm text-muted-foreground">
                Next.js, FastAPI, PostgreSQL, Redis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
