/**
 * Service layer: the single boundary between UI and data.
 *
 * Every function is async and returns plain serialisable objects, so swapping
 * the mock modules for `fetch()` calls to a REST API changes nothing upstream.
 */
import { customers } from "@/data/customers";
import { transactions } from "@/data/transactions";
import { ACTIVE_SESSIONS, CURRENT_USER, NOTIFICATIONS, WORKSPACE } from "@/data/account";
import type { Customer, SearchIndex, Transaction } from "@/types";

export async function getCustomers(): Promise<Customer[]> {
  return customers;
}

export async function getRecentCustomers(limit = 5): Promise<Customer[]> {
  return customers.filter((customer) => customer.status !== "churned").slice(0, limit);
}

export async function getTransactions(): Promise<Transaction[]> {
  return transactions;
}

export async function getRecentTransactions(limit = 6): Promise<Transaction[]> {
  return transactions.slice(0, limit);
}

export async function getSearchIndex(): Promise<SearchIndex> {
  return {
    customers: customers.map(({ id, name, email, company }) => ({ id, name, email, company })),
    transactions: transactions.map(({ id, customerName, amount, status }) => ({
      id,
      customerName,
      amount,
      status,
    })),
  };
}

export async function getCurrentUser() {
  return CURRENT_USER;
}

export async function getWorkspace() {
  return WORKSPACE;
}

export async function getNotifications() {
  return NOTIFICATIONS;
}

export async function getActiveSessions() {
  return ACTIVE_SESSIONS;
}
