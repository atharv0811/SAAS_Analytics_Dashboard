import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

/*
 * Deterministic tint per name so each customer keeps the same avatar colour.
 * Tints are low-chroma so they never compete with status colours.
 */
const TINTS = [
  "bg-[oklch(0.93_0.04_258)] text-[oklch(0.38_0.1_258)] dark:bg-[oklch(0.32_0.06_258)] dark:text-[oklch(0.88_0.05_258)]",
  "bg-[oklch(0.93_0.04_45)] text-[oklch(0.42_0.1_45)] dark:bg-[oklch(0.33_0.06_45)] dark:text-[oklch(0.88_0.05_45)]",
  "bg-[oklch(0.93_0.04_165)] text-[oklch(0.38_0.08_165)] dark:bg-[oklch(0.32_0.05_165)] dark:text-[oklch(0.88_0.05_165)]",
  "bg-[oklch(0.93_0.04_300)] text-[oklch(0.4_0.1_300)] dark:bg-[oklch(0.33_0.06_300)] dark:text-[oklch(0.88_0.05_300)]",
  "bg-[oklch(0.94_0.045_85)] text-[oklch(0.42_0.08_75)] dark:bg-[oklch(0.34_0.05_85)] dark:text-[oklch(0.9_0.05_85)]",
  "bg-[oklch(0.93_0.03_215)] text-[oklch(0.38_0.07_215)] dark:bg-[oklch(0.32_0.04_215)] dark:text-[oklch(0.88_0.04_215)]",
];

function tintFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

interface UserAvatarProps {
  name: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function UserAvatar({ name, size = "default", className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={cn("font-medium", tintFor(name))}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
