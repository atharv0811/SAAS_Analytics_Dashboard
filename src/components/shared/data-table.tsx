"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableHead } from "@/components/ui/table";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SortState } from "@/hooks/use-data-table";

/* Small, composable pieces shared by the Customers and Transactions tables. */

export function SortableHead<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
  className,
}: {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onSort: (key: K) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort.key === sortKey;
  const Icon = !active ? ChevronsUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead
      className={cn(align === "right" && "text-right", className)}
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          active && "text-foreground",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-50")} aria-hidden="true" />
      </button>
    </TableHead>
  );
}

export function TableSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="bg-card pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
  label,
  icon: Icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  allLabel: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          "min-w-0 flex-1 bg-card sm:w-auto sm:flex-none",
          value !== "all" && "border-primary/40 text-foreground",
        )}
      >
        {Icon && <Icon className="text-muted-foreground" />}
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  itemLabel,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemLabel: string;
}) {
  const first = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalRows);

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <p className="text-muted-foreground" aria-live="polite">
        Showing <span className="tabular font-medium text-foreground">{formatNumber(first)}</span>–
        <span className="tabular font-medium text-foreground">{formatNumber(last)}</span> of{" "}
        <span className="tabular font-medium text-foreground">{formatNumber(totalRows)}</span> {itemLabel}
      </p>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2">
          <span className="hidden text-muted-foreground sm:inline">Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger size="sm" aria-label="Rows per page" className="w-18">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <span className="tabular mr-2 text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </nav>
  );
}
