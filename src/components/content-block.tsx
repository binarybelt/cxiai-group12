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
  standard: "border border-gray-200 bg-white",
  highlighted: "border border-brand-100 bg-brand-100/45",
  callout: "border border-gray-200 bg-white border-l-4 border-l-brand-500",
};

export function ContentBlock({
  body,
  alignment = "left",
  maxWidth = "48rem",
  variant = "standard",
}: ContentBlockProps) {
  return (
    <section
      className={`rounded-[1.5rem] px-token-lg py-token-lg text-body-md text-gray-700 shadow-token-sm ${variantClasses[variant]} ${alignmentClasses[alignment]}`}
      style={{ maxWidth }}
    >
      {body}
    </section>
  );
}

export default ContentBlock;
