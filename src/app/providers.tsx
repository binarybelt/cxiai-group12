"use client";

import { ConvexProvider } from "convex/react";
import { convex } from "@/lib/convex";

export function Providers({ children }: { children: React.ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
