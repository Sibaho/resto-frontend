"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { formatRupiah } from "@/lib/format";

type Props = {
  count: number;
  total: number;
  onOpen: () => void;
};

/**
 * Persistent floating cart (ui-spec §7). Hidden when empty; springs in on the
 * first add; the count badge pops on every add. Bottom-center, thumb-reachable,
 * safe-area padded.
 */
export function FloatingCart({ count, total, onOpen }: Props) {
  const controls = useAnimationControls();
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      // Pop on add (scale 1 → 1.15 → 1), respecting reduced motion via CSS.
      controls.start({
        scale: [1, 1.15, 1],
        transition: { duration: 0.26, ease: "easeOut" },
      });
    }
    prevCount.current = count;
  }, [count, controls]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 mx-auto flex max-w-[480px] justify-center px-4"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <AnimatePresence>
        {count > 0 && (
          <motion.button
            type="button"
            onClick={onOpen}
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-accent py-3 pl-4 pr-5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.4)] active:scale-[0.97]"
          >
            <span className="relative">
              <ShoppingBag className="h-6 w-6" />
              <motion.span
                animate={controls}
                className="tabular absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[12px] font-bold text-accent"
              >
                {count}
              </motion.span>
            </span>
            <span className="tabular text-[15px] font-semibold">
              {formatRupiah(total)}
            </span>
            <span className="text-[15px] font-medium opacity-90">View cart</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
