import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLapTime(seconds: number | null | undefined): string {
  if (!seconds) return "N/A";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(3);
  
  return `${minutes}:${remainingSeconds.padStart(6, "0")}`;
}

export function getTeamColor(teamName: string): string {
  const team = teamName.toLowerCase();
  
  if (team.includes("red bull")) return "team-red-bull";
  if (team.includes("ferrari")) return "team-ferrari";
  if (team.includes("mercedes")) return "team-mercedes";
  if (team.includes("mclaren")) return "team-mclaren";
  if (team.includes("aston")) return "team-aston-martin";
  if (team.includes("alpine")) return "team-alpine";
  if (team.includes("williams")) return "team-williams";
  if (team.includes("rb") || team.includes("racing bulls")) return "team-rb";
  if (team.includes("sauber") || team.includes("kick")) return "team-kick-sauber";
  if (team.includes("haas")) return "team-haas";
  
  return "bg-gray-600";
}

export function getCompoundColor(compound: string | null | undefined): string {
  if (!compound) return "bg-gray-400";
  
  const comp = compound.toLowerCase();
  
  if (comp.includes("soft")) return "compound-soft";
  if (comp.includes("medium")) return "compound-medium";
  if (comp.includes("hard")) return "compound-hard";
  if (comp.includes("intermediate")) return "compound-intermediate";
  if (comp.includes("wet")) return "compound-wet";
  
  return "bg-gray-400";
}

