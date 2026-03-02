import { cn } from "@/lib/utils";

interface PositionBadgeProps {
  position: number | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
};

const positionClasses = (pos: number | string): string => {
  const p = typeof pos === "string" ? Number.parseInt(pos, 10) : pos;
  if (p === 1) {
    return "bg-yellow-500 dark:bg-yellow-500 text-white";
  }
  if (p === 2) {
    return "bg-slate-400 dark:bg-slate-500 text-white";
  }
  if (p === 3) {
    return "bg-amber-700 dark:bg-amber-700 text-white";
  }
  return "bg-primary text-primary-foreground";
};

export function PositionBadge({
  position,
  className,
  size = "md",
}: Readonly<PositionBadgeProps>) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold shrink-0",
        sizeClasses[size],
        positionClasses(position),
        className,
      )}
    >
      {position}
    </div>
  );
}
