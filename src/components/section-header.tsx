type SectionAlignment = "left" | "center" | "right";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  alignment?: SectionAlignment;
}

const alignmentClasses: Record<SectionAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function SectionHeader({
  title,
  subtitle,
  alignment = "left",
}: SectionHeaderProps) {
  return (
    <header className={alignmentClasses[alignment]}>
      <h2 className="text-heading-lg text-white/[0.93]">{title}</h2>
      {subtitle ? (
        <p className="mt-token-sm text-body-md text-white/50">{subtitle}</p>
      ) : null}
    </header>
  );
}

export default SectionHeader;
