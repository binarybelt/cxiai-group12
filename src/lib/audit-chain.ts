/**
 * SHA-256 hash chain for tamper-proof audit trail.
 * Each entry hashes its content with the previous entry's hash.
 * Pure functions — no side effects.
 */

export interface AuditEntry {
  readonly id: string;
  readonly sequenceNum: number;
  readonly timestamp: string;
  readonly action: string;
  readonly actor: string;
  readonly input: string;
  readonly output: string;
  readonly inputHash: string;
  readonly outputHash: string;
  readonly entryHash: string;
  readonly previousHash: string;
}

/**
 * Compute SHA-256 hash of a string using Web Crypto API.
 * Works in both Node.js 18+ and browser environments.
 * Falls back to a deterministic placeholder if crypto.subtle is unavailable.
 */
export async function sha256(data: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    // Fallback for environments without Web Crypto (e.g., some test runners).
    // NOT cryptographically secure — only for graceful degradation.
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash).toString(16).padStart(64, "0");
  }

  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create a new audit entry with hash chain linkage.
 */
export async function createAuditEntry(
  sequenceNum: number,
  action: string,
  actor: string,
  input: string,
  output: string,
  previousHash: string,
): Promise<AuditEntry> {
  const timestamp = new Date().toISOString();
  const inputHash = await sha256(input);
  const outputHash = await sha256(output);

  // Entry hash chains: content + previous hash = current hash
  const entryContent = `${sequenceNum}|${timestamp}|${action}|${inputHash}|${outputHash}|${previousHash}`;
  const entryHash = await sha256(entryContent);

  return {
    id: `audit-${sequenceNum}-${Date.now()}`,
    sequenceNum,
    timestamp,
    action,
    actor,
    input: input.slice(0, 500), // Truncate for display, full content hashed
    output: output.slice(0, 500),
    inputHash,
    outputHash,
    entryHash,
    previousHash,
  };
}

/**
 * Verify the integrity of an audit chain.
 * Returns { valid: true } if all hashes match, or { valid: false, brokenAt } if tampered.
 */
export async function verifyChain(
  entries: ReadonlyArray<AuditEntry>,
): Promise<{ readonly valid: boolean; readonly brokenAt?: number; readonly details: string[] }> {
  const details: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // Verify entry hash
    const expectedContent = `${entry.sequenceNum}|${entry.timestamp}|${entry.action}|${entry.inputHash}|${entry.outputHash}|${entry.previousHash}`;
    const expectedHash = await sha256(expectedContent);

    if (expectedHash !== entry.entryHash) {
      details.push(
        `Entry ${i}: HASH MISMATCH (expected ${expectedHash.slice(0, 12)}..., got ${entry.entryHash.slice(0, 12)}...)`,
      );
      return { valid: false, brokenAt: i, details };
    }

    // Verify chain linkage (except first entry)
    if (i > 0 && entry.previousHash !== entries[i - 1].entryHash) {
      details.push(
        `Entry ${i}: CHAIN BREAK (previousHash doesn't match entry ${i - 1})`,
      );
      return { valid: false, brokenAt: i, details };
    }

    details.push(`Entry ${i} (${entry.action}): verified`);
  }

  return { valid: true, details };
}
