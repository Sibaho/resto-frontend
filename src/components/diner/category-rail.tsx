"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Category } from "@/lib/mock-menu";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  activeId: string;
  onSelect: (categoryId: string) => void;
};

/**
 * Sticky category rail (ui-spec §8.1). Scroll-spy driven: the active chip is set
 * by whichever category the swipe deck is showing; tapping a chip jumps the deck.
 * The active pill slides between chips via a shared layout animation, and the
 * active chip auto-centers in the rail.
 */
export function CategoryRail({ categories, activeId, onSelect }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const chip = chipRefs.current[activeId];
    chip?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div
      className="absolute inset-x-0 z-30"
      style={{ top: "max(4.25rem, calc(env(safe-area-inset-top) + 3.25rem))" }}
    >
      <div
        ref={railRef}
        className="rail-mask no-scrollbar flex gap-2 overflow-x-auto px-4 py-2"
      >
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              ref={(el) => {
                chipRefs.current[category.id] = el;
              }}
              type="button"
              onClick={() => onSelect(category.id)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-[15px] font-medium transition-colors",
                isActive ? "text-white" : "text-white/70",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="rail-active-pill"
                  className="absolute inset-0 rounded-full bg-accent shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
