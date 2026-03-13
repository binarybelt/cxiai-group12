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
    <section className="rounded-[1.25rem] border border-pfizer-blue-100 bg-white px-token-lg py-token-md shadow-token-sm">
      <p className="text-body-md text-gray-900">
        {claim}
        <sup className="ml-1 text-caption font-semibold text-pfizer-blue-700">
          {footnoteId}
        </sup>
      </p>
      <p className="mt-token-sm text-caption text-gray-500">{reference}</p>
    </section>
  );
}

export default ClaimReference;
