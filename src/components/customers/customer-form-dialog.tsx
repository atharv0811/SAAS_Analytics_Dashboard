"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { CUSTOMER_STATUS } from "@/components/shared/status-badge";
import { PLANS, PLAN_IDS } from "@/data/plans";
import { customerFormSchema, type CustomerFormValues } from "@/lib/schemas/customer";
import { saveCustomer } from "@/services/mutations";
import type { Customer, CustomerStatus } from "@/types";

const EMPTY_VALUES: CustomerFormValues = {
  name: "",
  email: "",
  company: "",
  plan: "starter",
  billingCycle: "monthly",
  status: "trialing",
};

function toFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    email: customer.email,
    company: customer.company,
    plan: customer.subscription.plan,
    billingCycle: customer.subscription.billingCycle,
    status: customer.status,
  };
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this customer, otherwise it creates one. */
  customer?: Customer | null;
  onSaved: (values: CustomerFormValues) => void;
}

export function CustomerFormDialog({ open, onOpenChange, customer, onSaved }: CustomerFormDialogProps) {
  const editing = Boolean(customer);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  // Load the selected record (or a blank form) each time the dialog opens.
  useEffect(() => {
    if (open) reset(customer ? toFormValues(customer) : EMPTY_VALUES);
  }, [open, customer, reset]);

  const onSubmit = async (values: CustomerFormValues) => {
    await saveCustomer(values);
    onSaved(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update contact details and subscription settings."
              : "Create an account manually. New customers start on a 14-day trial by default."}
          </DialogDescription>
        </DialogHeader>
        <form id="customer-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" error={errors.name?.message} className="sm:col-span-2">
            {(field) => <Input {...field} {...register("name")} autoComplete="name" placeholder="Jordan Ellis" />}
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            {(field) => (
              <Input
                {...field}
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="jordan@company.com"
              />
            )}
          </FormField>
          <FormField label="Company" error={errors.company?.message}>
            {(field) => (
              <Input {...field} {...register("company")} autoComplete="organization" placeholder="Acme Studio" />
            )}
          </FormField>
          <FormField label="Plan" error={errors.plan?.message}>
            {(field) => (
              <Controller
                control={control}
                name="plan"
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger {...field} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_IDS.map((id) => (
                        <SelectItem key={id} value={id}>
                          {PLANS[id].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          <FormField label="Billing cycle" error={errors.billingCycle?.message}>
            {(field) => (
              <Controller
                control={control}
                name="billingCycle"
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger {...field} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual (17% off)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          <FormField label="Status" error={errors.status?.message} className="sm:col-span-2">
            {(field) => (
              <Controller
                control={control}
                name="status"
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger {...field} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CUSTOMER_STATUS) as CustomerStatus[]).map((status) => (
                        <SelectItem key={status} value={status}>
                          {CUSTOMER_STATUS[status].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="customer-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
