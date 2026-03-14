/**
 * Prop shape metadata for all 12 design system components.
 *
 * This file translates React component prop types into JSON-serializable
 * descriptions the LLM can use when generating PageSpec props.
 *
 * For node-type props (React.ReactNode), we specify the actual JSON structure
 * the renderer expects — this is the adapter layer that prevents LLM from
 * generating JSX or component references in the props object.
 */

export interface PropFieldShape {
  type: string;
  description: string;
  required: boolean;
  example?: unknown;
}

export interface ComponentPropShape {
  componentId: string;
  description: string;
  props: Record<string, PropFieldShape>;
}

export const PROP_SHAPES: Record<string, ComponentPropShape> = {
  Hero: {
    componentId: "Hero",
    description:
      "Primary narrative block with headline, supporting copy, and CTA.",
    props: {
      title: {
        type: "string",
        description: "Main hero headline",
        required: true,
        example: "Proven Efficacy in Adult Patients",
      },
      subtitle: {
        type: "string",
        description: "Supporting copy below the headline",
        required: true,
        example: "In clinical trials, patients experienced significant improvement",
      },
      backgroundImage: {
        type: "string",
        description: "URL or path to the hero background image",
        required: false,
        example: "/images/hero-bg.jpg",
      },
      ctaText: {
        type: "string",
        description: "Call-to-action button label (max 40 characters)",
        required: false,
        example: "Learn More",
      },
      ctaHref: {
        type: "string",
        description: "URL the CTA button navigates to",
        required: false,
        example: "/clinical-data",
      },
    },
  },

  Card: {
    componentId: "Card",
    description: "Compact content preview with optional media and CTA.",
    props: {
      title: {
        type: "string",
        description: "Card headline",
        required: true,
        example: "Mechanism of Action",
      },
      body: {
        type: "string",
        description: "Card body copy",
        required: true,
        example: "This medication works by selectively inhibiting...",
      },
      image: {
        type: "string",
        description: "Optional card image URL",
        required: false,
        example: "/images/moa-diagram.png",
      },
      ctaText: {
        type: "string",
        description: "Optional CTA label",
        required: false,
        example: "View Data",
      },
      ctaHref: {
        type: "string",
        description: "Optional CTA URL",
        required: false,
        example: "/data",
      },
    },
  },

  ISIBlock: {
    componentId: "ISIBlock",
    description:
      "Important safety information container. Required on every HCP page.",
    props: {
      content: {
        type: "string",
        description:
          "Plain text safety information. Do NOT use JSX or HTML — plain text only. The renderer handles formatting.",
        required: true,
        example:
          "IMPORTANT SAFETY INFORMATION: This medication may cause serious side effects including...",
      },
      expandable: {
        type: "boolean",
        description:
          "Whether the ISI block can be collapsed/expanded by the user",
        required: false,
        example: false,
      },
    },
  },

  Disclaimer: {
    componentId: "Disclaimer",
    description: "Mandatory disclosure and legal qualifier region.",
    props: {
      text: {
        type: "string",
        description: "Full disclaimer text",
        required: true,
        example: "This information is intended for US healthcare professionals only.",
      },
      type: {
        type: "enum: 'general' | 'pharma' | 'legal'",
        description: "Classifier for the disclaimer category",
        required: true,
        example: "pharma",
      },
    },
  },

  CTA: {
    componentId: "CTA",
    description: "Primary action surface for routing or lead generation.",
    props: {
      text: {
        type: "string",
        description: "Button label (max 40 characters)",
        required: true,
        example: "Request Samples",
      },
      href: {
        type: "string",
        description: "Navigation URL",
        required: true,
        example: "/contact",
      },
      variant: {
        type: "enum: 'primary' | 'secondary' | 'outline'",
        description: "Visual style of the button",
        required: false,
        example: "primary",
      },
    },
  },

  NavBar: {
    componentId: "NavBar",
    description: "Top-level navigation shell with market context.",
    props: {
      logo: {
        type: "string",
        description: "URL or path to the logo image",
        required: true,
        example: "/logo.svg",
      },
      links: {
        type: "Array<{ label: string; href: string }>",
        description:
          "Navigation link items. Must be a JSON array of objects with label and href. Do NOT pass React components.",
        required: true,
        example: [
          { label: "Efficacy", href: "/efficacy" },
          { label: "Safety", href: "/safety" },
          { label: "Dosing", href: "/dosing" },
        ],
      },
      market: {
        type: "string",
        description: "Market identifier for localization context",
        required: true,
        example: "us-hcp",
      },
    },
  },

  Footer: {
    componentId: "Footer",
    description:
      "Global footer with disclosures and adverse event routing. Required on every page.",
    props: {
      links: {
        type: "Array<{ label: string; href: string }>",
        description:
          "Footer navigation links. Must be a JSON array of objects. Do NOT pass React components.",
        required: true,
        example: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Use", href: "/terms" },
        ],
      },
      disclaimers: {
        type: "Array<string>",
        description:
          "Legal disclaimer strings displayed in the footer. Each string is a separate disclaimer line.",
        required: true,
        example: [
          "For US Healthcare Professionals Only",
          "© 2025 Pfizer Inc. All rights reserved.",
        ],
      },
      copyright: {
        type: "string",
        description: "Copyright notice text",
        required: true,
        example: "© 2025 Pfizer Inc. All rights reserved.",
      },
      adverseEventUrl: {
        type: "string",
        description:
          "URL for adverse event reporting. Required for pharma compliance.",
        required: true,
        example: "https://www.pfizer.com/adverse-events",
      },
    },
  },

  DataTable: {
    componentId: "DataTable",
    description: "Structured efficacy and outcome evidence table.",
    props: {
      headers: {
        type: "Array<string>",
        description:
          "Column header labels. Must be a JSON array of strings. Do NOT pass React components.",
        required: true,
        example: ["Endpoint", "Treatment Group", "Placebo", "P-value"],
      },
      rows: {
        type: "Array<Array<string>>",
        description:
          "Table data as a 2D array of strings. Each inner array is one row. Do NOT pass React components.",
        required: true,
        example: [
          ["Primary Endpoint", "68%", "32%", "<0.001"],
          ["Secondary Endpoint", "45%", "21%", "0.003"],
        ],
      },
      caption: {
        type: "string",
        description: "Table caption for context and accessibility",
        required: true,
        example: "Phase 3 Clinical Trial Results (N=512)",
      },
    },
  },

  ClaimReference: {
    componentId: "ClaimReference",
    description: "Claim block with mandatory evidence citation.",
    props: {
      claim: {
        type: "string",
        description: "The clinical or efficacy claim being made",
        required: true,
        example: "Demonstrated 68% reduction in primary endpoint vs placebo",
      },
      reference: {
        type: "string",
        description: "Full citation for the evidence supporting the claim",
        required: true,
        example:
          "Smith J, et al. New England Journal of Medicine. 2024;390(1):1-12.",
      },
      footnoteId: {
        type: "string",
        description: "Footnote identifier (e.g., '1', 'a', '*')",
        required: true,
        example: "1",
      },
    },
  },

  SectionHeader: {
    componentId: "SectionHeader",
    description: "Reusable section heading with optional subheading.",
    props: {
      title: {
        type: "string",
        description: "Section heading text (sentence case)",
        required: true,
        example: "Clinical efficacy data",
      },
      subtitle: {
        type: "string",
        description: "Optional supporting text below the heading",
        required: false,
        example: "From our Phase 3 clinical trial program",
      },
      alignment: {
        type: "enum: 'left' | 'center' | 'right'",
        description: "Horizontal alignment of the heading",
        required: false,
        example: "left",
      },
    },
  },

  ContentBlock: {
    componentId: "ContentBlock",
    description: "Flexible body copy region for narrative content.",
    props: {
      body: {
        type: "string",
        description:
          "Plain text body content. Simple paragraphs separated by newlines. Do NOT use JSX or HTML tags.",
        required: true,
        example:
          "The mechanism of action involves selective inhibition of the target receptor.\n\nThis approach has demonstrated significant efficacy in multiple clinical trials.",
      },
      alignment: {
        type: "enum: 'left' | 'center' | 'right'",
        description: "Text alignment within the block",
        required: false,
        example: "left",
      },
      maxWidth: {
        type: "string",
        description:
          "Optional CSS max-width value to constrain line length for readability",
        required: false,
        example: "65ch",
      },
    },
  },

  ImageBlock: {
    componentId: "ImageBlock",
    description:
      "Image presentation with caption and accessibility metadata.",
    props: {
      src: {
        type: "string",
        description: "Image URL or path",
        required: true,
        example: "/images/moa-diagram.png",
      },
      alt: {
        type: "string",
        description: "Descriptive alt text for accessibility (required)",
        required: true,
        example:
          "Diagram showing mechanism of action at the cellular receptor level",
      },
      caption: {
        type: "string",
        description: "Optional caption displayed below the image",
        required: false,
        example: "Figure 1: Mechanism of action overview",
      },
      width: {
        type: "string",
        description: "Optional CSS width value for the image container",
        required: false,
        example: "100%",
      },
    },
  },
};

/**
 * Returns the prop shape metadata for a given component ID.
 * Returns undefined if the component ID is not in the approved design system.
 */
export function getPropShape(componentId: string): ComponentPropShape | undefined {
  return PROP_SHAPES[componentId];
}
