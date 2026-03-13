import Link from "next/link";

type CardVariant = "standard" | "featured" | "compact";

export interface CardProps {
  title: string;
  body: string;
  image?: string;
  ctaText?: string;
  ctaHref?: string;
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  standard: "bg-white shadow-token-sm",
  featured: "bg-white shadow-token-lg ring-1 ring-pfizer-blue-100",
  compact: "bg-gray-100 shadow-token-sm",
};

export function Card({
  title,
  body,
  image,
  ctaText,
  ctaHref = "#",
  variant = "standard",
}: CardProps) {
  return (
    <article
      className={`overflow-hidden rounded-[1.5rem] border border-gray-200 ${variantClasses[variant]}`}
    >
      {variant !== "compact" && image ? (
        <div
          className="h-44 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : null}
      <div className="space-y-token-md p-token-lg">
        <h3 className="text-heading-md text-gray-900">{title}</h3>
        <p className="text-body-md text-gray-700">{body}</p>
        {ctaText ? (
          <Link
            href={ctaHref}
            className="inline-flex items-center text-body-sm font-semibold text-pfizer-blue-700"
          >
            {ctaText}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default Card;
