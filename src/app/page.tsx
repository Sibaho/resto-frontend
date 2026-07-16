import { redirect } from "next/navigation";

// The diner journey lives at /m (frontend-architecture §3). In production the
// entry point is /t/[qrToken] which resolves the session then redirects here.
export default function Home() {
  redirect("/m");
}
