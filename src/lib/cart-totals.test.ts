import { describe, expect, it } from "vitest";
import type { CartLine } from "@/lib/cart-line";
import { computeCartTotals } from "@/lib/cart-totals";

function line(unitPrice: number, quantity: number): CartLine {
  return {
    lineId: crypto.randomUUID(),
    menuItemId: "i",
    name: "Item",
    imageUrl: "",
    unitPrice,
    quantity,
    modifiers: [],
  };
}

describe("computeCartTotals", () => {
  it("returns zeros for an empty cart", () => {
    expect(computeCartTotals([], 0.11)).toEqual({
      count: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
    });
  });

  it("sums quantities and prices across lines", () => {
    const totals = computeCartTotals([line(50000, 2), line(30000, 1)], 0.11);

    expect(totals.count).toBe(3);
    expect(totals.subtotal).toBe(130000);
  });

  it("applies the tax rate and rounds to whole currency units", () => {
    // 130000 * 0.11 = 14300 exactly
    const totals = computeCartTotals([line(130000, 1)], 0.11);
    expect(totals.tax).toBe(14300);
    expect(totals.total).toBe(144300);
  });

  it("rounds fractional tax to the nearest whole unit", () => {
    // 33333 * 0.11 = 3666.63 → 3667
    const totals = computeCartTotals([line(33333, 1)], 0.11);
    expect(totals.tax).toBe(3667);
    expect(totals.total).toBe(37000);
  });

  it("charges no tax at a zero rate", () => {
    const totals = computeCartTotals([line(10000, 2)], 0);
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(20000);
  });
});
