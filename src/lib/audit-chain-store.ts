"use client";

import type { AuditEntry } from "./audit-chain";

let _entries: ReadonlyArray<AuditEntry> = [];

export function getAuditEntries(): ReadonlyArray<AuditEntry> {
  return [..._entries];
}

export function addAuditEntry(entry: AuditEntry): void {
  _entries = [..._entries, entry];
}

export function clearAuditEntries(): void {
  _entries = [];
}
