import type { CartLine } from "@/lib/cart-line";

export type CartTotals = {
  count: number; // total number of units
  subtotal: number; // pre-tax
  tax: number; // rounded to whole currency units (IDR has no minor unit)
  total: number; // subtotal + tax
};

/**
 * The single source of truth for cart money math. `taxRate` is a fraction
 * (0.11 = 11%) sourced from the restaurant/session — never hard-coded in a view.
 * Client totals are display estimates; the server re-prices on order placement.
 */
export function computeCartTotals(lines: CartLine[], taxRate: number): CartTotals {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const tax = Math.round(subtotal * taxRate);

  return { count, subtotal, tax, total: subtotal + tax };
}
