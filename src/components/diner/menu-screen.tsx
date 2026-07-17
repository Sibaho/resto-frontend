"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { RestaurantHeader } from "./restaurant-header";
import { CategoryRail } from "./category-rail";
import { ItemCard } from "./item-card";
import { FloatingCart } from "./floating-cart";
import { ItemDetailSheet } from "./item-detail-sheet";
import { CartDrawer } from "./cart-drawer";
import {
  categories,
  itemsByCategory,
  type MenuItem,
  type ModifierOption,
} from "@/lib/mock-menu";
import { selectCount, selectSubtotal, useCart } from "@/stores/cart";

/**
 * The diner hero screen. A single horizontal swipe deck of full-screen items
 * (one per viewport); the sticky category rail scroll-spy-syncs to the visible
 * item and jumps the deck on tap. Detail + cart are overlays so the menu stays
 * warm underneath (frontend-architecture §2, §5).
 */
export function MenuScreen() {
  const router = useRouter();

  // Flatten items in category order; each slide is one item.
  const flatItems = useMemo(
    () => categories.flatMap((c) => itemsByCategory(c.id)),
    [],
  );
  const firstIndexOfCategory = useMemo(() => {
    const map: Record<string, number> = {};
    flatItems.forEach((item, index) => {
      if (map[item.categoryId] === undefined) map[item.categoryId] = index;
    });
    return map;
  }, [flatItems]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const activeCategoryId = flatItems[selectedIndex]?.categoryId ?? categories[0].id;

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      const index = firstIndexOfCategory[categoryId];
      if (index !== undefined) emblaApi?.scrollTo(index);
    },
    [emblaApi, firstIndexOfCategory],
  );

  // Overlay + cart state
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const addItem = useCart((s) => s.addItem);
  const lines = useCart((s) => s.lines);
  const count = selectCount(lines);
  const total = selectSubtotal(lines);

  const openDetail = useCallback((item: MenuItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  const quickAdd = useCallback(
    (item: MenuItem) => {
      const hasRequired = item.modifierGroups.some((g) => g.isRequired);
      if (hasRequired) {
        openDetail(item);
        return;
      }
      addItem(item, [], 1);
    },
    [addItem, openDetail],
  );

  const handleAdd = useCallback(
    (item: MenuItem, modifiers: ModifierOption[], quantity: number) => {
      addItem(item, modifiers, quantity);
    },
    [addItem],
  );

  const handleCheckout = useCallback(() => {
    setCartOpen(false);
    router.push("/checkout");
  }, [router]);

  return (
    <main className="relative mx-auto h-[100dvh] w-full max-w-[480px] overflow-hidden bg-canvas">
      <RestaurantHeader />
      <CategoryRail
        categories={categories}
        activeId={activeCategoryId}
        onSelect={handleSelectCategory}
      />

      {/* Swipe deck — one full-screen item per viewport (ui-spec §5.1) */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {flatItems.map((item, index) => (
            <div key={item.id} className="relative h-full flex-[0_0_100%]">
              <ItemCard
                item={item}
                priority={Math.abs(index - selectedIndex) <= 1}
                onOpenDetail={openDetail}
                onQuickAdd={quickAdd}
              />
            </div>
          ))}
        </div>
      </div>

      <FloatingCart count={count} total={total} onOpen={() => setCartOpen(true)} />

      <ItemDetailSheet
        item={detailItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAdd={handleAdd}
      />
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />
    </main>
  );
}
