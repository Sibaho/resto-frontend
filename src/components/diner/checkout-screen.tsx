"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { restaurant } from "@/lib/mock-menu";
import { useCart } from "@/stores/cart";
import { useCartTotals } from "@/hooks/use-cart-totals";
import { ApiError, placeOrder, toOrderPayload } from "@/lib/api/orders";

const SESSION_TOKEN_KEY = "restosaas-session-token";

/**
 * Checkout / order review (frontend-architecture §5.4). Anonymous diner, table
 * from the session, an optional order note, and a single payment method:
 * pay at the counter. Submitting posts to the diner order endpoint; the server
 * re-prices and numbers the order.
 */
export function CheckoutScreen() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const { subtotal, tax, total } = useCartTotals(restaurant.taxRate);

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedNumber, setPlacedNumber] = useState<number | null>(null);

  async function handlePlaceOrder() {
    setSubmitting(true);
    setError(null);

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem(SESSION_TOKEN_KEY)
        : null;

    try {
      if (token) {
        const order = await placeOrder(toOrderPayload(lines, notes), token);
        setPlacedNumber(order.number);
      } else {
        // No live session (standalone demo): confirm optimistically.
        setPlacedNumber(Math.floor(Math.random() * 900) + 100);
      }
      clear();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placedNumber !== null) {
    return (
      <main className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          <CheckCircle2 className="h-24 w-24 text-success" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h1 className="text-[26px] font-bold text-ink">Order #{placedNumber} placed</h1>
          <p className="mt-2 text-[15px] text-ink-muted">
            Please pay at the counter. We&apos;ll start preparing your food right away.
          </p>
        </div>
        <Button asChild size="lg" className="mt-2 w-full max-w-xs">
          <Link href="/m">Order more</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col bg-canvas">
      <header
        className="flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          aria-label="Back to menu"
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-ink">Review order</h1>
          <p className="text-[13px] text-ink-muted">{restaurant.tableLabel}</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-[15px] text-ink-muted">Your cart is empty.</p>
            <Button asChild variant="secondary">
              <Link href="/m">Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-line">
              {lines.map((line) => (
                <li key={line.lineId} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-ink">
                      <span className="tabular text-ink-muted">{line.quantity}×</span>{" "}
                      {line.name}
                    </p>
                    {line.modifiers.length > 0 && (
                      <p className="truncate text-[13px] text-ink-muted">
                        {line.modifiers.map((m) => m.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="tabular shrink-0 text-[15px] font-semibold text-ink">
                    {formatRupiah(line.unitPrice * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <label className="mt-5 block">
              <span className="text-[14px] font-medium text-ink-muted">
                Order note (optional)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Allergies, spice preference, no cutlery…"
                className="mt-2 w-full resize-none rounded-md border border-line bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-muted/70 focus:border-accent focus:outline-none"
              />
            </label>

            <div className="mt-5 rounded-lg border border-line bg-surface p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Store className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-ink">Pay at the counter</p>
                  <p className="text-[13px] text-ink-muted">
                    Settle your bill with cash or card when you&apos;re done.
                  </p>
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-1.5 text-[14px]">
              <div className="flex justify-between text-ink-muted">
                <dt>Subtotal</dt>
                <dd className="tabular">{formatRupiah(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Tax ({Math.round(restaurant.taxRate * 100)}%)</dt>
                <dd className="tabular">{formatRupiah(tax)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-[18px] font-semibold text-ink">
                <dt>Total</dt>
                <dd className="tabular">{formatRupiah(total)}</dd>
              </div>
            </dl>
          </>
        )}
      </div>

      {lines.length > 0 && (
        <div
          className="border-t border-line bg-canvas px-4 pt-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {error && (
            <p className="mb-3 text-center text-[14px] text-danger" role="alert">
              {error}
            </p>
          )}
          <Button
            size="lg"
            className="w-full justify-between"
            disabled={submitting}
            onClick={handlePlaceOrder}
          >
            <span>{submitting ? "Placing…" : "Place order"}</span>
            <span className="tabular">{formatRupiah(total)}</span>
          </Button>
        </div>
      )}
    </main>
  );
}
