"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Build", href: "/build" },
  { label: "Scan", href: "/scan" },
  { label: "Evidence", href: "/evidence" },
  { label: "Preview", href: "/preview" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex h-12 flex-shrink-0 items-center border-b border-gray-200 bg-white px-6">
      <Link
        href="/"
        className="mr-8 text-sm font-bold tracking-wide text-pfizer-blue-700"
      >
        Design Delivery Accelerator
      </Link>

      <div className="flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-pfizer-blue-100 text-pfizer-blue-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default AppNav;
