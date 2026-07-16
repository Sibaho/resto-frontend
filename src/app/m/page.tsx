import { MenuScreen } from "@/components/diner/menu-screen";

// Full-screen diner menu. The screen itself is a Client Component (swipe deck,
// overlays, cart); in production this page would SSR the first category for a
// fast first paint, then hydrate the deck (frontend-architecture §3).
export default function MenuPage() {
  return <MenuScreen />;
}
