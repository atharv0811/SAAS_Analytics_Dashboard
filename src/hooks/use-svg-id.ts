import { useId } from "react";

/** A useId value that is safe inside SVG `url(#id)` references. */
export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
