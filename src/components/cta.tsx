import Link from "next/link";

type CTAVariant = "primary" | "secondary" | "outline";

export interface CTAProps {
  text: string;
  href: string;
  variant?: CTAVariant;
}

const variantClasses: Record<CTAVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-token-sm hover:bg-brand-700",
  secondary:
    "bg-white text-brand-700 ring-1 ring-brand-500 hover:bg-brand-100",
  outline:
    "bg-transparent text-brand-700 ring-1 ring-gray-300 hover:ring-brand-500",
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
