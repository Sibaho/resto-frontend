"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { restaurant } from "@/lib/mock-menu";
import { selectSubtotal, useCart } from "@/stores/cart";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
};

/** Cart drawer (ui-spec §7 / frontend-arch §5.4) — editable lines + live totals. */
export function CartDrawer({ open, onOpenChange, onCheckout }: Props) {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeLine = useCart((s) => s.removeLine);

  const subtotal = selectSubtotal(lines);
  const tax = subtotal * restaurant.taxRate;
  const total = subtotal + tax;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="flex items-baseline justify-between px-4 pt-4">
          <DrawerTitle>Your order</DrawerTitle>
          <span className="text-[14px] text-ink-muted">{restaurant.tableLabel}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {lines.length === 0 ? (
            <p className="py-16 text-center text-[15px] text-ink-muted">
              Your cart is empty.
            </p>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.li
                    key={line.lineId}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex gap-3 overflow-hidden"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[15px] font-semibold">{line.name}</p>
                        <button
                          type="button"
                          aria-label={`Remove ${line.name}`}
                          onClick={() => removeLine(line.lineId)}
                          className="text-ink-muted transition-colors hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {line.modifiers.length > 0 && (
                        <p className="truncate text-[13px] text-ink-muted">
                          {line.modifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQuantity(line.lineId, line.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full active:scale-90"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="tabular w-5 text-center text-[14px] font-semibold">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setQuantity(line.lineId, line.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="tabular text-[15px] font-semibold">
                          {formatRupiah(line.unitPrice * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div
            className="border-t border-line px-4 pt-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <dl className="space-y-1.5 text-[14px]">
              <div className="flex justify-between text-ink-muted">
                <dt>Subtotal</dt>
                <dd className="tabular">{formatRupiah(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Tax ({Math.round(restaurant.taxRate * 100)}%)</dt>
                <dd className="tabular">{formatRupiah(tax)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-[17px] font-semibold text-ink">
                <dt>Total</dt>
                <dd className="tabular">{formatRupiah(total)}</dd>
              </div>
            </dl>
            <Button size="lg" className="mt-4 w-full justify-between" onClick={onCheckout}>
              <span>Place order</span>
              <span className="tabular">{formatRupiah(total)}</span>
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
