# RestoSaas — Diner Ordering Experience

A Next.js 15 (App Router, React 19) + Tailwind v4 + shadcn/ui implementation of the
Sushi Tei–style full-screen digital menu, built to `docs/ui-spec.md` and
`docs/frontend-architecture.md`.

## Run

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000  → redirects to /m
```

> Requires network on first run: `npm install` pulls dependencies and the demo
> menu images load from `images.unsplash.com` (allow-listed in `next.config.ts`).
> Best viewed in a mobile viewport (the layout is a 480px phone frame on desktop).

## What's implemented (against the brief)

| Requirement | Where |
|---|---|
| **Full-screen menu / one per viewport** | `ItemCard` is `100dvh`; the deck shows exactly one item at a time |
| **Large hero image** | `next/image` full-bleed with bottom scrim (`components/diner/item-card.tsx`) |
| **Swipe left/right** | Embla carousel deck (`menu-screen.tsx`) — momentum + snap |
| **Sticky category navigation** | `CategoryRail` — scroll-spy synced to the visible item, tap-to-jump, sliding active pill, auto-centering |
| **Floating cart** | `FloatingCart` — springs in on first add, count badge pops on every add, running total |
| **Bottom sheet item detail** | `ItemDetailSheet` on `vaul` (shadcn Drawer) — modifiers, quantity stepper, sticky add-to-cart bar |
| **Mobile first** | `100dvh`, safe-area insets, 44pt tap targets, thumb-zone actions |
| **Smooth animation** | Framer Motion (pill layout animation, cart pop/spring, list add/remove), `prefers-reduced-motion` honored |

## Architecture

- **Design tokens** (`app/globals.css`) — the ui-spec color/type/spacing/radius/motion
  scale as Tailwind v4 `@theme` tokens. The menu is an "always dark context" surface
  (white text over image scrims).
- **State** — cart in Zustand persisted to `localStorage` (`stores/cart.ts`, immutable
  updates, identical-config line merging); ephemeral UI (active category, open sheets)
  as local component state. Mirrors frontend-architecture §6.
- **shadcn/ui** — `components/ui/` holds the vendored primitives (`Button` via CVA,
  `Drawer` via vaul), the same code shadcn's CLI would generate.
- **Data** — `lib/mock-menu.ts` provides typed demo data so the UI runs without the
  backend. Swap for `GET /api/v1/menu` (types already match the Laravel resources).

## Routes

- `/` → redirects to `/m`
- `/m` → the full-screen menu (in production, entered via `/t/[qrToken]` after the
  QR check-in resolves a session — see the backend QR ordering module)

## Not in scope here

Checkout route, live order tracking (Reverb/Echo), and the ops surfaces (KDS/staff/
admin) are structural in the architecture doc; this deliverable is the diner hero
experience. "Place order" clears the cart and shows a confirmation as a placeholder
for `POST /api/v1/orders`.
