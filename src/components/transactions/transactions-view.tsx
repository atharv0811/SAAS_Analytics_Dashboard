"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { CalendarDays, CircleDot, CreditCard, Download, Eye, Receipt, SearchX, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilterSelect, SortableHead, TablePagination, TableSearch } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PAYMENT_METHODS, PaymentMethodLabel, describePaymentMethod } from "@/components/shared/payment-method";
import { TRANSACTION_STATUS, TransactionStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { UserAvatar } from "@/components/shared/user-avatar";
import { TransactionDetailsSheet } from "@/components/transactions/transaction-details-sheet";
import { TransactionSummary } from "@/components/transactions/transaction-summary";
import { useDataTable } from "@/hooks/use-data-table";
import { REFERENCE_DATE } from "@/lib/constants";
import { downloadCsv } from "@/lib/csv";
import { addDays } from "@/lib/dates";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useSelectionStore } from "@/store/selection-store";
import type { PaymentMethod, Transaction, TransactionStatus } from "@/types";

type SortKey = "id" | "customer" | "amount" | "status" | "createdAt";

const SORT_ACCESSORS: Record<SortKey, (transaction: Transaction) => string | number> = {
  id: (transaction) => transaction.id,
  customer: (transaction) => transaction.customerName,
  amount: (transaction) => transaction.amount,
  status: (transaction) => TRANSACTION_STATUS[transaction.status].label,
  createdAt: (transaction) => transaction.createdAt,
};

const STATUS_OPTIONS = (Object.keys(TRANSACTION_STATUS) as TransactionStatus[]).map((status) => ({
  value: status,
  label: TRANSACTION_STATUS[status].label,
}));

const METHOD_OPTIONS = (Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => ({
  value: method,
  label: PAYMENT_METHODS[method].label,
}));

const DATE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const AMOUNT_RANGES: Record<string, { label: string; min: number; max: number }> = {
  small: { label: "Under $50", min: 0, max: 50 },
  medium: { label: "$50 – $500", min: 50, max: 500 },
  large: { label: "Over $500", min: 500, max: Number.POSITIVE_INFINITY },
};

const AMOUNT_OPTIONS = Object.entries(AMOUNT_RANGES).map(([value, range]) => ({ value, label: range.label }));

export function TransactionsView({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [period, setPeriod] = useState("all");
  const [amount, setAmount] = useState("all");

  const detailsId = useSelectionStore((state) => state.transactionId);
  const selectTransaction = useSelectionStore((state) => state.selectTransaction);
  const detailsTransaction = transactions.find((transaction) => transaction.id === detailsId) ?? null;

  useEffect(() => () => selectTransaction(null), [selectTransaction]);

  const query = useDeferredValue(search.trim().toLowerCase());
  const predicate = useCallback(
    (transaction: Transaction) => {
      const since = period === "all" ? null : addDays(REFERENCE_DATE, -(Number(period) - 1));
      const range = AMOUNT_RANGES[amount];
      return (
        (status === "all" || transaction.status === status) &&
        (method === "all" || transaction.paymentMethod === method) &&
        (!since || transaction.createdAt.slice(0, 10) >= since) &&
        (!range || (transaction.amount >= range.min && transaction.amount < range.max)) &&
        (!query ||
          transaction.id.toLowerCase().includes(query) ||
          transaction.invoiceId.toLowerCase().includes(query) ||
          transaction.customerName.toLowerCase().includes(query) ||
          transaction.company.toLowerCase().includes(query) ||
          transaction.customerEmail.includes(query))
      );
    },
    [status, method, period, amount, query],
  );

  const table = useDataTable<Transaction, SortKey>({
    data: transactions,
    predicate,
    sortAccessors: SORT_ACCESSORS,
    initialSort: { key: "createdAt", direction: "desc" },
  });

  const hasFilters = Boolean(search) || [status, method, period, amount].some((value) => value !== "all");

  const withPageReset = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    table.resetPage();
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setMethod("all");
    setPeriod("all");
    setAmount("all");
    table.resetPage();
  };

  const handleRefunded = (id: string) =>
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id ? { ...transaction, status: "refunded" as const } : transaction,
      ),
    );

  const handleExport = () => {
    downloadCsv(
      "metricflow-transactions.csv",
      table.filtered.map((transaction) => ({
        id: transaction.id,
        invoice: transaction.invoiceId,
        customer: transaction.customerName,
        company: transaction.company,
        amount: transaction.amount,
        fee: transaction.fee,
        status: TRANSACTION_STATUS[transaction.status].label,
        payment_method: describePaymentMethod(transaction),
        created_at: transaction.createdAt,
      })),
    );
    toast.success(`Exported ${table.filtered.length} transactions`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Every charge, refund and failed payment across your customer base."
        actions={
          <Button variant="outline" className="bg-card" onClick={handleExport} disabled={!table.filtered.length}>
            <Download />
            Export CSV
          </Button>
        }
      />

      <TransactionSummary transactions={table.filtered} filtered={hasFilters} />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-2 border-b p-4 sm:px-6 xl:flex-row xl:items-center">
          <TableSearch
            value={search}
            onChange={withPageReset(setSearch)}
            placeholder="Search ID, invoice or customer"
            label="Search transactions"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <FilterSelect
              value={status}
              onChange={withPageReset(setStatus)}
              options={STATUS_OPTIONS}
              allLabel="All statuses"
              label="Filter by status"
              icon={CircleDot}
            />
            <FilterSelect
              value={method}
              onChange={withPageReset(setMethod)}
              options={METHOD_OPTIONS}
              allLabel="All methods"
              label="Filter by payment method"
              icon={CreditCard}
            />
            <FilterSelect
              value={period}
              onChange={withPageReset(setPeriod)}
              options={DATE_OPTIONS}
              allLabel="All time"
              label="Filter by date"
              icon={CalendarDays}
            />
            <FilterSelect
              value={amount}
              onChange={withPageReset(setAmount)}
              options={AMOUNT_OPTIONS}
              allLabel="Any amount"
              label="Filter by amount"
              icon={Wallet}
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="self-start xl:self-auto">
              <X />
              Clear filters
            </Button>
          )}
        </div>

        {table.rows.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No transactions match your filters"
              description="Adjust the date range or payment filters, or clear them to see every transaction."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Payments appear here as soon as your first customer is billed."
            />
          )
        ) : (
          <Table className="min-w-[840px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortableHead
                  label="Transaction ID"
                  sortKey="id"
                  sort={table.sort}
                  onSort={table.toggleSort}
                  className="pl-4 sm:pl-6"
                />
                <SortableHead label="Customer" sortKey="customer" sort={table.sort} onSort={table.toggleSort} />
                <SortableHead
                  label="Amount"
                  sortKey="amount"
                  sort={table.sort}
                  onSort={table.toggleSort}
                  align="right"
                />
                <SortableHead label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                <TableHead>Payment method</TableHead>
                <SortableHead label="Date" sortKey="createdAt" sort={table.sort} onSort={table.toggleSort} />
                <TableHead className="w-12 pr-4 sm:pr-6">
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="cursor-pointer"
                  onClick={() => selectTransaction(transaction.id)}
                >
                  <TableCell className="pl-4 font-mono text-xs text-muted-foreground sm:pl-6">
                    {transaction.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={transaction.customerName} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium">{transaction.customerName}</p>
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="tabular text-right font-medium">
                    {formatCurrency(transaction.amount, { precise: true })}
                  </TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentMethodLabel transaction={transaction} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <time dateTime={transaction.createdAt} className="whitespace-nowrap">
                      {formatDateTime(transaction.createdAt)}
                    </time>
                  </TableCell>
                  <TableCell className="pr-4 text-right sm:pr-6">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View ${transaction.id}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectTransaction(transaction.id);
                      }}
                    >
                      <Eye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {table.rows.length > 0 && (
          <TablePagination
            page={table.page}
            pageCount={table.pageCount}
            pageSize={table.pageSize}
            totalRows={table.filtered.length}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
            itemLabel="transactions"
          />
        )}
      </Card>

      <TransactionDetailsSheet
        transaction={detailsTransaction}
        onOpenChange={(open) => !open && selectTransaction(null)}
        onRefunded={handleRefunded}
      />
    </div>
  );
}
