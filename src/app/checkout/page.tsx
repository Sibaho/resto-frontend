import { CheckoutScreen } from "@/components/diner/checkout-screen";

// The one place the diner leaves the overlay model — a dedicated route so the
// confirm step has gravity and a clean back-stack entry (frontend-architecture §5.4).
export default function CheckoutPage() {
  return <CheckoutScreen />;
}
