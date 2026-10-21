"use client";

import Link from "next/link";
import { useState } from "react";
import { RecipeIcon } from "@/components/RecipeIcon";
import { RecipeNavigation } from "@/components/RecipeNavigation";
import { RecipePhoto } from "@/components/RecipePhoto";
import { useRecipes } from "@/lib/useRecipes";
import type { RecipeCategory } from "@/lib/recipes";

type RecipeFilter = RecipeCategory | "Toutes";
const filters: RecipeFilter[] = ["Toutes", "Entrée", "Plat", "Dessert", "Soupe", "Brunch"];
const filterLabels: Record<RecipeFilter, string> = {
  Toutes: "Toutes",
  Entrée: "Entrées",
  Plat: "Plats",
  Dessert: "Desserts",
  Soupe: "Soupes",
  Brunch: "Petit-déjeuner / brunch",
};

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim();
}

function recipeTime(prep: number | null, cook: number | null) {
  const total = (prep ?? 0) + (cook ?? 0);
  if (!total) return "Temps non indiqué";
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function RecipeLibrary() {
  const { recipes, isLoaded } = useRecipes();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RecipeFilter>("Toutes");
  const normalizedSearch = normalizeText(search);
  const visibleRecipes = recipes.filter((recipe) => {
    const matchesCategory = filter === "Toutes" || recipe.category === filter;
    const searchableText = normalizeText([
      recipe.title,
      recipe.category,
      ...recipe.ingredients.map((ingredient) => ingredient.name),
      ...recipe.tags,
    ].join(" "));
    return matchesCategory && searchableText.includes(normalizedSearch);
  });

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto min-h-screen max-w-5xl px-4 pb-32 sm:px-8">
        <header className="pb-6 pt-8 sm:pb-8 sm:pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">La cuisine des Tchoups</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <h1 className="font-editorial text-4xl sm:text-5xl">Recettes</h1>
              <p className="mt-2 text-sm text-muted">Vos idées à cuisiner, rassemblées ici.</p>
            </div>
            <Link href="/Recettes/nouvelle" className="grid size-12 shrink-0 place-items-center rounded-md bg-blue text-white transition hover:bg-primary" aria-label="Ajouter une recette" title="Ajouter une recette">
              <RecipeIcon name="plus" className="size-6" />
            </Link>
          </div>
        </header>

        <section aria-label="Recherche et filtres" className="sticky top-0 z-10 -mx-4 border-b border-border/70 bg-background/95 px-4 pb-4 pt-1 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-6">
          <label htmlFor="recipe-search" className="sr-only">Rechercher une recette ou un ingrédient</label>
          <div className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-white px-3 focus-within:border-blue">
            <RecipeIcon name="search" className="size-5 shrink-0 text-blue" />
            <input id="recipe-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Recette ou ingrédient" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/80" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Effacer la recherche" className="grid size-10 shrink-0 place-items-center rounded-md text-muted hover:bg-blue-light"><RecipeIcon name="close" className="size-4" /></button>}
          </div>

          <div className="-mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex w-max gap-2">
              {filters.map((option) => (
                <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)} className={`min-h-11 rounded-md border px-4 text-sm font-medium transition-colors ${filter === option ? "border-blue bg-blue text-white" : "border-border bg-white text-muted hover:border-blue/50 hover:text-blue"}`}>
                  {filterLabels[option]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section aria-live="polite" aria-label="Résultats des recettes">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-editorial text-2xl">{filter === "Toutes" ? "Toutes les recettes" : filterLabels[filter]}</h2>
            <span className="text-xs text-muted">{visibleRecipes.length} recette{visibleRecipes.length === 1 ? "" : "s"}</span>
          </div>

          {visibleRecipes.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {visibleRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/Recettes/${recipe.id}`} className="group flex min-h-32 overflow-hidden rounded-lg border border-border bg-white transition hover:border-blue/50 focus-visible:ring-2 focus-visible:ring-blue sm:flex-col">
                  <RecipePhoto src={recipe.photos[0]} title={recipe.title} className="h-auto min-h-32 w-28 shrink-0 sm:aspect-[1.65] sm:min-h-0 sm:w-full" />
                  <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:p-4">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue">{recipe.category}</p>
                    <h3 className="font-editorial text-xl leading-tight group-hover:text-blue sm:min-h-14">{recipe.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      {(recipe.prepTimeMinutes !== null || recipe.cookTimeMinutes !== null) && <span className="inline-flex items-center gap-1.5"><RecipeIcon name="clock" className="size-3.5" />{recipeTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}</span>}
                      <span className="inline-flex items-center gap-1.5"><RecipeIcon name="users" className="size-3.5" />{recipe.servings} parts</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-white px-5 py-12 text-center">
              <p className="font-editorial text-2xl">{isLoaded ? "Aucune recette trouvée" : "Chargement des recettes…"}</p>
              {isLoaded && <><p className="mt-2 text-sm text-muted">Essayez un autre ingrédient ou modifiez les filtres.</p><button type="button" onClick={() => { setSearch(""); setFilter("Toutes"); }} className="mt-4 min-h-11 rounded-md bg-blue px-4 text-sm font-semibold text-white">Réinitialiser</button></>}
            </div>
          )}
        </section>
      </div>
      <RecipeNavigation />
    </main>
  );
}