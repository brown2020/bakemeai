import { memo } from "react";

import type { NutritionSummary } from "@/lib/utils/nutrition";

interface NutritionSummaryPanelProps {
  summary: NutritionSummary;
}

interface NutritionItemProps {
  label: string;
  value: string;
}

function NutritionItem({ label, value }: NutritionItemProps) {
  return (
    <div className="rounded-md bg-white px-3 py-2 border border-surface-200">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

/**
 * Compact nutrition summary shown when calories or macros are available.
 */
export const NutritionSummaryPanel = memo(function NutritionSummaryPanel({
  summary,
}: NutritionSummaryPanelProps) {
  const items: NutritionItemProps[] = [];

  if (summary.calories != null) {
    items.push({ label: "Calories", value: `${summary.calories} kcal` });
  }
  if (summary.protein?.trim()) {
    items.push({ label: "Protein", value: summary.protein });
  }
  if (summary.carbs?.trim()) {
    items.push({ label: "Carbs", value: summary.carbs });
  }
  if (summary.fat?.trim()) {
    items.push({ label: "Fat", value: summary.fat });
  }

  if (items.length === 0) return null;

  return (
    <aside
      aria-label="Nutrition information"
      className="mb-4 rounded-lg border border-surface-200 bg-surface-50 p-3 sm:p-4"
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Nutrition per serving
      </h3>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <NutritionItem key={item.label} {...item} />
        ))}
      </dl>
    </aside>
  );
});
