import type { ReactElement } from "react";
import { ModeSelectorProps, ModeCardProps } from "../types";
import { CARD_STYLES } from "../constants";

const ModeCard = ({ title, description, onClick }: ModeCardProps): ReactElement => (
  <div
    className={`${CARD_STYLES.container} ${CARD_STYLES.hoverEffect}`}
    onClick={onClick}
  >
    <h2 className={CARD_STYLES.title}>{title}</h2>
    <p className={CARD_STYLES.description}>{description}</p>
  </div>
);

export function ModeSelector({ onSelectMode }: ModeSelectorProps): ReactElement {
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
