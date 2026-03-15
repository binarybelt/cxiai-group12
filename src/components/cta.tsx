import Link from "next/link";

type CTAVariant = "primary" | "secondary" | "outline";

export interface CTAProps {
  text: string;
  href: string;
  variant?: CTAVariant;
}

const variantClasses: Record<CTAVariant, string> = {
  primary:
    "bg-brand-accent text-white shadow-token-sm hover:bg-brand-700",
  secondary:
    "bg-white/[0.05] text-brand-accent ring-1 ring-brand-accent/50 hover:bg-brand-accent/15",
  outline:
    "bg-transparent text-white/70 ring-1 ring-white/[0.12] hover:ring-brand-accent/50",
};

export function CTA({ text, href = "#", variant = "primary" }: CTAProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-token-full px-5 py-3 text-body-sm font-semibold transition ${variantClasses[variant]}`}
    >
      {text}
    </Link>
  );
}

export default CTA;
