import Link from "next/link";

export interface NavLink {
  label: string;
  href: string;
}

type NavBarVariant = "standard" | "minimal";

export interface NavBarProps {
  logo: string;
  links: NavLink[];
  market: string;
  variant?: NavBarVariant;
}

export function NavBar({
  logo,
  links = [],
  market,
  variant = "standard",
}: NavBarProps) {
  return (
    <nav className="sticky top-0 z-20 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.05] px-token-lg py-token-md shadow-token-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-token-md">
        <div>
          <p className="text-caption uppercase tracking-[0.22em] text-brand-accent">
            {logo}
          </p>
        </div>
        {variant === "standard" ? (
          <div className="flex flex-wrap items-center gap-5">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-body-sm font-medium text-white/70 transition hover:text-brand-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
        <span className="rounded-token-full bg-brand-accent/15 px-3 py-2 text-caption font-semibold uppercase tracking-[0.2em] text-brand-accent">
          {market}
        </span>
      </div>
    </nav>
  );
}

export default NavBar;
