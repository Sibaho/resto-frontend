"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, ModifierOption } from "@/lib/mock-menu";
import {
  addItemToLines,
  removeLineFromLines,
  setQuantityInLines,
  type CartLine,
} from "@/lib/cart-line";
import { computeCartTotals, type CartTotals } from "@/lib/cart-totals";

export type { CartLine };
export type { CartTotals };

type CartState = {
  lines: CartLine[];
  addItem: (item: MenuItem, modifiers: ModifierOption[], quantity: number) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  incrementLine: (lineId: string) => void;
  decrementLine: (lineId: string) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
};

/**
 * Client cart (frontend-architecture §6). Persisted to localStorage so it
 * survives refresh/reconnect; all state transitions delegate to the pure,
 * unit-tested operations in `lib/cart-line` and never mutate.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      addItem: (item, modifiers, quantity) =>
        set((state) => ({ lines: addItemToLines(state.lines, item, modifiers, quantity) })),

      setQuantity: (lineId, quantity) =>
        set((state) => ({ lines: setQuantityInLines(state.lines, lineId, quantity) })),

      incrementLine: (lineId) =>
        set((state) => {
          const line = state.lines.find((l) => l.lineId === lineId);
          if (!line) return state;
          return { lines: setQuantityInLines(state.lines, lineId, line.quantity + 1) };
        }),

      decrementLine: (lineId) =>
        set((state) => {
          const line = state.lines.find((l) => l.lineId === lineId);
          if (!line) return state;
          return { lines: setQuantityInLines(state.lines, lineId, line.quantity - 1) };
        }),

      removeLine: (lineId) =>
        set((state) => ({ lines: removeLineFromLines(state.lines, lineId) })),

      clear: () => set({ lines: [] }),
    }),
    { name: "restosaas-cart" },
  ),
);

/** Total unit count across all lines (for the floating cart badge). */
export function selectCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Pre-tax subtotal. */
export function selectSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

/** Full money breakdown for a given tax rate (subtotal, tax, total, count). */
export function selectTotals(lines: CartLine[], taxRate: number): CartTotals {
  return computeCartTotals(lines, taxRate);
}
