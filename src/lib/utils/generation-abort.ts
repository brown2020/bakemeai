const MAX_GENERATION_AGE_MS = 3 * 60 * 1000;

interface ActiveGeneration {
  controller: AbortController;
  userId: string;
  startedAt: number;
}

const activeGenerations = new Map<string, ActiveGeneration>();

function sweepGenerations(now: number): void {
  for (const [id, entry] of activeGenerations) {
    if (now - entry.startedAt <= MAX_GENERATION_AGE_MS) continue;
    entry.controller.abort();
    activeGenerations.delete(id);
  }
}

/**
 * Registers an abort controller for one in-flight recipe generation.
 * The id is unguessable and only the owning user can abort it.
 */
export function startGeneration(userId: string, now = Date.now()): {
  id: string;
  controller: AbortController;
} {
  sweepGenerations(now);
  const id = crypto.randomUUID();
  const controller = new AbortController();
  activeGenerations.set(id, { controller, userId, startedAt: now });
  return { id, controller };
}

/** Stops the OpenAI stream when the client cancels or the stream fails. */
export function abortGeneration(generationId: string, userId: string): boolean {
  const entry = activeGenerations.get(generationId);
  if (!entry || entry.userId !== userId) return false;
  entry.controller.abort();
  activeGenerations.delete(generationId);
  return true;
}

export function finishGeneration(generationId: string): void {
  activeGenerations.delete(generationId);
}
