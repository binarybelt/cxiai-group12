type DisclaimerType = "general" | "pharma" | "legal";

export interface DisclaimerProps {
  text: string;
  type?: DisclaimerType;
}

const typeClasses: Record<DisclaimerType, string> = {
  general: "border border-white/[0.08] bg-white/[0.05] text-white/70",
  pharma: "border border-amber-300/40 bg-amber-300/[0.07] text-white/[0.93]",
  legal: "border border-white/[0.12] bg-white/[0.03] text-white/70",
};

export function Disclaimer({ text, type = "general" }: DisclaimerProps) {
  return (
    <aside
      className={`rounded-token-md px-token-lg py-token-md text-body-sm ${typeClasses[type]}`}
    >
      {text}
    </aside>
  );
}

export default Disclaimer;
