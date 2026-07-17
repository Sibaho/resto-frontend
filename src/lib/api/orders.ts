import type { CartLine } from "@/lib/cart-line";

/** Payload shape accepted by `POST /api/v1/orders` (diner, pay-at-counter). */
export type PlaceOrderPayload = {
  items: {
    menu_item_id: string;
    quantity: number;
    modifier_option_ids?: string[];
    note?: string;
  }[];
  notes?: string;
};

export type PlacedOrder = {
  id: string;
  number: number;
  status: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  total: number;
};

export class ApiError extends Error {}

/** Build the order payload from client cart lines. */
export function toOrderPayload(lines: CartLine[], notes: string): PlaceOrderPayload {
  return {
    items: lines.map((line) => ({
      menu_item_id: line.menuItemId,
      quantity: line.quantity,
      modifier_option_ids: line.modifiers.map((m) => m.optionId),
    })),
    notes: notes.trim() === "" ? undefined : notes.trim(),
  };
}

/**
 * Submit an order. Diner-authenticated by the session token (minted at QR
 * check-in). The server re-prices, snapshots, and numbers the order — the client
 * total is only an estimate. Throws {@link ApiError} on a non-2xx / envelope error.
 */
export async function placeOrder(
  payload: PlaceOrderPayload,
  sessionToken: string,
): Promise<PlacedOrder> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";

  const response = await fetch(`${base}/api/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Session-Token": sessionToken,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new ApiError(json?.error?.message ?? "We couldn't place your order.");
  }

  return json.data as PlacedOrder;
}
