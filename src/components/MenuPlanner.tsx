"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RecipeIcon } from "@/components/RecipeIcon";
import { RecipeNavigation } from "@/components/RecipeNavigation";
import { RecipePhoto } from "@/components/RecipePhoto";
import { useHousehold } from "@/lib/useHousehold";
import { useRecipes } from "@/lib/useRecipes";
import { saveHousehold } from "@/lib/household";
import { generateShoppingItems } from "@/lib/groceries";

export function MenuPlanner() {
  const router = useRouter();
  const { household, isLoaded: householdLoaded } = useHousehold();
  const { recipes, isLoaded: recipesLoaded } = useRecipes();
  const isLoaded = householdLoaded && recipesLoaded;
  const meals = [...household.plannedMeals].sort((a, b) => a.plannedAt.localeCompare(b.plannedAt));

  const removeMeal = (mealId: string) => {
    saveHousehold({
      ...household,
      plannedMeals: household.plannedMeals.filter((meal) => meal.id !== mealId),
    });
  };

  const createShoppingList = () => {
    const shoppingItems = generateShoppingItems(meals, recipes, household.shoppingItems);
    if (saveHousehold({ ...household, shoppingItems })) router.push("/Courses");
  };

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto min-h-screen max-w-2xl px-4 pb-32 pt-8 sm:px-8 sm:pt-12">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">La cuisine des Tchoups</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <h1 className="font-editorial text-4xl sm:text-5xl">Repas prévus</h1>
              <p className="mt-2 text-sm text-muted">Chaque ajout correspond à un repas.</p>
            </div>
            <Link href="/Recettes" className="grid size-12 shrink-0 place-items-center rounded-md border border-border bg-white text-blue hover:bg-blue-light" aria-label="Parcourir les recettes" title="Parcourir les recettes">
              <RecipeIcon name="book" />
            </Link>
          </div>
        </header>

        {!isLoaded && <p className="rounded-lg border border-border bg-white p-5 text-sm text-muted">Chargement du menu…</p>}
        {isLoaded && meals.length === 0 && (
          <div className="rounded-lg border border-border bg-white px-5 py-10 text-center">
            <h2 className="font-editorial text-2xl">Votre menu est vide</h2>
            <p className="mt-2 text-sm text-muted">Ajoutez une recette, puis choisissez le nombre de personnes.</p>
            <Link href="/Recettes" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-blue px-5 text-sm font-semibold text-white">Choisir une recette</Link>
          </div>
        )}

        {meals.length > 0 && (
          <>
            <ol className="space-y-3">
              {meals.map((meal, index) => {
                const recipe = recipes.find((item) => item.id === meal.recipeId);
                return (
                  <li key={meal.id} className="flex min-h-24 items-center gap-3 rounded-lg border border-border bg-white p-3">
                    {recipe ? (
                      <Link href={`/Recettes/${recipe.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                        <RecipePhoto src={recipe.photos[0]} title={recipe.title} className="size-16 shrink-0 rounded-md" />
                        <span className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-blue">Repas {index + 1}</span>
                          <span className="mt-1 block truncate font-editorial text-lg">{recipe.title}</span>
                          <span className="mt-1 block text-xs text-muted">{meal.servings} personne{meal.servings === 1 ? "" : "s"}</span>
                        </span>
                      </Link>
                    ) : (
                      <span className="min-w-0 flex-1 text-sm text-muted">Recette supprimée · {meal.servings} personnes</span>
                    )}
                    <button type="button" onClick={() => removeMeal(meal.id)} aria-label={`Retirer le repas ${index + 1} du menu`} className="grid size-11 shrink-0 place-items-center rounded-md text-muted hover:bg-blue-light hover:text-blue">
                      <RecipeIcon name="close" className="size-5" />
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="sticky bottom-[4.5rem] mt-5 rounded-lg border border-border bg-background/95 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
              <button type="button" onClick={createShoppingList} className="min-h-14 w-full rounded-md bg-blue px-4 text-base font-semibold text-white transition hover:bg-primary">
                Générer la liste de courses
              </button>
              {!recipes.length && <p role="status" className="mt-2 text-sm text-muted">Ajoutez une recette pour pouvoir préparer la liste de courses.</p>}
            </div>
          </>
        )}
      </div>
      <RecipeNavigation />
    </main>
  );
}