import type { Metadata } from "next";
import { CustomersView } from "@/components/customers/customers-view";
import { getCustomers, getTransactions } from "@/services";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function CustomersPage() {
  const [customers, transactions] = await Promise.all([getCustomers(), getTransactions()]);
  return <CustomersView initialCustomers={customers} transactions={transactions} />;
}
