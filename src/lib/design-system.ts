import components from "@/design-system/components.json";
import complianceRules from "@/design-system/compliance-rules.json";
import markets from "@/design-system/markets.json";
import patterns from "@/design-system/patterns.json";
import tokens from "@/design-system/tokens.json";
import type {
  ComponentDef,
  ComplianceRule,
  DesignSystem,
  DesignToken,
  MarketConfig,
  Pattern,
} from "@/types/design-system";

function cloneData<T>(value: T): T {
  return structuredClone(value);
}

export function loadTokens(): DesignToken[] {
  return cloneData(tokens as DesignToken[]);
}

export function loadComponents(): ComponentDef[] {
  return cloneData(components as ComponentDef[]);
}

export function loadPatterns(): Pattern[] {
  return cloneData(patterns as Pattern[]);
}

export function loadComplianceRules(): ComplianceRule[] {
  return cloneData(complianceRules as ComplianceRule[]);
}

export function loadMarkets(): MarketConfig[] {
  return cloneData(markets as MarketConfig[]);
}

export function getDesignSystem(): DesignSystem {
  return {
    tokens: loadTokens(),
    components: loadComponents(),
    patterns: loadPatterns(),
    complianceRules: loadComplianceRules(),
    markets: loadMarkets(),
  };
}

export function getComponentById(id: string): ComponentDef | undefined {
  return loadComponents().find((component) => component.id === id);
}

export function getTokensByCategory(
  category: DesignToken["category"],
): DesignToken[] {
  return loadTokens().filter((token) => token.category === category);
}

export function getMarketConfig(marketId: string): MarketConfig | undefined {
  return loadMarkets().find((market) => market.id === marketId);
}
