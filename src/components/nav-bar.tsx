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
    <nav className="sticky top-0 z-20 rounded-[1.5rem] border border-gray-200 bg-white/90 px-token-lg py-token-md shadow-token-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-token-md">
        <div>
          <p className="text-caption uppercase tracking-[0.22em] text-pfizer-blue-700">
            {logo}
          </p>
        </div>
        {variant === "standard" ? (
          <div className="flex flex-wrap items-center gap-5">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-body-sm font-medium text-gray-700 transition hover:text-pfizer-blue-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
        <span className="rounded-token-full bg-pfizer-blue-100 px-3 py-2 text-caption font-semibold uppercase tracking-[0.2em] text-pfizer-blue-700">
          {market}
        </span>
      </div>
    </nav>
  );
}

export default NavBar;
