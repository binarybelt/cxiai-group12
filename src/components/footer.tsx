import Link from "next/link";
import type { NavLink } from "./nav-bar";

export interface FooterProps {
  links: NavLink[];
  disclaimers: string[];
  copyright: string;
  adverseEventUrl: string;
}

export function Footer({
  links,
  disclaimers,
  copyright,
  adverseEventUrl,
}: FooterProps) {
  return (
    <footer className="rounded-[2rem] bg-gray-900 px-token-xl py-token-2xl text-white shadow-token-lg">
      <div className="grid gap-token-xl lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-caption uppercase tracking-[0.24em] text-white/55">
            Footer
          </p>
          <div className="mt-token-md flex flex-wrap gap-4">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-body-sm text-white/85 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-token-md">
          {disclaimers.map((disclaimer) => (
            <p key={disclaimer} className="text-body-sm text-white/70">
              {disclaimer}
            </p>
          ))}
          <Link
            href={adverseEventUrl}
            className="inline-flex text-body-sm font-semibold text-coral-400 underline underline-offset-4"
          >
            Report an adverse event
          </Link>
        </div>
      </div>
      <div className="mt-token-xl border-t border-white/10 pt-token-md text-body-sm text-white/55">
        {copyright}
      </div>
    </footer>
  );
}

export default Footer;
