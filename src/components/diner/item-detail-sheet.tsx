"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import type { MenuItem, ModifierGroup, ModifierOption } from "@/lib/mock-menu";
import { cn } from "@/lib/utils";

type Props = {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: MenuItem, modifiers: ModifierOption[], quantity: number) => void;
};

/**
 * Item Detail bottom sheet (ui-spec §6). Shows the gallery, modifier groups
 * (single- or multi-select honoring min/max), a quantity stepper, and a sticky
 * add-to-cart bar showing the live line total. Required groups gate the CTA.
 */
export function ItemDetailSheet({ item, open, onOpenChange, onAdd }: Props) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  // Reset selections whenever a new item opens.
  useEffect(() => {
    if (item && open) {
      const defaults: Record<string, string[]> = {};
      for (const group of item.modifierGroups) {
        // Pre-select the first option of a required single-choice group.
        defaults[group.id] =
          group.isRequired && group.maxSelect === 1 && group.options[0]
            ? [group.options[0].id]
            : [];
      }
      setSelected(defaults);
      setQuantity(1);
    }
  }, [item, open]);

  const chosenOptions = useMemo<ModifierOption[]>(() => {
    if (!item) return [];
    return item.modifierGroups.flatMap((group) =>
      group.options.filter((o) => selected[group.id]?.includes(o.id)),
    );
  }, [item, selected]);

  const unitPrice =
    (item?.price ?? 0) + chosenOptions.reduce((s, o) => s + o.priceDelta, 0);
  const lineTotal = unitPrice * quantity;

  const unmetRequired = item
    ? item.modifierGroups.filter(
        (g) => g.isRequired && (selected[g.id]?.length ?? 0) < Math.max(1, g.minSelect),
      )
    : [];
  const canAdd = unmetRequired.length === 0;

  function toggle(group: ModifierGroup, optionId: string) {
    setSelected((prev) => {
      const current = prev[group.id] ?? [];
      if (group.maxSelect === 1) {
        return { ...prev, [group.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= group.maxSelect) return prev; // respect max
      return { ...prev, [group.id]: [...current, optionId] };
    });
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {item && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-40">
              <div className="relative mt-3 h-52 w-full overflow-hidden rounded-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="480px"
                  className="object-cover"
                />
              </div>

              <div className="mt-4">
                <DrawerTitle>{item.name}</DrawerTitle>
                <DrawerDescription className="mt-1.5">
                  {item.description}
                </DrawerDescription>
                <p className="tabular mt-3 text-[17px] font-semibold text-accent">
                  {formatRupiah(item.price)}
                </p>
              </div>

              {item.modifierGroups.map((group) => (
                <section key={group.id} className="mt-6">
                  <div className="mb-2 flex items-baseline justify-between">
                    <h3 className="text-[17px] font-semibold">{group.name}</h3>
                    <span className="text-[13px] font-medium text-ink-muted">
                      {group.isRequired ? "Required" : `Up to ${group.maxSelect}`}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isOn = selected[group.id]?.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggle(group, option.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition-colors",
                            isOn
                              ? "border-accent bg-accent/10"
                              : "border-line bg-surface-2/40",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full border",
                                isOn
                                  ? "border-accent bg-accent text-white"
                                  : "border-white/30",
                              )}
                            >
                              {isOn && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                            </span>
                            <span className="text-[15px]">{option.name}</span>
                          </span>
                          {option.priceDelta > 0 && (
                            <span className="tabular text-[14px] text-ink-muted">
                              +{formatRupiah(option.priceDelta)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Sticky add-to-cart bar (ui-spec §4.2, §6) */}
            <div
              className="material-blur absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-line px-4 pt-3"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex items-center gap-1 rounded-full border border-line bg-surface-2/60 p-1">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink active:scale-90"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="tabular w-6 text-center text-[16px] font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink active:scale-90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1 justify-between"
                disabled={!canAdd}
                onClick={() => {
                  onAdd(item, chosenOptions, quantity);
                  onOpenChange(false);
                }}
              >
                <span>{canAdd ? "Add to cart" : "Choose options"}</span>
                <span className="tabular">{formatRupiah(lineTotal)}</span>
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
