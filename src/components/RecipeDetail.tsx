"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecipeIcon } from "@/components/RecipeIcon";
import { RecipeNavigation } from "@/components/RecipeNavigation";
import { RecipePhoto } from "@/components/RecipePhoto";
import { useRecipes } from "@/lib/useRecipes";
import { saveRecipes } from "@/lib/recipes";
import { loadHousehold, saveHousehold } from "@/lib/household";

function timeLabel(minutes: number | null) {
  if (minutes === null) return "Non indiqué";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

export function RecipeDetail({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const { recipes, isLoaded } = useRecipes();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [menuServings, setMenuServings] = useState<number | null>(null);
  const [menuMessage, setMenuMessage] = useState("");
  const recipe = recipes.find((item) => item.id === recipeId);

  const deleteRecipe = () => {
    const remainingRecipes = recipes.filter((item) => item.id !== recipeId);
    if (!saveRecipes(remainingRecipes)) {
      setDeleteError("La suppression a échoué. Vérifiez l’espace disponible sur cet appareil.");
      return;
    }
    router.replace("/Recettes");
  };

  const addToMenu = () => {
    if (!recipe) return;
    const household = loadHousehold();
    const saved = saveHousehold({
      ...household,
      plannedMeals: [
        ...household.plannedMeals,
        {
          id: crypto.randomUUID(),
          recipeId: recipe.id,
          servings: Math.max(1, menuServings ?? recipe.servings),
          plannedAt: new Date().toISOString(),
        },
      ],
    });
    setMenuMessage(saved ? "Repas ajouté au menu." : "Enregistrement impossible sur cet appareil.");
  };

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto min-h-screen max-w-3xl px-4 pb-32 pt-5 sm:px-8 sm:pt-8">
        <Link href="/Recettes" className="inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-sm font-medium text-muted hover:text-blue">
          <RecipeIcon name="back" className="size-5" />
          Toutes les recettes
        </Link>

        {!isLoaded && <p className="mt-10 text-sm text-muted">Chargement de la recette…</p>}
        {isLoaded && !recipe && (
          <div className="mt-8 rounded-lg border border-border bg-white p-6">
            <h1 className="font-editorial text-3xl">Recette introuvable</h1>
            <p className="mt-2 text-sm text-muted">Elle a peut-être été supprimée de cet appareil.</p>
          </div>
        )}

        {recipe && <>
          <RecipePhoto src={recipe.photos[0]} title={recipe.title} className="mt-4 aspect-[1.4] max-h-80 w-full rounded-lg sm:aspect-[2.2]" />
          {recipe.photos.length > 1 && <div className="mt-2 grid grid-cols-4 gap-2">{recipe.photos.slice(1).map((photo, index) => <RecipePhoto key={`photo-${index}`} src={photo} title={`${recipe.title}, photo ${index + 2}`} className="aspect-square rounded-md" />)}</div>}

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue">{recipe.category}</p>
              <h1 className="mt-2 break-words font-editorial text-4xl leading-tight sm:text-5xl">{recipe.title}</h1>
            </div>
            <Link href={`/Recettes/${recipe.id}/modifier`} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md bg-blue px-4 text-sm font-semibold text-white hover:bg-primary">
              <RecipeIcon name="edit" className="size-4" />
              Modifier
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-white py-3 text-center">
            <div className="px-2"><p className="text-[10px] font-medium uppercase tracking-wide text-muted">Préparation</p><p className="mt-1 text-sm font-semibold">{timeLabel(recipe.prepTimeMinutes)}</p></div>
            <div className="px-2"><p className="text-[10px] font-medium uppercase tracking-wide text-muted">Cuisson</p><p className="mt-1 text-sm font-semibold">{timeLabel(recipe.cookTimeMinutes)}</p></div>
            <div className="px-2"><p className="text-[10px] font-medium uppercase tracking-wide text-muted">Portions</p><p className="mt-1 text-sm font-semibold">{recipe.servings}</p></div>
          </div>

          <section className="mt-4 rounded-lg border border-border bg-white p-4">
            <h2 className="font-editorial text-xl">Prévoir ce repas</h2>
            <div className="mt-3 flex items-end gap-3">
              <label className="flex-1 text-sm font-medium">
                <span className="mb-1.5 block">Nombre de personnes</span>
                <input type="number" min="1" max="100" inputMode="numeric" value={menuServings ?? recipe.servings} onChange={(event) => setMenuServings(Number(event.target.value))} className="min-h-12 w-full rounded-md border border-border bg-white px-3 text-base focus:border-blue focus:outline-none" />
              </label>
              <button type="button" onClick={addToMenu} className="min-h-12 rounded-md bg-blue px-4 text-sm font-semibold text-white hover:bg-primary">Ajouter au menu</button>
            </div>
            {menuMessage && <p role="status" className="mt-2 text-sm text-muted">{menuMessage}</p>}
            <Link href="/Menu" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-blue">Voir les repas prévus</Link>
          </section>

          {recipe.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{recipe.tags.map((tag) => <span key={tag} className="rounded-sm bg-blue-light px-2.5 py-1 text-xs text-primary">{tag}</span>)}</div>}

          <section className="mt-8">
            <h2 className="font-editorial text-3xl">Ingrédients</h2>
            <p className="mt-1 text-sm text-muted">Pour {recipe.servings} portions</p>
            {recipe.ingredients.length ? (
              <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-white px-4">
                {recipe.ingredients.map((ingredient) => <li key={ingredient.id} className="flex min-h-12 items-center justify-between gap-4 py-2 text-sm"><span>{ingredient.name}</span><span className="shrink-0 font-medium text-muted">{[ingredient.quantity, ingredient.unit].filter(Boolean).join(" ")}</span></li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-muted">Aucun ingrédient renseigné.</p>}
          </section>

          <section className="mt-8">
            <h2 className="font-editorial text-3xl">Préparation</h2>
            {recipe.steps.length ? <ol className="mt-4 space-y-3">{recipe.steps.map((step, index) => <li key={`step-${index}`} className="flex gap-3 rounded-lg border border-border bg-white p-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-light text-sm font-semibold text-blue">{index + 1}</span><p className="pt-1 text-sm leading-relaxed">{step}</p></li>)}</ol> : <p className="mt-3 text-sm text-muted">Aucune étape renseignée.</p>}
          </section>

          <div className="mt-10 border-t border-border pt-5">
            <button type="button" onClick={() => { setDeleteError(""); setShowDeleteConfirmation(true); }} className="inline-flex min-h-12 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted hover:bg-blue-light hover:text-blue">
              <RecipeIcon name="trash" className="size-4" />
              Supprimer cette recette
            </button>
          </div>
        </>}
      </div>

      {showDeleteConfirmation && recipe && (
        <div className="fixed inset-0 z-30 grid place-items-end bg-foreground/40 p-3 sm:place-items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDeleteConfirmation(false); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" className="w-full max-w-md rounded-lg border border-border bg-white p-5 shadow-xl sm:p-6">
            <h2 id="delete-title" className="font-editorial text-2xl">Supprimer cette recette ?</h2>
            <p id="delete-description" className="mt-2 text-sm leading-relaxed text-muted">« {recipe.title} » sera supprimée de cet appareil. Cette action est définitive.</p>
            {deleteError && <p role="alert" className="mt-3 text-sm text-blue">{deleteError}</p>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" autoFocus onClick={() => setShowDeleteConfirmation(false)} className="min-h-12 rounded-md border border-border px-4 text-sm font-semibold">Annuler</button>
              <button type="button" onClick={deleteRecipe} className="min-h-12 rounded-md bg-blue px-4 text-sm font-semibold text-white hover:bg-primary">Supprimer</button>
            </div>
          </section>
        </div>
      )}
      <RecipeNavigation />
    </main>
  );
}