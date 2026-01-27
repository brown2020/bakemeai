import { ModeSelectorProps, ModeCardProps } from "../types";
import { CARD_STYLES } from "../constants";

const ModeCard = ({ title, description, onClick }: ModeCardProps) => (
  <div
    className={`${CARD_STYLES.container} ${CARD_STYLES.hoverEffect}`}
    onClick={onClick}
  >
    <h2 className={CARD_STYLES.title}>{title}</h2>
    <p className={CARD_STYLES.description}>{description}</p>
  </div>
);

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
