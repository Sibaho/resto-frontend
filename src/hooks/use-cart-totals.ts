"use client";

import { useCart } from "@/stores/cart";
import { computeCartTotals, type CartTotals } from "@/lib/cart-totals";

/**
 * Reactive cart money breakdown. Subscribes to cart lines and recomputes
 * subtotal / tax / total for the given tax rate — the one place views read
 * totals from, so the floating cart, drawer, and checkout never drift.
 */
export function useCartTotals(taxRate: number): CartTotals {
  const lines = useCart((s) => s.lines);
  return computeCartTotals(lines, taxRate);
}
