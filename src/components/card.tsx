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
  standard: "bg-white/[0.03] shadow-token-sm",
  featured: "bg-white/[0.05] shadow-token-lg ring-1 ring-brand-accent/20",
  compact: "bg-white/[0.05] shadow-token-sm",
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
      className={`overflow-hidden rounded-[1.5rem] border border-white/[0.08] ${variantClasses[variant]}`}
    >
      {variant !== "compact" && image ? (
        <img
          src={image}
          alt=""
          width={400}
          height={176}
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      ) : null}
      <div className="space-y-token-md p-token-lg">
        <h3 className="text-heading-md text-white/[0.93]">{title}</h3>
        <p className="text-body-md text-white/70">{body}</p>
        {ctaText ? (
          <Link
            href={ctaHref}
            className="inline-flex items-center text-body-sm font-semibold text-brand-accent"
          >
            {ctaText}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default Card;
