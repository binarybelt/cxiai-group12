"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Build", href: "/build" },
  { label: "Scan", href: "/scan" },
  { label: "Audit Trail", href: "/evidence" },
  { label: "How It Works", href: "/transparency" },
  { label: "Components", href: "/preview" },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 flex-shrink-0 border-b border-white/[0.06] bg-[rgba(12,10,18,0.6)] backdrop-blur-xl"
    >
      <div className="flex h-12 items-center px-6">
        <Link
          href="/"
          className="mr-8 font-display text-sm font-bold tracking-wide text-brand-accent"
        >
          Design Delivery Accelerator
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                  isActive
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-brand-accent after:shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                    : "text-white/55 hover:text-white/90"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:hidden"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-white/[0.06] px-6 py-3 md:hidden">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                  isActive
                    ? "bg-brand-accent/15 text-white"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

export default AppNav;
