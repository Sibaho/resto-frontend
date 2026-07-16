"use client";

import { Bell } from "lucide-react";
import { restaurant } from "@/lib/mock-menu";

/**
 * Collapsing brand header over the imagery (ui-spec §8.2). Sits on a top scrim so
 * the restaurant name + table label stay legible over any photo.
 */
export function RestaurantHeader() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
      <div className="scrim-top absolute inset-x-0 top-0 h-28" />
      <div
        className="relative flex items-start justify-between px-4 pt-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div>
          <p className="font-display text-[22px] font-semibold leading-tight text-white drop-shadow">
            {restaurant.name}
          </p>
          <p className="text-[13px] font-medium text-white/70">
            {restaurant.tableLabel}
          </p>
        </div>
        <button
          type="button"
          aria-label="Call staff"
          className="material-blur pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform active:scale-95"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
