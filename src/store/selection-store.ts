import { create } from "zustand";

interface SelectionState {
  customerId: string | null;
  transactionId: string | null;
  selectCustomer: (id: string | null) => void;
  selectTransaction: (id: string | null) => void;
}

/**
 * The record open in a details drawer. Global so that the command palette in
 * the top bar can open a customer or transaction on another page.
 */
export const useSelectionStore = create<SelectionState>()((set) => ({
  customerId: null,
  transactionId: null,
  selectCustomer: (customerId) => set({ customerId }),
  selectTransaction: (transactionId) => set({ transactionId }),
}));
