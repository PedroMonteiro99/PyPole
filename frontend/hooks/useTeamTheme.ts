"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

const teamClassMap: Record<string, string> = {
  "Red Bull Racing": "theme-red-bull",
  "Ferrari": "theme-ferrari",
  "Mercedes": "theme-mercedes",
  "McLaren": "theme-mclaren",
  "Aston Martin": "theme-aston-martin",
  "Alpine F1 Team": "theme-alpine",
  "Williams": "theme-williams",
  "RB F1 Team": "theme-rb",
  "Kick Sauber": "theme-kick-sauber",
  "Haas F1 Team": "theme-haas",
};

export function useTeamTheme() {
  const [teamTheme, setTeamTheme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await api.get("/auth/me");
        const favoriteTeam = response.data.favorite_team;

        if (favoriteTeam) {
          const themeClass = teamClassMap[favoriteTeam] || null;
          setTeamTheme(themeClass);

          // Apply theme class to document
          if (themeClass) {
            // Remove all existing theme classes
            Object.values(teamClassMap).forEach((cls) => {
              document.documentElement.classList.remove(cls);
            });
            // Add the new theme class
            document.documentElement.classList.add(themeClass);
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, []);

  const updateTeamTheme = (team: string) => {
    const themeClass = teamClassMap[team];
    if (themeClass) {
      // Remove all existing theme classes
      Object.values(teamClassMap).forEach((cls) => {
        document.documentElement.classList.remove(cls);
      });
      // Add the new theme class
      document.documentElement.classList.add(themeClass);
      setTeamTheme(themeClass);
    }
  };

  return { teamTheme, isLoading, updateTeamTheme };
}

