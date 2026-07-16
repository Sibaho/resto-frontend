"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, ModifierOption } from "@/lib/mock-menu";

export type CartLine = {
  lineId: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  unitPrice: number; // base + modifier deltas, per unit
  quantity: number;
  modifiers: { optionId: string; name: string; priceDelta: number }[];
};

type CartState = {
  lines: CartLine[];
  addItem: (item: MenuItem, modifiers: ModifierOption[], quantity: number) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
};

function signatureFor(itemId: string, modifiers: ModifierOption[]): string {
  return [itemId, ...modifiers.map((m) => m.id).sort()].join("|");
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      addItem: (item, modifiers, quantity) =>
        set((state) => {
          const unitPrice =
            item.price + modifiers.reduce((sum, m) => sum + m.priceDelta, 0);
          const sig = signatureFor(item.id, modifiers);

          // Merge identical configurations into one line (immutably).
          const existing = state.lines.find(
            (line) => signatureFor(line.menuItemId, lineOptions(line)) === sig,
          );

          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.lineId === existing.lineId
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              ),
            };
          }

          const newLine: CartLine = {
            lineId: crypto.randomUUID(),
            menuItemId: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            unitPrice,
            quantity,
            modifiers: modifiers.map((m) => ({
              optionId: m.id,
              name: m.name,
              priceDelta: m.priceDelta,
            })),
          };

          return { lines: [...state.lines, newLine] };
        }),

      setQuantity: (lineId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.lineId !== lineId)
              : state.lines.map((line) =>
                  line.lineId === lineId ? { ...line, quantity } : line,
                ),
        })),

      removeLine: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.lineId !== lineId),
        })),

      clear: () => set({ lines: [] }),
    }),
    { name: "restosaas-cart" },
  ),
);

function lineOptions(line: CartLine): ModifierOption[] {
  return line.modifiers.map((m) => ({
    id: m.optionId,
    name: m.name,
    priceDelta: m.priceDelta,
  }));
}

/** Total item count across all lines. */
export function selectCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Pre-tax subtotal. */
export function selectSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
