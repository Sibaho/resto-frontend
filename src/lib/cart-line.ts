import type { MenuItem, ModifierOption } from "@/lib/mock-menu";

/** A single cart line: an item at a fixed modifier configuration, with quantity. */
export type CartLine = {
  lineId: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  unitPrice: number; // base price + modifier deltas, per unit
  quantity: number;
  modifiers: { optionId: string; name: string; priceDelta: number }[];
};

/**
 * Stable identity for a configuration (item + chosen options), order-independent.
 * Two adds of the same item with the same options merge into one line.
 */
export function lineSignature(menuItemId: string, optionIds: string[]): string {
  return [menuItemId, ...[...optionIds].sort()].join("|");
}

function optionIdsOf(line: CartLine): string[] {
  return line.modifiers.map((m) => m.optionId);
}

function unitPriceOf(item: MenuItem, modifiers: ModifierOption[]): number {
  return item.price + modifiers.reduce((sum, m) => sum + m.priceDelta, 0);
}

/**
 * Add `quantity` of an item+modifier configuration. If an identical line already
 * exists its quantity is incremented; otherwise a new line is appended. Pure —
 * returns a new array and never mutates the input.
 *
 * `makeId` is injectable so tests can be deterministic.
 */
export function addItemToLines(
  lines: CartLine[],
  item: MenuItem,
  modifiers: ModifierOption[],
  quantity: number,
  makeId: () => string = () => crypto.randomUUID(),
): CartLine[] {
  if (quantity <= 0) return lines;

  const signature = lineSignature(
    item.id,
    modifiers.map((m) => m.id),
  );
  const existing = lines.find(
    (line) => lineSignature(line.menuItemId, optionIdsOf(line)) === signature,
  );

  if (existing) {
    return lines.map((line) =>
      line.lineId === existing.lineId
        ? { ...line, quantity: line.quantity + quantity }
        : line,
    );
  }

  const newLine: CartLine = {
    lineId: makeId(),
    menuItemId: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
    unitPrice: unitPriceOf(item, modifiers),
    quantity,
    modifiers: modifiers.map((m) => ({
      optionId: m.id,
      name: m.name,
      priceDelta: m.priceDelta,
    })),
  };

  return [...lines, newLine];
}

/**
 * Set an absolute quantity for a line. A quantity of 0 or less removes the line.
 * Pure — returns a new array.
 */
export function setQuantityInLines(
  lines: CartLine[],
  lineId: string,
  quantity: number,
): CartLine[] {
  if (quantity <= 0) {
    return lines.filter((line) => line.lineId !== lineId);
  }
  return lines.map((line) =>
    line.lineId === lineId ? { ...line, quantity } : line,
  );
}

/** Remove a line entirely. Pure — returns a new array. */
export function removeLineFromLines(
  lines: CartLine[],
  lineId: string,
): CartLine[] {
  return lines.filter((line) => line.lineId !== lineId);
}
