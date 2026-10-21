"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeNavigation } from "@/components/RecipeNavigation";
import type { Recipe, RecipeDraft } from "@/lib/recipes";
import { loadRecipes, saveRecipes } from "@/lib/recipes";
import { useRecipes } from "@/lib/useRecipes";
import { RecipeIcon } from "@/components/RecipeIcon";

export function RecipeEditor({ recipeId }: { recipeId?: string }) {
  const router = useRouter();
  const { recipes, isLoaded } = useRecipes();
  const existingRecipe = recipeId ? recipes.find((recipe) => recipe.id === recipeId) : undefined;

  const saveRecipe = (draft: RecipeDraft) => {
    const currentRecipes = loadRecipes();
    const timestamp = new Date().toISOString();

    if (recipeId) {
      const currentRecipe = currentRecipes.find((recipe) => recipe.id === recipeId);
      if (!currentRecipe) return false;
      const updatedRecipe: Recipe = {
        ...draft,
        id: currentRecipe.id,
        createdAt: currentRecipe.createdAt,
        updatedAt: timestamp,
      };
      const updatedRecipes = currentRecipes.map((recipe) => recipe.id === recipeId ? updatedRecipe : recipe);
      if (!saveRecipes(updatedRecipes)) return false;
      router.replace(`/Recettes/${recipeId}`);
      return true;
    }

    const newRecipe: Recipe = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    if (!saveRecipes([newRecipe, ...currentRecipes])) return false;
    router.replace(`/Recettes/${newRecipe.id}`);
    return true;
  };

  const isEditing = Boolean(recipeId);
  const title = isEditing ? "Modifier la recette" : "Nouvelle recette";

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto min-h-screen max-w-2xl px-4 pb-32 pt-5 sm:px-8 sm:pt-8">
        <Link href={recipeId ? `/Recettes/${recipeId}` : "/Recettes"} className="inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-sm font-medium text-muted hover:text-blue">
          <RecipeIcon name="back" className="size-5" />
          {isEditing ? "Fiche recette" : "Toutes les recettes"}
        </Link>

        <header className="pb-6 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">La cuisine des Tchoups</p>
          <h1 className="mt-3 font-editorial text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">Les champs marqués d’un astérisque sont obligatoires.</p>
        </header>

        {isEditing && !isLoaded && <p className="py-8 text-sm text-muted">Chargement…</p>}
        {isLoaded && isEditing && !existingRecipe && (
          <div className="rounded-lg border border-border bg-white p-5">
            <p className="font-editorial text-2xl">Recette introuvable</p>
            <Link href="/Recettes" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-blue">Retour aux recettes</Link>
          </div>
        )}
        {(!isEditing || (isLoaded && existingRecipe)) && (
          <RecipeForm key={recipeId ?? "new-recipe"} initialRecipe={existingRecipe} onSave={saveRecipe} />
        )}
      </div>
      <RecipeNavigation />
    </main>
  );
}