/**
 * Comma-separated tag drafts for profile fields.
 * Committed tags stay in the parent list; the input only holds an unfinished draft.
 */

export function parseTagDraft(draft: string, maxItemLength: number): string[] {
  return draft
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= maxItemLength);
}

export function sameTags(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((tag, index) => tag === right[index]);
}

/**
 * Merges a draft into the committed tags without dropping tags already saved.
 * Duplicate and over-long tokens are ignored. The result is capped at maxItems.
 */
export function commitTagDraft(
  existing: readonly string[],
  draft: string,
  maxItemLength: number,
  maxItems: number
): string[] {
  const next: string[] = [];
  const seen = new Set<string>();

  for (const tag of [...existing, ...parseTagDraft(draft, maxItemLength)]) {
    const trimmed = tag.trim();
    if (!trimmed || trimmed.length > maxItemLength || seen.has(trimmed)) continue;
    if (next.length >= maxItems) break;
    seen.add(trimmed);
    next.push(trimmed);
  }

  return next;
}

/**
 * Splits a draft on its last comma so finished tokens can be committed
 * while the fragment after the comma stays in the input.
 */
export function splitTrailingTagDraft(input: string): {
  committed: string;
  remainder: string;
} {
  const comma = input.lastIndexOf(",");
  if (comma === -1) {
    return { committed: "", remainder: input };
  }

  return {
    committed: input.slice(0, comma),
    remainder: input.slice(comma + 1),
  };
}
