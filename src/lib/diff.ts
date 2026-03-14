/**
 * computePageSpecDiff — compares two PageSpec objects and returns a DiffResult.
 *
 * Compares section IDs for adds/removes. For shared sections, compares
 * component props via JSON.stringify to detect modifications.
 */
import type { PageSpec } from "@/types/page-spec";
import type { DiffResult } from "@/types/diff";

export function computePageSpecDiff(
  oldSpec: PageSpec,
  newSpec: PageSpec,
): DiffResult {
  const oldSectionIds = new Set(oldSpec.sections.map((s) => s.id));
  const newSectionIds = new Set(newSpec.sections.map((s) => s.id));

  const addedSections: string[] = [];
  const removedSections: string[] = [];
  const modifiedComponents: DiffResult["modifiedComponents"] = [];

  // Find added sections
  for (const id of newSectionIds) {
    if (!oldSectionIds.has(id)) {
      addedSections.push(id);
    }
  }

  // Find removed sections
  for (const id of oldSectionIds) {
    if (!newSectionIds.has(id)) {
      removedSections.push(id);
    }
  }

  // For shared sections, compare components
  const oldSectionMap = new Map(oldSpec.sections.map((s) => [s.id, s]));
  const newSectionMap = new Map(newSpec.sections.map((s) => [s.id, s]));

  for (const id of oldSectionIds) {
    if (!newSectionIds.has(id)) continue;

    const oldSection = oldSectionMap.get(id)!;
    const newSection = newSectionMap.get(id)!;

    // Compare each component by index — use the longer array length
    const maxLen = Math.max(
      oldSection.components.length,
      newSection.components.length,
    );

    for (let i = 0; i < maxLen; i++) {
      const oldComp = oldSection.components[i];
      const newComp = newSection.components[i];

      if (!oldComp || !newComp) {
        // Component added or removed within a section — treat as modification
        const comp = oldComp ?? newComp;
        modifiedComponents.push({
          sectionId: id,
          componentId: comp!.componentId,
          what: "props changed",
        });
        continue;
      }

      if (JSON.stringify(oldComp) !== JSON.stringify(newComp)) {
        modifiedComponents.push({
          sectionId: id,
          componentId: newComp.componentId,
          what: "props changed",
        });
      }
    }
  }

  // Build summary
  const parts: string[] = [];
  if (addedSections.length > 0) {
    parts.push(`${addedSections.length} added`);
  }
  if (removedSections.length > 0) {
    parts.push(`${removedSections.length} removed`);
  }
  if (modifiedComponents.length > 0) {
    parts.push(`${modifiedComponents.length} modified`);
  }

  const summary =
    parts.length === 0 ? "No visible changes" : parts.join(", ");

  return { summary, addedSections, removedSections, modifiedComponents };
}
