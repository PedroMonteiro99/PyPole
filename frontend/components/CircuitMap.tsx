"use client";

export interface DriverPosition {
  x: number;
  y: number;
  color?: string;
  position?: number | null;
  compound?: string | null;
}

interface CircuitMapProps {
  trackPoints: [number, number][];
  drivers: Record<string, DriverPosition>;
  selectedDriver?: string | null;
  width?: number;
  height?: number;
  padding?: number;
  className?: string;
}

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: "#FF3333",
  MEDIUM: "#FFFF00",
  HARD: "#FFFFFF",
  INTER: "#39B54A",
  WET: "#0067FF",
};

// Scale a 0-1000 value into SVG coordinate space with padding
function toSvgCoord({
  value,
  min,
  max,
  targetMin,
  targetMax,
}: {
  value: number;
  min: number;
  max: number;
  targetMin: number;
  targetMax: number;
}): number {
  if (max === min) {
    return (targetMin + targetMax) / 2;
  }
  return targetMin + ((value - min) / (max - min)) * (targetMax - targetMin);
}

export const CircuitMap = ({
  trackPoints,
  drivers,
  selectedDriver = null,
  width = 600,
  height = 450,
  padding = 40,
  className = "",
}: CircuitMapProps) => {
  if (trackPoints.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/20 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-sm text-muted-foreground">No track data available</p>
      </div>
    );
  }

  // Compute bounds of track points (0-1000 normalized space)
  const xs = trackPoints.map(([x]) => x);
  const ys = trackPoints.map(([, y]) => y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const drawAreaLeft = padding;
  const drawAreaRight = width - padding;
  const drawAreaTop = padding;
  const drawAreaBottom = height - padding;

  function scaleX(x: number): number {
    return toSvgCoord({
      value: x,
      min: xMin,
      max: xMax,
      targetMin: drawAreaLeft,
      targetMax: drawAreaRight,
    });
  }

  function scaleY(y: number): number {
    // SVG Y is inverted vs. F1 coordinate system
    return toSvgCoord({
      value: y,
      min: yMin,
      max: yMax,
      targetMin: drawAreaBottom,
      targetMax: drawAreaTop,
    });
  }

  const polylinePoints = trackPoints
    .map(([x, y]) => `${scaleX(x).toFixed(1)},${scaleY(y).toFixed(1)}`)
    .join(" ");

  const driverEntries = Object.entries(drivers);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={`overflow-visible ${className}`}
      style={{ background: "transparent" }}
      aria-label="F1 Circuit Map"
    >
      {/* Track outline */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#374151"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Track inner line (lighter centre line) */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#6B7280"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray="none"
      />

      {/* Driver dots — render selected on top */}
      {driverEntries
        .filter(([code]) => code !== selectedDriver)
        .map(([code, driver]) => {
          const cx = scaleX(driver.x);
          const cy = scaleY(driver.y);
          const fill = driver.color ?? "#ffffff";

          return (
            <g key={code} style={{ transition: "transform 0.4s ease" }}>
              <circle
                cx={cx}
                cy={cy}
                r={7}
                fill={fill}
                stroke="#000"
                strokeWidth={1}
                opacity={0.9}
              />
              <text
                x={cx}
                y={cy - 11}
                textAnchor="middle"
                fill="white"
                fontSize={9}
                fontWeight="600"
                stroke="#000"
                strokeWidth={2}
                paintOrder="stroke"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {code}
              </text>
              {driver.compound && (
                <circle
                  cx={cx + 8}
                  cy={cy - 8}
                  r={4}
                  fill={COMPOUND_COLORS[driver.compound] ?? "#888"}
                  stroke="#000"
                  strokeWidth={0.5}
                />
              )}
            </g>
          );
        })}

      {/* Selected driver — drawn last to be on top */}
      {selectedDriver && drivers[selectedDriver] && (
        <g key={selectedDriver}>
          {(() => {
            const driver = drivers[selectedDriver];
            const cx = scaleX(driver.x);
            const cy = scaleY(driver.y);
            const fill = driver.color ?? "#ffffff";
            return (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  fill={fill}
                  stroke="#fff"
                  strokeWidth={2}
                  opacity={1}
                />
                <text
                  x={cx}
                  y={cy - 16}
                  textAnchor="middle"
                  fill="white"
                  fontSize={11}
                  fontWeight="700"
                  stroke="#000"
                  strokeWidth={2}
                  paintOrder="stroke"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {selectedDriver}
                </text>
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
};
