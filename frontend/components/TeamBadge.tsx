import { cn, getTeamColor } from "@/lib/utils";

interface TeamBadgeProps {
  teamName: string;
  className?: string;
  size?: "xs" | "sm" | "md";
}

const sizeClasses = {
  xs: "px-1.5 py-0.5 text-xs",
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1 text-sm",
};

export function TeamBadge({
  teamName,
  className,
  size = "sm",
}: Readonly<TeamBadgeProps>) {
  if (!teamName) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-medium",
        sizeClasses[size],
        getTeamColor(teamName),
        className,
      )}
    >
      {teamName}
    </span>
  );
}
