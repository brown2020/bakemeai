import { memo } from "react";
import { ModeSelectorProps, ModeCardProps } from "../types";
import { CARD_STYLES } from "../constants";

/**
 * Individual mode card component.
 *
 * Memoization rationale:
 * - Static content that never changes
 * - Rendered in a small list (2 items)
 * - Parent (ModeSelector) doesn't re-render in practice
 * - Minimal benefit, but follows consistent pattern
 * - Could be removed without performance impact
 */
const ModeCard = memo(function ModeCard({
  title,
  description,
  onClick,
}: ModeCardProps) {
  return (
    <button
      className={`${CARD_STYLES.container} ${CARD_STYLES.hoverEffect} w-full text-left`}
      onClick={onClick}
      type="button"
      aria-label={title}
    >
      <h2 className={CARD_STYLES.title}>{title}</h2>
      <p className={CARD_STYLES.description}>{description}</p>
    </button>
  );
});

/**
 * Mode selector component for recipe generation.
 * Allows users to choose between specific recipe request or ingredient-based generation.
 */
export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ModeCard
        title="I want to make something specific"
        description="Get a recipe for a particular dish you have in mind"
        onClick={() => onSelectMode("specific")}
      />
      <ModeCard
        title="Suggest something based on ingredients"
        description="List what you have and get recipe suggestions"
        onClick={() => onSelectMode("ingredients")}
      />
    </div>
  );
}
