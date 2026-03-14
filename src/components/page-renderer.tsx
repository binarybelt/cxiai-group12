"use client";

import React from "react";

import {
  Card,
  CTA,
  ClaimReference,
  ContentBlock,
  DataTable,
  Disclaimer,
  Footer,
  Hero,
  ISIBlock,
  ImageBlock,
  NavBar,
  SectionHeader,
} from "@/components/index";
import type { ComponentRef, PageSpec } from "@/types/page-spec";

// ---------------------------------------------------------------------------
// Component registry — maps component ID strings (as they appear in PageSpec
// componentId fields and components.json) to the actual React components.
// Keys MUST exactly match the approved component IDs from the design system.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  Hero,
  Card,
  ISIBlock,
  Disclaimer,
  CTA,
  NavBar,
  Footer,
  DataTable,
  ClaimReference,
  SectionHeader,
  ContentBlock,
  ImageBlock,
};

// ---------------------------------------------------------------------------
// renderComponentRef — looks up the component in the registry and renders it
// with the spread props from the ComponentRef.
// Unknown componentIds produce a console warning and render null (no crash).
// Node-type props (NavBar.links, DataTable.headers/rows, etc.) pass through
// as-is because components accept JSON-serializable types directly.
// ---------------------------------------------------------------------------

function renderComponentRef(ref: ComponentRef, index: number): React.ReactNode {
  const Component = COMPONENT_REGISTRY[ref.componentId];

  if (!Component) {
    console.warn(
      `[PageRenderer] Unknown componentId "${ref.componentId}" — skipping render`,
    );
    return null;
  }

  return (
    <Component
      key={`${ref.componentId}-${index}`}
      {...(ref.props as Record<string, unknown>)}
    />
  );
}

// ---------------------------------------------------------------------------
// PageRenderer — receives a (potentially partial) PageSpec and renders its
// sections sorted by section.order. Uses optional chaining throughout to
// handle incomplete streaming state gracefully.
// ---------------------------------------------------------------------------

export interface PageRendererProps {
  spec: Partial<PageSpec>;
}

export function PageRenderer({ spec }: PageRendererProps) {
  const sortedSections = [...(spec.sections ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="space-y-6">
      {sortedSections.map((section) => (
        <div key={section.id} className="section-wrapper">
          {section.components.map((ref, idx) =>
            renderComponentRef(ref, idx),
          )}
        </div>
      ))}
    </div>
  );
}

export default PageRenderer;
