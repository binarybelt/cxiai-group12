import {
  CTA,
  Card,
  ClaimReference,
  ContentBlock,
  DataTable,
  Disclaimer,
  Footer,
  Hero,
  ImageBlock,
  ISIBlock,
  NavBar,
  SectionHeader,
} from "@/components";

const previewImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 720'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23A78BFA'/%3E%3Cstop offset='1' stop-color='%230F172A'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='720' fill='url(%23g)'/%3E%3Ccircle cx='930' cy='190' r='120' fill='rgba(255,255,255,0.16)'/%3E%3Ccircle cx='260' cy='530' r='180' fill='rgba(255,255,255,0.12)'/%3E%3Ctext x='96' y='160' fill='white' font-size='68' font-family='Arial' font-weight='700'%3EDesign Delivery Accelerator%3C/text%3E%3Ctext x='96' y='236' fill='rgba(255,255,255,0.85)' font-size='34' font-family='Arial'%3EApproved component imagery placeholder%3C/text%3E%3C/svg%3E";

function PreviewLabel({ name }: { name: string }) {
  return (
    <p className="mb-token-sm text-caption uppercase tracking-[0.28em] text-white/55">
      {name}
    </p>
  );
}

export default function PreviewPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-token-xl">
        <section>
          <PreviewLabel name="NavBar" />
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <NavBar
              logo="Design Delivery Accelerator"
              market="US"
              links={[
                { label: "Capabilities", href: "#capabilities" },
                { label: "Evidence", href: "#evidence" },
                { label: "Safety", href: "#safety" },
              ]}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-token-xl shadow-token-md backdrop-blur">
          <p className="text-caption uppercase tracking-[0.32em] text-brand-accent">
            COMPONENT LIBRARY
          </p>
          <h1 className="mt-token-md text-heading-xl text-white">
            The approved building blocks
          </h1>
          <p className="mt-token-md max-w-3xl text-body-lg text-white/70">
            Every component the AI can use. Nothing else exists.
          </p>
        </section>

        <section>
          <PreviewLabel name="Hero" />
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <Hero
              title="Advancing breakthroughs that change patients' lives"
              subtitle="A governed component system for regulated web experiences, with built-in evidence structure and compliance-ready content patterns."
              backgroundImage={previewImage}
              ctaText="Review the evidence"
              ctaHref="#evidence"
              variant="split"
            />
          </div>
        </section>

        <section className="grid gap-token-xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-token-md">
            <PreviewLabel name="SectionHeader" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] p-token-lg">
              <SectionHeader
                title="Our Medicines"
                subtitle="A fictional data set rendered through the approved pharma component vocabulary."
              />
            </div>
          </div>
          <div className="space-y-token-md">
            <PreviewLabel name="ContentBlock" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] p-token-lg">
              <ContentBlock
                variant="highlighted"
                body={
                  <p>
                    Apexa is a fictional treatment used here to demonstrate how
                    structured content, evidence references, and market-specific
                    disclosures can all sit inside a constrained component model.
                  </p>
                }
              />
            </div>
          </div>
        </section>

        <section className="grid gap-token-xl lg:grid-cols-2">
          <div>
            <PreviewLabel name="Card" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              <Card
                title="Fast specialist onboarding"
                body="Guide HCP audiences from core mechanism-of-action content to evidence modules without leaving the approved component set."
                ctaText="View pathway"
                ctaHref="#"
                image={previewImage}
                variant="featured"
              />
            </div>
          </div>
          <div>
            <PreviewLabel name="Card" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              <Card
                title="Modular fair-balance sections"
                body="Generate multiple compliant variants while keeping safety, references, and disclosure surfaces structurally mandatory."
                ctaText="Compare variants"
                ctaHref="#"
              />
            </div>
          </div>
        </section>

        <section id="evidence" className="space-y-token-xl">
          <div>
            <PreviewLabel name="DataTable" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] p-token-lg">
              <DataTable
                caption="Illustrative efficacy results from a fictional phase III cohort."
                headers={[
                  "Endpoint",
                  "Treatment Arm",
                  "Comparator",
                  "Absolute Difference",
                ]}
                rows={[
                  ["Primary response at week 24", "68%", "49%", "+19 pts"],
                  ["Sustained response at week 52", "61%", "44%", "+17 pts"],
                  ["Patient-reported symptom score", "-38%", "-22%", "-16 pts"],
                  ["Discontinuation due to AEs", "4%", "5%", "-1 pt"],
                ]}
                variant="striped"
              />
            </div>
          </div>
          <div>
            <PreviewLabel name="ClaimReference" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] p-token-lg">
              <ClaimReference
                claim="In this illustrative cohort, Apexa improved the primary response rate versus comparator at week 24."
                reference="Fictional Study AX-301; data on file for hackathon demonstration only."
                footnoteId="1"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-token-xl lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <PreviewLabel name="ImageBlock" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              <ImageBlock
                src={previewImage}
                alt="Illustrative molecular-style blue abstract background"
                caption="Placeholder creative treatment showing how approved media surfaces are framed."
                width="100%"
              />
            </div>
          </div>
          <div className="space-y-token-lg">
            <PreviewLabel name="CTA" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] p-token-lg">
              <div className="flex flex-wrap gap-4">
                <CTA text="Primary action" href="#" variant="primary" />
                <CTA text="Secondary action" href="#" variant="secondary" />
                <CTA text="Outline action" href="#" variant="outline" />
              </div>
            </div>

            <PreviewLabel name="Disclaimer" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] p-token-lg">
              <Disclaimer
                type="pharma"
                text="For demonstration purposes only. This preview uses fictional product information to validate constrained design-system composition."
              />
            </div>
          </div>
        </section>

        <section id="safety">
          <PreviewLabel name="ISIBlock" />
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <ISIBlock
              expandable
              content="WARNING: This is demo-only safety content. In production, important safety information must be sourced from approved labeling, remain visible to the target audience, and preserve fair balance against efficacy messaging. Clinicians should review complete prescribing information and local reporting requirements before acting on any promotional material."
            />
          </div>
        </section>

        <section>
          <PreviewLabel name="Footer" />
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <Footer
              links={[
                { label: "Privacy notice", href: "#" },
                { label: "Terms of use", href: "#" },
                { label: "Medical information", href: "#" },
              ]}
              disclaimers={[
                "Apexa is a fictional therapy used solely for the Design Delivery Accelerator demo.",
                "All content shown here is illustrative and not for clinical use.",
              ]}
              copyright="2026 Pfizer Inc. Demo environment."
              adverseEventUrl="#report-adverse-events"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
