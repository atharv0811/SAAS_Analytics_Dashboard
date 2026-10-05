import type { Metadata } from "next";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { getTransactions } from "@/services";

export const metadata: Metadata = {
  title: "Transactions",
};

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  return <TransactionsView initialTransactions={transactions} />;
}
