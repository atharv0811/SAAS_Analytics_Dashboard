import { useSvgId } from "@/hooks/use-svg-id";
import { cn } from "@/lib/utils";

interface SparklineProps {
  values: number[];
  className?: string;
  /** CSS colour for the line, defaults to the first chart slot. */
  color?: string;
}

const WIDTH = 120;
const HEIGHT = 36;
const PADDING = 2;

/** Decorative trend line drawn as plain SVG; far lighter than a full chart. */
export function Sparkline({ values, className, color = "var(--chart-1)" }: SparklineProps) {
  const gradientId = useSvgId("sparkline");
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * WIDTH;
    const y = PADDING + (1 - (value - min) / span) * (HEIGHT - PADDING * 2);
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${HEIGHT} ${line} ${WIDTH},${HEIGHT}`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
