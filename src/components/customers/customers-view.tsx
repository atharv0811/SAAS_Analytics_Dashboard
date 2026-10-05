"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { CircleDot, Download, Layers, Plus, Trash2, UserRoundSearch, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerDetailsSheet } from "@/components/customers/customer-details-sheet";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { CustomerRowActions } from "@/components/customers/customer-row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FilterSelect, SortableHead, TablePagination, TableSearch } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PlanBadge } from "@/components/shared/plan-badge";
import { CUSTOMER_STATUS, CustomerStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useDataTable } from "@/hooks/use-data-table";
import { PLANS, PLAN_IDS } from "@/data/plans";
import { applyCustomerForm, nextCustomerId } from "@/lib/customers";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { CustomerFormValues } from "@/lib/schemas/customer";
import { useSelectionStore } from "@/store/selection-store";
import type { Customer, CustomerStatus, Transaction } from "@/types";

type SortKey = "name" | "plan" | "status" | "revenue" | "joinedAt";

const PLAN_ORDER = Object.fromEntries(PLAN_IDS.map((id, index) => [id, index]));

const SORT_ACCESSORS: Record<SortKey, (customer: Customer) => string | number> = {
  name: (customer) => customer.name,
  plan: (customer) => PLAN_ORDER[customer.subscription.plan],
  status: (customer) => CUSTOMER_STATUS[customer.status].label,
  revenue: (customer) => customer.revenue,
  joinedAt: (customer) => customer.joinedAt,
};

const PLAN_OPTIONS = PLAN_IDS.map((id) => ({ value: id, label: PLANS[id].name }));
const STATUS_OPTIONS = (Object.keys(CUSTOMER_STATUS) as CustomerStatus[]).map((status) => ({
  value: status,
  label: CUSTOMER_STATUS[status].label,
}));

interface CustomersViewProps {
  initialCustomers: Customer[];
  transactions: Transaction[];
}

export function CustomersView({ initialCustomers, transactions }: CustomersViewProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formState, setFormState] = useState<{ open: boolean; customer: Customer | null }>({
    open: false,
    customer: null,
  });
  const [pendingDelete, setPendingDelete] = useState<Customer[] | null>(null);

  const detailsId = useSelectionStore((state) => state.customerId);
  const selectCustomer = useSelectionStore((state) => state.selectCustomer);
  const detailsCustomer = customers.find((customer) => customer.id === detailsId) ?? null;

  // The drawer selection is global (the command palette sets it); clear it when leaving the page.
  useEffect(() => () => selectCustomer(null), [selectCustomer]);

  const query = useDeferredValue(search.trim().toLowerCase());
  const predicate = useCallback(
    (customer: Customer) =>
      (planFilter === "all" || customer.subscription.plan === planFilter) &&
      (statusFilter === "all" || customer.status === statusFilter) &&
      (!query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.includes(query) ||
        customer.company.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query)),
    [planFilter, statusFilter, query],
  );

  const table = useDataTable<Customer, SortKey>({
    data: customers,
    predicate,
    sortAccessors: SORT_ACCESSORS,
    initialSort: { key: "joinedAt", direction: "desc" },
  });

  const hasFilters = Boolean(search) || planFilter !== "all" || statusFilter !== "all";
  const pageIds = table.rows.map((customer) => customer.id);
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const headerChecked =
    selectedOnPage === 0 ? false : selectedOnPage === pageIds.length ? true : ("indeterminate" as const);

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      table.resetPage();
    };

  const clearFilters = () => {
    setSearch("");
    setPlanFilter("all");
    setStatusFilter("all");
    table.resetPage();
  };

  const toggleRow = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const togglePage = (checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  const handleSaved = (values: CustomerFormValues) => {
    const existing = formState.customer;
    if (existing) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === existing.id ? applyCustomerForm(values, existing.id, existing) : customer,
        ),
      );
      toast.success("Customer updated", { description: `${values.name}'s details were saved.` });
    } else {
      setCustomers((current) => [applyCustomerForm(values, nextCustomerId(current)), ...current]);
      toast.success("Customer added", { description: `${values.name} was added to ${values.company}.` });
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const ids = new Set(pendingDelete.map((customer) => customer.id));
    setCustomers((current) => current.filter((customer) => !ids.has(customer.id)));
    setSelected((current) => new Set([...current].filter((id) => !ids.has(id))));
    if (detailsId && ids.has(detailsId)) selectCustomer(null);
    toast.success(pendingDelete.length === 1 ? "Customer deleted" : `${pendingDelete.length} customers deleted`, {
      description: "Changes in this demo reset when the page reloads.",
    });
    setPendingDelete(null);
  };

  const exportSelected = () => {
    const rows = customers.filter((customer) => selected.has(customer.id));
    downloadCsv(
      "metricflow-customers.csv",
      rows.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        company: customer.company,
        plan: PLANS[customer.subscription.plan].name,
        status: CUSTOMER_STATUS[customer.status].label,
        mrr: customer.subscription.mrr,
        lifetime_revenue: customer.revenue,
        joined: customer.joinedAt.slice(0, 10),
      })),
    );
    toast.success(`Exported ${rows.length} ${rows.length === 1 ? "customer" : "customers"}`);
  };

  const openEdit = (customer: Customer) => {
    selectCustomer(null);
    setFormState({ open: true, customer });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description={`${formatNumber(customers.length)} accounts across all plans and lifecycle stages.`}
        actions={
          <Button onClick={() => setFormState({ open: true, customer: null })}>
            <Plus />
            Add customer
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <TableSearch
              value={search}
              onChange={withPageReset(setSearch)}
              placeholder="Search name, email or company"
              label="Search customers"
            />
            <div className="flex gap-2">
              <FilterSelect
                value={planFilter}
                onChange={withPageReset(setPlanFilter)}
                options={PLAN_OPTIONS}
                allLabel="All plans"
                label="Filter by plan"
                icon={Layers}
              />
              <FilterSelect
                value={statusFilter}
                onChange={withPageReset(setStatusFilter)}
                options={STATUS_OPTIONS}
                allLabel="All statuses"
                label="Filter by status"
                icon={CircleDot}
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="self-start sm:self-auto">
                <X />
                Clear
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="tabular font-medium text-foreground">{formatNumber(table.filtered.length)}</span>{" "}
            {table.filtered.length === 1 ? "customer" : "customers"}
            {hasFilters && ` of ${formatNumber(customers.length)}`}
          </p>
        </div>

        {selected.size > 0 && (
          <div
            className="flex flex-wrap items-center gap-2 border-b bg-accent/60 px-4 py-2 sm:px-6"
            role="region"
            aria-label="Bulk actions"
          >
            <span className="mr-auto text-sm font-medium text-accent-foreground">{selected.size} selected</span>
            <Button variant="outline" size="sm" className="bg-card" onClick={exportSelected}>
              <Download />
              Export CSV
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setPendingDelete(customers.filter((customer) => selected.has(customer.id)))}
            >
              <Trash2 />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear selection
            </Button>
          </div>
        )}

        {table.rows.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={UserRoundSearch}
              title="No customers match your filters"
              description="Try a different search term or remove a filter to see more results."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Customers appear here when they start a trial or subscribe. You can also add one manually."
              action={
                <Button onClick={() => setFormState({ open: true, customer: null })}>
                  <Plus />
                  Add customer
                </Button>
              }
            />
          )
        ) : (
          <Table className="min-w-[880px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-4 sm:pl-6">
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={(checked) => togglePage(checked === true)}
                    aria-label="Select all customers on this page"
                  />
                </TableHead>
                <SortableHead label="Customer" sortKey="name" sort={table.sort} onSort={table.toggleSort} />
                <TableHead>Email</TableHead>
                <SortableHead label="Plan" sortKey="plan" sort={table.sort} onSort={table.toggleSort} />
                <SortableHead label="Status" sortKey="status" sort={table.sort} onSort={table.toggleSort} />
                <SortableHead
                  label="Revenue"
                  sortKey="revenue"
                  sort={table.sort}
                  onSort={table.toggleSort}
                  align="right"
                />
                <SortableHead label="Joined" sortKey="joinedAt" sort={table.sort} onSort={table.toggleSort} />
                <TableHead className="w-12 pr-4 text-right sm:pr-6">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((customer) => {
                const isSelected = selected.has(customer.id);
                return (
                  <TableRow
                    key={customer.id}
                    data-state={isSelected ? "selected" : undefined}
                    className="group cursor-pointer"
                    onClick={() => selectCustomer(customer.id)}
                  >
                    <TableCell className="pl-4 sm:pl-6" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => toggleRow(customer.id, checked === true)}
                        aria-label={`Select ${customer.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={customer.name} size="sm" />
                        <div className="min-w-0">
                          <button
                            type="button"
                            className="rounded font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                            onClick={(event) => {
                              event.stopPropagation();
                              selectCustomer(customer.id);
                            }}
                          >
                            {customer.name}
                          </button>
                          <p className="text-xs text-muted-foreground">{customer.company}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell>
                      <PlanBadge plan={customer.subscription.plan} />
                    </TableCell>
                    <TableCell>
                      <CustomerStatusBadge status={customer.status} />
                    </TableCell>
                    <TableCell className="tabular text-right font-medium">{formatCurrency(customer.revenue)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <time dateTime={customer.joinedAt} className="whitespace-nowrap">
                        {formatDate(customer.joinedAt)}
                      </time>
                    </TableCell>
                    <TableCell className="pr-4 text-right sm:pr-6" onClick={(event) => event.stopPropagation()}>
                      <CustomerRowActions
                        customer={customer}
                        onView={() => selectCustomer(customer.id)}
                        onEdit={() => openEdit(customer)}
                        onDelete={() => setPendingDelete([customer])}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
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
            itemLabel="customers"
          />
        )}
      </Card>

      <CustomerDetailsSheet
        customer={detailsCustomer}
        transactions={transactions}
        onOpenChange={(open) => !open && selectCustomer(null)}
        onEdit={openEdit}
      />
      <CustomerFormDialog
        open={formState.open}
        customer={formState.customer}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
        onSaved={handleSaved}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={
          pendingDelete?.length === 1
            ? `Delete ${pendingDelete[0].name}?`
            : `Delete ${pendingDelete?.length ?? 0} customers?`
        }
        description="Their subscriptions are cancelled immediately and billing history is archived. This action can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
