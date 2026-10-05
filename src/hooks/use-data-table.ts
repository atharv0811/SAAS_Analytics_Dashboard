"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

type SortValue = string | number;

interface UseDataTableOptions<T, K extends string> {
  data: T[];
  /** Returns true when a row passes the active search and filters. */
  predicate: (row: T) => boolean;
  sortAccessors: Record<K, (row: T) => SortValue>;
  initialSort: SortState<K>;
  initialPageSize?: number;
}

/**
 * Client-side filtering, sorting and pagination for mock-data tables.
 * With a real API the same state would be sent as query parameters.
 */
export function useDataTable<T, K extends string>({
  data,
  predicate,
  sortAccessors,
  initialSort,
  initialPageSize = 10,
}: UseDataTableOptions<T, K>) {
  const [sort, setSort] = useState<SortState<K>>(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const filtered = useMemo(() => data.filter(predicate), [data, predicate]);

  const sorted = useMemo(() => {
    const accessor = sortAccessors[sort.key];
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return result * factor;
    });
  }, [filtered, sort, sortAccessors]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Clamp rather than store: filters can shrink the result set below the current page.
  const currentPage = Math.min(page, pageCount);
  const rows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: K) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: data.length && typeof sortAccessors[key](data[0]) === "number" ? "desc" : "asc" },
    );
    setPage(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    rows,
    filtered: sorted,
    total: data.length,
    sort,
    toggleSort,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    resetPage: () => setPage(1),
  };
}
