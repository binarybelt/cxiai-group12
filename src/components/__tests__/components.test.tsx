import * as componentLibrary from "@/components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("component library", () => {
  it("exports the full approved component set from the barrel", () => {
    expect(Object.keys(componentLibrary)).toEqual(
      expect.arrayContaining([
        "Hero",
        "Card",
        "ISIBlock",
        "Disclaimer",
        "CTA",
        "NavBar",
        "Footer",
        "DataTable",
        "ClaimReference",
        "SectionHeader",
        "ContentBlock",
        "ImageBlock",
      ]),
    );
  });

  it("renders the Hero component", () => {
    render(
      <Hero
        title="Advancing breakthroughs"
        subtitle="Approved structure only"
        ctaText="Explore"
        ctaHref="/explore"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Advancing breakthroughs" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "href",
      "/explore",
    );
  });

  it("renders the Card component", () => {
    render(
      <Card
        title="Fast specialist onboarding"
        body="Evidence modules remain within approved building blocks."
        ctaText="View pathway"
        ctaHref="/pathway"
      />,
    );

    expect(screen.getByText("Fast specialist onboarding")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View pathway" })).toHaveAttribute(
      "href",
      "/pathway",
    );
  });

  it("renders disclaimer variants", () => {
    render(<Disclaimer text="Demo disclaimer copy" type="pharma" />);

    expect(screen.getByText("Demo disclaimer copy")).toBeInTheDocument();
  });

  it.each([
    ["primary", "bg-brand-500"],
    ["secondary", "ring-brand-500"],
    ["outline", "ring-gray-300"],
  ] as const)("renders CTA variant %s", (variant, className) => {
    render(<CTA text="Take action" href="/action" variant={variant} />);

    const cta = screen.getByRole("link", { name: "Take action" });
    expect(cta).toHaveAttribute("href", "/action");
    expect(cta.className).toContain(className);
  });

  it("renders the NavBar component", () => {
    render(
      <NavBar
        logo="Design Delivery Accelerator"
        market="US"
        links={[
          { label: "Capabilities", href: "#capabilities" },
          { label: "Evidence", href: "#evidence" },
        ]}
      />,
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Capabilities" })).toHaveAttribute(
      "href",
      "#capabilities",
    );
    expect(screen.getByText("US")).toBeInTheDocument();
  });

  it("renders the Footer component with the adverse event link", () => {
    render(
      <Footer
        links={[{ label: "Privacy notice", href: "#privacy" }]}
        disclaimers={["Illustrative only"]}
        copyright="2026 Pfizer Inc."
        adverseEventUrl="#report-adverse-events"
      />,
    );

    expect(
      screen.getByRole("link", { name: "Report an adverse event" }),
    ).toHaveAttribute("href", "#report-adverse-events");
  });

  it("renders the DataTable component", () => {
    render(
      <DataTable
        caption="Illustrative efficacy results"
        headers={["Endpoint", "Treatment Arm"]}
        rows={[["Primary response", "68%"]]}
      />,
    );

    expect(
      screen.getByRole("table", { name: "Illustrative efficacy results" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Endpoint" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "68%" })).toBeVisible();
  });

  it("renders the ClaimReference component", () => {
    render(
      <ClaimReference
        claim="Response improved at week 24."
        reference="Fictional Study AX-301."
        footnoteId="1"
      />,
    );

    expect(screen.getByText("Response improved at week 24.")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Fictional Study AX-301.")).toBeInTheDocument();
  });

  it("renders the SectionHeader component", () => {
    render(
      <SectionHeader
        title="Our Medicines"
        subtitle="Approved component vocabulary."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Our Medicines" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Approved component vocabulary."),
    ).toBeInTheDocument();
  });

  it("renders the ContentBlock component", () => {
    render(
      <ContentBlock
        variant="callout"
        body={<p>Structured narrative stays inside the approved layout.</p>}
      />,
    );

    expect(
      screen.getByText("Structured narrative stays inside the approved layout."),
    ).toBeInTheDocument();
  });

  it("renders the ImageBlock component", () => {
    render(
      <ImageBlock
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        alt="Illustrative molecular-style blue abstract background"
        caption="Approved media placeholder"
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "Illustrative molecular-style blue abstract background",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Approved media placeholder")).toBeInTheDocument();
  });

  it("renders and toggles the ISIBlock component accessibly", async () => {
    const user = userEvent.setup();

    render(
      <ISIBlock
        expandable
        content="WARNING: This is demo-only safety content. In production, important safety information must remain visible and balanced against efficacy claims."
      />,
    );

    const button = screen.getByRole("button", { name: "Read more" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls");

    await user.click(button);

    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("region")).toHaveAttribute("aria-labelledby");
  });
});
