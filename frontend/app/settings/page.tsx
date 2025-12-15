"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
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
            <CardTitle>Favorites</CardTitle>
            <CardDescription>
              Set your favorite team and driver
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team">Favorite Team</Label>
              <Input id="team" placeholder="e.g., Red Bull Racing" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver">Favorite Driver</Label>
              <Input id="driver" placeholder="e.g., Max Verstappen" />
            </div>
            <Button>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Information about PyPole
            </CardDescription>
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

