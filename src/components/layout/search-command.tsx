"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Moon, Search, Sun } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { TRANSACTION_STATUS } from "@/components/shared/status-badge";
import { ALL_NAV } from "@/lib/navigation";
import { formatCurrency } from "@/lib/format";
import { usePreferencesStore } from "@/store/preferences-store";
import { useSelectionStore } from "@/store/selection-store";
import type { SearchIndex } from "@/types";

const RESULT_LIMIT = 5;

function matches(query: string, ...fields: string[]) {
  return fields.some((field) => field.toLowerCase().includes(query));
}

export function SearchCommand({ index }: { index: SearchIndex }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const selectCustomer = useSelectionStore((state) => state.selectCustomer);
  const selectTransaction = useSelectionStore((state) => state.selectTransaction);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Local filtering keeps the list short; cmdk's built-in filter would render every record.
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return { pages: ALL_NAV, customers: [], transactions: [] };
    }
    return {
      pages: ALL_NAV.filter((item) => matches(term, item.title, item.description)),
      customers: index.customers
        .filter((customer) => matches(term, customer.name, customer.email, customer.company, customer.id))
        .slice(0, RESULT_LIMIT),
      transactions: index.transactions
        .filter((transaction) => matches(term, transaction.id, transaction.customerName))
        .slice(0, RESULT_LIMIT),
    };
  }, [index, query]);

  const run = (action: () => void) => {
    setOpen(false);
    setQuery("");
    action();
  };

  const hasResults = results.pages.length + results.customers.length + results.transactions.length > 0;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-8 w-full max-w-72 justify-start gap-2 px-2.5 font-normal text-muted-foreground shadow-none md:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search customers, payments…</span>
        <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline">
          Ctrl K
        </kbd>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="md:hidden" aria-label="Search">
        <Search />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
        title="Search MetricFlow"
        description="Search pages, customers and transactions"
        className="sm:max-w-lg"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search by name, email, company or transaction ID…"
          />
          <CommandList className="max-h-[min(24rem,60vh)]">
            {!hasResults && <CommandEmpty>No results for “{query}”.</CommandEmpty>}
            {results.pages.length > 0 && (
              <CommandGroup heading="Pages">
                {results.pages.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`page-${item.href}`}
                    onSelect={() => run(() => router.push(item.href))}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    <span className="ml-auto hidden truncate text-xs text-muted-foreground sm:block">
                      {item.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.customers.length > 0 && (
              <CommandGroup heading="Customers">
                {results.customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`customer-${customer.id}`}
                    onSelect={() =>
                      run(() => {
                        selectCustomer(customer.id);
                        router.push("/customers");
                      })
                    }
                  >
                    <UserAvatar name={customer.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{customer.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{customer.company}</span>
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{customer.id}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.transactions.length > 0 && (
              <CommandGroup heading="Transactions">
                {results.transactions.map((transaction) => (
                  <CommandItem
                    key={transaction.id}
                    value={`transaction-${transaction.id}`}
                    onSelect={() =>
                      run(() => {
                        selectTransaction(transaction.id);
                        router.push("/transactions");
                      })
                    }
                  >
                    <span className="font-mono text-xs">{transaction.id}</span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{transaction.customerName}</span>
                    <span className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatCurrency(transaction.amount, { precise: true })} ·{" "}
                      {TRANSACTION_STATUS[transaction.status].label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!query && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Preferences">
                  <CommandItem value="theme-light" onSelect={() => run(() => setTheme("light"))}>
                    <Sun />
                    Switch to light theme
                  </CommandItem>
                  <CommandItem value="theme-dark" onSelect={() => run(() => setTheme("dark"))}>
                    <Moon />
                    Switch to dark theme
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
          <div className="flex items-center gap-1.5 border-t px-3 py-2 text-xs text-muted-foreground">
            <CornerDownLeft className="size-3.5" aria-hidden="true" />
            to select
            <span className="mx-1">·</span>
            Esc to close
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
