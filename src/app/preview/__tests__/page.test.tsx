import { render, screen } from "@testing-library/react";
import PreviewPage from "../page";

describe("/preview page", () => {
  it("renders the full component library preview", () => {
    render(<PreviewPage />);

    expect(
      screen.getByRole("heading", {
        name: "The approved building blocks",
      }),
    ).toBeInTheDocument();

    for (const label of [
      "NavBar",
      "Hero",
      "SectionHeader",
      "ContentBlock",
      "Card",
      "DataTable",
      "ClaimReference",
      "ImageBlock",
      "CTA",
      "Disclaimer",
      "ISIBlock",
      "Footer",
    ]) {
      expect(screen.getAllByText(label)[0]).toBeInTheDocument();
    }

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Report an adverse event" }),
    ).toBeInTheDocument();
  });
});
