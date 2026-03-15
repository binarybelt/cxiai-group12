type ContentAlignment = "left" | "center" | "right";
type ContentVariant = "standard" | "highlighted" | "callout";

export interface ContentBlockProps {
  body: React.ReactNode;
  alignment?: ContentAlignment;
  maxWidth?: string;
  variant?: ContentVariant;
}

const alignmentClasses: Record<ContentAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const variantClasses: Record<ContentVariant, string> = {
  standard: "border border-white/[0.08] bg-white/[0.03]",
  highlighted: "border border-brand-accent/20 bg-brand-accent/10",
  callout: "border border-white/[0.08] bg-white/[0.03] border-l-4 border-l-brand-accent",
};

export function ContentBlock({
  body,
  alignment = "left",
  maxWidth = "48rem",
  variant = "standard",
}: ContentBlockProps) {
  return (
    <section
      className={`rounded-[1.5rem] px-token-lg py-token-lg text-body-md text-white/70 shadow-token-sm ${variantClasses[variant]} ${alignmentClasses[alignment]}`}
      style={{ maxWidth }}
    >
      {body}
    </section>
  );
}

export default ContentBlock;
