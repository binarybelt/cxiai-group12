/**
 * DiffResult — describes the difference between two PageSpec objects.
 *
 * Used by computePageSpecDiff() and surfaced in the ChatPanel's diff summary.
 */
export interface DiffResult {
  summary: string;
  addedSections: string[];
  removedSections: string[];
  modifiedComponents: Array<{
    sectionId: string;
    componentId: string;
    what: string;
  }>;
}
