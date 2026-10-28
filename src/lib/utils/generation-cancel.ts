/**
 * What the generate screen should do when the cook presses Cancel.
 * A cancelled run must not be stored as a finished recipe.
 */
export function planGenerationCancel(): {
  clearPendingStart: boolean;
  abortInFlight: boolean;
  stopGenerating: boolean;
  recordHistory: boolean;
} {
  return {
    clearPendingStart: true,
    abortInFlight: true,
    stopGenerating: true,
    recordHistory: false,
  };
}
