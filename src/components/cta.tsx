import Link from "next/link";

type CTAVariant = "primary" | "secondary" | "outline";

export interface CTAProps {
  text: string;
  href: string;
  variant?: CTAVariant;
}

const variantClasses: Record<CTAVariant, string> = {
  primary:
    "bg-pfizer-blue-500 text-white shadow-token-sm hover:bg-pfizer-blue-700",
  secondary:
    "bg-white text-pfizer-blue-700 ring-1 ring-pfizer-blue-500 hover:bg-pfizer-blue-100",
  outline:
    "bg-transparent text-pfizer-blue-700 ring-1 ring-gray-300 hover:ring-pfizer-blue-500",
};

export function CTA({ text, href, variant = "primary" }: CTAProps) {
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
