"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import type { MenuItem } from "@/lib/mock-menu";
import { formatRupiah } from "@/lib/format";

type Props = {
  item: MenuItem;
  priority?: boolean;
  onOpenDetail: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
};

/**
 * Full-bleed hero item card (ui-spec §5.1) — one per viewport. The photo is the
 * hero; name/description/price/tags sit on a bottom scrim. Tapping the body opens
 * the detail sheet; the circular QuickAdd adds the default configuration.
 */
export function ItemCard({ item, priority, onOpenDetail, onQuickAdd }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpenDetail(item)}
      className="relative block h-[100dvh] w-screen max-w-[480px] overflow-hidden text-left"
    >
      <Image
        src={item.imageUrl}
        alt={item.name}
        fill
        priority={priority}
        sizes="(max-width: 480px) 100vw, 480px"
        className="object-cover"
      />

      {/* Bottom scrim keeps white text legible over any photo */}
      <div className="scrim-bottom absolute inset-x-0 bottom-0 h-3/5" />

      {/* Content stack — anchored bottom, above floating-cart clearance (88pt) */}
      <div
        className="absolute inset-x-0 bottom-0 px-4"
        style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}
      >
        {item.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="material-blur rounded-full px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-[26px] font-bold leading-tight tracking-tight text-white">
          {item.name}
        </h2>
        <p className="mt-1.5 max-w-[42ch] text-[15px] leading-5 text-white/80">
          {item.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="tabular text-[20px] font-semibold text-white">
            {formatRupiah(item.price)}
          </span>
          <span
            role="button"
            tabIndex={0}
            aria-label={`Add ${item.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(item);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onQuickAdd(item);
              }
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-transform active:scale-90"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </button>
  );
}
