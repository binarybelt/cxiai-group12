export interface ClaimReferenceProps {
  claim: string;
  reference: string;
  footnoteId: string;
}

export function ClaimReference({
  claim,
  reference,
  footnoteId,
}: ClaimReferenceProps) {
  return (
    <section className="rounded-[1.25rem] border border-brand-accent/20 bg-white/[0.03] px-token-lg py-token-md shadow-token-sm">
      <p className="text-body-md text-white/[0.93]">
        {claim}
        <sup className="ml-1 text-caption font-semibold text-brand-accent">
          {footnoteId}
        </sup>
      </p>
      <p className="mt-token-sm text-caption text-white/50">{reference}</p>
    </section>
  );
}

export default ClaimReference;
