import { z } from "zod";

export const TokenOverrideSchema = z.object({
  tokenId: z.string(),
  value: z.string(),
});

export const ComponentRefSchema = z.object({
  componentId: z.string(),
  props: z.record(z.string(), z.unknown()),
  tokenOverrides: z.array(TokenOverrideSchema).optional(),
});

export const SectionSchema = z.object({
  id: z.string(),
  type: z.enum([
    "hero",
    "content",
    "cta",
    "footer",
    "navigation",
    "data",
    "disclaimer",
    "isi",
  ]),
  components: z.array(ComponentRefSchema),
  order: z.number(),
});

export const PageSpecMetadataSchema = z.object({
  generatedBy: z.string(),
  generatedAt: z.string(),
  complianceScore: z.number().min(0).max(100).optional(),
  market: z.string(),
  product: z.string(),
});

export const PageSpecSchema = z.object({
  id: z.string(),
  title: z.string(),
  market: z.string(),
  product: z.string(),
  sections: z.array(SectionSchema).min(1),
  metadata: PageSpecMetadataSchema,
});

export type TokenOverride = z.infer<typeof TokenOverrideSchema>;
export type ComponentRef = z.infer<typeof ComponentRefSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type PageSpecMetadata = z.infer<typeof PageSpecMetadataSchema>;
export type PageSpec = z.infer<typeof PageSpecSchema>;
