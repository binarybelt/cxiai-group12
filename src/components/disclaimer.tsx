type DisclaimerType = "general" | "pharma" | "legal";

export interface DisclaimerProps {
  text: string;
  type?: DisclaimerType;
}

const typeClasses: Record<DisclaimerType, string> = {
  general: "border border-gray-200 bg-gray-100 text-gray-700",
  pharma: "border border-amber-300/70 bg-amber-300/10 text-gray-900",
  legal: "border border-gray-300 bg-white text-gray-700",
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
