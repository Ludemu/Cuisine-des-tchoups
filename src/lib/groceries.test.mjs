import assert from "node:assert/strict";
import test from "node:test";
import { generateShoppingItems } from "./groceries.ts";
import { removeShoppingItem } from "./household.ts";
import { EMPTY_HOUSEHOLD } from "./household.ts";
import { INITIAL_RECIPES } from "./recipes.ts";

const carbonara = INITIAL_RECIPES.find((recipe) => recipe.id === "spaghetti-carbonara");

function meal(recipeId, servings, id) {
  return { id, recipeId, servings, plannedAt: "2026-10-21T18:00:00.000Z" };
}

test("recalcule les quantités selon le nombre de portions", () => {
  const items = generateShoppingItems(
    [meal(carbonara.id, 2, "meal-half")],
    [carbonara],
    [],
  );

  const spaghetti = items.find((item) => item.name === "Spaghetti");
  assert.equal(spaghetti.quantity, "200");
  assert.equal(spaghetti.unit, "g");
});

test("additionne deux occurrences distinctes de la même recette", () => {
  const items = generateShoppingItems(
    [meal(carbonara.id, 2, "meal-small"), meal(carbonara.id, 6, "meal-large")],
    [carbonara],
    [],
  );

  const spaghetti = items.filter((item) => item.name === "Spaghetti");
  assert.equal(spaghetti.length, 1);
  assert.equal(spaghetti[0].quantity, "800");
});

test("fusionne les quantités compatibles et convertit les unités", () => {
  const milkByMilliliters = {
    ...carbonara,
    id: "milk-ml",
    servings: 4,
    ingredients: [{ id: "milk-a", name: "Lait", quantity: "500", unit: "ml" }],
  };
  const milkByLiters = {
    ...carbonara,
    id: "milk-liters",
    servings: 2,
    ingredients: [{ id: "milk-b", name: "lait", quantity: "1", unit: "l" }],
  };

  const items = generateShoppingItems(
    [meal(milkByMilliliters.id, 4, "milk-meal-a"), meal(milkByLiters.id, 2, "milk-meal-b")],
    [milkByMilliliters, milkByLiters],
    [],
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, "1,5");
  assert.equal(items[0].unit, "l");
});

test("conserve les articles manuels et les cases cochées après régénération", () => {
  const previousItems = [
    {
      id: "checked-spaghetti",
      name: "Spaghetti",
      quantity: "400",
      unit: "g",
      checked: true,
      manual: false,
      aggregationKey: "spaghetti|mass",
    },
    {
      id: "manual-coffee",
      name: "Café",
      quantity: "1",
      unit: "paquet",
      checked: false,
      manual: true,
    },
  ];

  const items = generateShoppingItems([meal(carbonara.id, 4, "meal-full")], [carbonara], previousItems);
  const spaghetti = items.find((item) => item.name === "Spaghetti");
  const coffee = items.find((item) => item.name === "Café");
  assert.equal(spaghetti.id, "checked-spaghetti");
  assert.equal(spaghetti.checked, true);
  assert.equal(coffee.manual, true);
});

test("retirer un article des courses ne modifie pas la recette source", () => {
  const recipe = structuredClone(carbonara);
  const originalIngredients = structuredClone(recipe.ingredients);
  const state = {
    ...EMPTY_HOUSEHOLD,
    shoppingItems: [{ id: "remove-me", name: "Spaghetti", quantity: "400", unit: "g", checked: false, manual: false }],
  };

  const updatedState = removeShoppingItem(state, "remove-me");

  assert.equal(state.shoppingItems.length, 1);
  assert.equal(updatedState.shoppingItems.length, 0);
  assert.deepEqual(recipe.ingredients, originalIngredients);
});