import tailwindConfig from "../../../tailwind.config";
import {
  getComponentById,
  getDesignSystem,
  getMarketConfig,
  getTokensByCategory,
  loadTokens,
} from "../design-system";

describe("design-system loader", () => {
  it("returns the expected aggregate design system shape", () => {
    const system = getDesignSystem();

    expect(system.tokens.length).toBeGreaterThanOrEqual(30);
    expect(system.components).toHaveLength(12);
    expect(system.patterns).toHaveLength(4);
    expect(system.complianceRules.length).toBeGreaterThanOrEqual(15);
    expect(system.markets).toHaveLength(3);
  });

  it("returns defensive copies from loader functions", () => {
    const firstLoad = loadTokens();
    const secondLoad = loadTokens();

    firstLoad[0]!.value = "mutated";

    expect(secondLoad[0]!.value).not.toBe("mutated");
  });

  it("exposes direct lookup helpers", () => {
    expect(getComponentById("Hero")?.name).toBe("Hero");
    expect(getMarketConfig("US")?.requiredComponents).toContain("Footer");
    expect(getTokensByCategory("color").some((token) => token.id === "primary-blue-500")).toBe(true);
  });

  it("keeps Tailwind token config aligned with the source token data", () => {
    const colorTokens = loadTokens();
    const primaryBlue = colorTokens.find((token) => token.id === "primary-blue-500");
    const config = tailwindConfig as {
      theme?: {
        extend?: {
          colors?: {
            pfizer?: {
              blue?: {
                500?: string;
              };
            };
          };
        };
      };
    };

    expect(primaryBlue?.value).toBe(
      config.theme?.extend?.colors?.pfizer?.blue?.[500],
    );
  });
});
