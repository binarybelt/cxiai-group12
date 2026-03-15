import Link from "next/link";

type HeroVariant = "fullWidth" | "split" | "centered";

export interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaHref?: string;
  variant?: HeroVariant;
}

const variantClasses: Record<HeroVariant, string> = {
  fullWidth: "grid gap-token-xl lg:grid-cols-[1.4fr_0.6fr]",
  split: "grid gap-token-xl lg:grid-cols-2",
  centered: "mx-auto max-w-4xl text-center",
};

export function Hero({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  ctaHref = "#",
  variant = "fullWidth",
}: HeroProps) {
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(139, 92, 246, 0.85), rgba(12, 10, 18, 0.78)), url(${backgroundImage})`,
      }
    : {
        backgroundImage:
          "linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(12, 10, 18, 0.82))",
      };

  return (
    <section
      className="overflow-hidden rounded-[2rem] px-token-xl py-token-3xl text-white shadow-token-lg"
      style={backgroundStyle}
    >
      <div className={variantClasses[variant]}>
        <div>
          <p className="mb-token-md text-caption uppercase tracking-[0.28em] text-white/75">
            Approved Hero
          </p>
          <h1 className="max-w-3xl text-heading-xl">{title}</h1>
          <p className="mt-token-lg max-w-2xl text-body-lg text-white/82">
            {subtitle}
          </p>
          {ctaText ? (
            <Link
              href={ctaHref}
              className="mt-token-xl inline-flex items-center rounded-token-full bg-white px-6 py-3 text-body-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              {ctaText}
            </Link>
          ) : null}
        </div>
        {variant !== "centered" ? (
          <div className="flex min-h-64 items-end justify-end">
            <div className="w-full max-w-xs rounded-[1.75rem] border border-white/20 bg-white/12 p-token-lg backdrop-blur">
              <p className="text-caption uppercase tracking-[0.24em] text-white/65">
                Compliance framing
              </p>
              <p className="mt-token-sm text-body-md text-white/90">
                Every visual choice here maps back to approved tokens and
                constrained component definitions.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default Hero;
