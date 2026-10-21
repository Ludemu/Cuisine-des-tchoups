import type { Recipe } from "@/lib/recipes";
import type { PlannedMeal, ShoppingItem } from "@/lib/household";

type UnitInfo = {
  key: string;
  baseUnit: string;
  factor: number;
  family: "mass" | "volume" | "count" | "other";
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/\s+/g, " ")
    .trim();
}

function unitInfo(unit: string): UnitInfo {
  const key = normalize(unit).replace(/[.]/g, "");
  const units: Record<string, UnitInfo> = {
    g: { key: "mass", baseUnit: "g", factor: 1, family: "mass" },
    gramme: { key: "mass", baseUnit: "g", factor: 1, family: "mass" },
    grammes: { key: "mass", baseUnit: "g", factor: 1, family: "mass" },
    kg: { key: "mass", baseUnit: "g", factor: 1000, family: "mass" },
    kilo: { key: "mass", baseUnit: "g", factor: 1000, family: "mass" },
    kilos: { key: "mass", baseUnit: "g", factor: 1000, family: "mass" },
    ml: { key: "volume", baseUnit: "ml", factor: 1, family: "volume" },
    cl: { key: "volume", baseUnit: "ml", factor: 10, family: "volume" },
    l: { key: "volume", baseUnit: "ml", factor: 1000, family: "volume" },
    litre: { key: "volume", baseUnit: "ml", factor: 1000, family: "volume" },
    litres: { key: "volume", baseUnit: "ml", factor: 1000, family: "volume" },
    unite: { key: "count", baseUnit: "unité", factor: 1, family: "count" },
    piece: { key: "count", baseUnit: "unité", factor: 1, family: "count" },
    pieces: { key: "count", baseUnit: "unité", factor: 1, family: "count" },
    pcs: { key: "count", baseUnit: "unité", factor: 1, family: "count" },
  };

  return units[key] ?? {
    key: `other:${key}`,
    baseUnit: unit.trim(),
    factor: 1,
    family: "other",
  };
}

function parseQuantity(quantity: string): number | null {
  const normalized = quantity.trim().replace(/,/g, ".");
  const fractions: Record<string, number> = { "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75 };
  if (fractions[normalized] !== undefined) return fractions[normalized];
  const mixed = normalized.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = normalized.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const numeric = Number(normalized);
  return normalized !== "" && Number.isFinite(numeric) ? numeric : null;
}

function formatNumber(value: number) {
  return Number(value.toFixed(3)).toLocaleString("fr-FR", { maximumFractionDigits: 3 });
}

export function generateShoppingItems(
  plannedMeals: PlannedMeal[],
  recipes: Recipe[],
  previousItems: ShoppingItem[],
): ShoppingItem[] {
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const previousByKey = new Map(
    previousItems.filter((item) => !item.manual && item.aggregationKey)
      .map((item) => [item.aggregationKey as string, item]),
  );
  const groups = new Map<string, {
    name: string;
    quantity: number;
    unitInfo: UnitInfo;
    unitLabel: string;
    nonNumericQuantity: string;
    previous?: ShoppingItem;
  }>();

  for (const meal of plannedMeals) {
    const recipe = recipesById.get(meal.recipeId);
    if (!recipe || recipe.servings <= 0) continue;
    const multiplier = meal.servings / recipe.servings;

    for (const ingredient of recipe.ingredients) {
      if (!ingredient.name.trim()) continue;
      const unit = unitInfo(ingredient.unit);
      const amount = parseQuantity(ingredient.quantity);
      const nameKey = normalize(ingredient.name);
      const key = amount === null
        ? `${nameKey}|${unit.key}|text:${normalize(ingredient.quantity)}|${meal.id}:${ingredient.id}`
        : `${nameKey}|${unit.key}`;
      const existing = groups.get(key);

      if (existing) {
        existing.quantity += amount === null ? 0 : amount * multiplier * unit.factor;
      } else {
        groups.set(key, {
          name: ingredient.name.trim(),
          quantity: amount === null ? 0 : amount * multiplier * unit.factor,
          unitInfo: unit,
          unitLabel: ingredient.unit.trim(),
          nonNumericQuantity: amount === null ? ingredient.quantity.trim() : "",
          previous: previousByKey.get(key),
        });
      }
    }
  }

  const generated: ShoppingItem[] = [];
  for (const [key, group] of groups) {
    let quantity = group.quantity;
    let unit = group.unitInfo.baseUnit;
    if (group.unitInfo.family === "mass" && quantity >= 1000) {
      quantity /= 1000;
      unit = "kg";
    } else if (group.unitInfo.family === "volume" && quantity >= 1000) {
      quantity /= 1000;
      unit = "l";
    } else if (group.unitInfo.family === "other") {
      unit = group.unitLabel;
    }

    generated.push({
      id: group.previous?.id ?? `generated-${generated.length}-${key}`,
      name: group.name,
      quantity: group.nonNumericQuantity || formatNumber(quantity),
      unit,
      checked: group.previous?.checked ?? false,
      manual: false,
      aggregationKey: key,
    });
  }

  return [
    ...generated,
    ...previousItems.filter((item) => item.manual),
  ];
}