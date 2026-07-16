import { describe, expect, it } from "vitest";
import type { MenuItem, ModifierOption } from "@/lib/mock-menu";
import {
  addItemToLines,
  lineSignature,
  removeLineFromLines,
  setQuantityInLines,
  type CartLine,
} from "@/lib/cart-line";

function makeItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: "i-ramen",
    categoryId: "c-ramen",
    name: "Tonkotsu Ramen",
    description: "",
    price: 78000,
    imageUrl: "https://example.test/ramen.jpg",
    tags: [],
    modifierGroups: [],
    ...overrides,
  };
}

const egg: ModifierOption = { id: "o-egg", name: "Egg", priceDelta: 12000 };
const nori: ModifierOption = { id: "o-nori", name: "Nori", priceDelta: 8000 };

// Deterministic id generator for stable assertions.
function seqIds() {
  let n = 0;
  return () => `line-${++n}`;
}

describe("addItemToLines", () => {
  it("adds a new line with the base price when there are no modifiers", () => {
    const lines = addItemToLines([], makeItem(), [], 2, seqIds());

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      lineId: "line-1",
      menuItemId: "i-ramen",
      unitPrice: 78000,
      quantity: 2,
    });
  });

  it("folds modifier deltas into the unit price", () => {
    const lines = addItemToLines([], makeItem(), [egg, nori], 1, seqIds());

    expect(lines[0].unitPrice).toBe(78000 + 12000 + 8000);
    expect(lines[0].modifiers).toHaveLength(2);
  });

  it("merges an identical configuration into the existing line", () => {
    const ids = seqIds();
    let lines = addItemToLines([], makeItem(), [egg], 1, ids);
    lines = addItemToLines(lines, makeItem(), [egg], 2, ids);

    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("treats different modifier sets as separate lines", () => {
    const ids = seqIds();
    let lines = addItemToLines([], makeItem(), [egg], 1, ids);
    lines = addItemToLines(lines, makeItem(), [nori], 1, ids);

    expect(lines).toHaveLength(2);
  });

  it("merges regardless of modifier order", () => {
    expect(lineSignature("i-ramen", ["o-egg", "o-nori"])).toBe(
      lineSignature("i-ramen", ["o-nori", "o-egg"]),
    );
  });

  it("does not mutate the input array", () => {
    const original: CartLine[] = [];
    addItemToLines(original, makeItem(), [], 1, seqIds());
    expect(original).toHaveLength(0);
  });

  it("ignores non-positive quantities", () => {
    expect(addItemToLines([], makeItem(), [], 0, seqIds())).toHaveLength(0);
  });
});

describe("setQuantityInLines", () => {
  it("updates an existing line quantity", () => {
    const lines = addItemToLines([], makeItem(), [], 1, seqIds());
    const updated = setQuantityInLines(lines, "line-1", 5);
    expect(updated[0].quantity).toBe(5);
  });

  it("removes the line when quantity drops to zero", () => {
    const lines = addItemToLines([], makeItem(), [], 1, seqIds());
    expect(setQuantityInLines(lines, "line-1", 0)).toHaveLength(0);
  });
});

describe("removeLineFromLines", () => {
  it("removes the matching line only", () => {
    const ids = seqIds();
    let lines = addItemToLines([], makeItem(), [egg], 1, ids);
    lines = addItemToLines(lines, makeItem(), [nori], 1, ids);

    const remaining = removeLineFromLines(lines, "line-1");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].lineId).toBe("line-2");
  });
});
