// app/dashboard/[...notfound]/page.tsx
import { notFound } from "next/navigation";

export default function CatchAllDashboard() {
  notFound();
}
