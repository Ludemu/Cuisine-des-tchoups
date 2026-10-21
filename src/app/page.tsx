"use client";

import Link from "next/link";
import { RecipeIcon } from "@/components/RecipeIcon";
import { RecipeNavigation } from "@/components/RecipeNavigation";
import { RecipePhoto } from "@/components/RecipePhoto";
import { useHousehold } from "@/lib/useHousehold";
import { useRecipes } from "@/lib/useRecipes";

function formatTime(prep: number | null, cook: number | null) {
  const total = (prep ?? 0) + (cook ?? 0);
  if (!total) return "Temps non indiqué";
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export default function Home() {
  const { recipes, isLoaded } = useRecipes();
  const { household, isLoaded: householdLoaded } = useHousehold();
  const plannedMeals = [...household.plannedMeals].sort((a, b) => a.plannedAt.localeCompare(b.plannedAt)).slice(0, 2);
  const needToBuy = household.shoppingItems.filter((item) => !item.checked).length;

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto min-h-screen max-w-lg px-4 pb-32 sm:px-8">
        <header className="pb-7 pt-9 sm:pb-9 sm:pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">La cuisine des Tchoups</p>
          <h1 className="mt-5 font-editorial text-5xl font-normal leading-none">Bonjour</h1>
          <p className="mt-3 text-base text-muted">Qu&apos;est-ce qu&apos;on mange bientôt ?</p>
        </header>

        <section aria-labelledby="home-recipes-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 id="home-recipes-heading" className="font-editorial text-3xl">Nos recettes</h2>
              <p className="mt-1 text-sm text-muted">Quelques idées pour commencer</p>
            </div>
            <Link href="/Recettes" className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-blue hover:text-primary">Voir tout</Link>
          </div>

          {!isLoaded && <p className="rounded-lg border border-border bg-white p-5 text-sm text-muted">Chargement des recettes…</p>}
          {isLoaded && recipes.length === 0 && <p className="rounded-lg border border-border bg-white p-5 text-sm text-muted">Aucune recette pour le moment.</p>}
          <div className="space-y-3">
            {recipes.slice(0, 4).map((recipe) => (
              <Link key={recipe.id} href={`/Recettes/${recipe.id}`} className="flex min-h-28 items-center gap-3 rounded-lg border border-border bg-white p-3 transition hover:border-blue/50 focus-visible:ring-2 focus-visible:ring-blue">
                <RecipePhoto src={recipe.photos[0]} title={recipe.title} className="size-20 shrink-0 rounded-md sm:size-24" />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-blue">{recipe.category}</p>
                  <h3 className="line-clamp-2 font-editorial text-lg leading-tight">{recipe.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    {(recipe.prepTimeMinutes !== null || recipe.cookTimeMinutes !== null) && <span className="inline-flex items-center gap-1"><RecipeIcon name="clock" className="size-3.5" />{formatTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}</span>}
                    <span className="inline-flex items-center gap-1"><RecipeIcon name="users" className="size-3.5" />{recipe.servings} parts</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/Recettes/nouvelle" className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-md bg-blue px-4 text-base font-semibold text-white transition hover:bg-primary">
            <RecipeIcon name="plus" className="size-5" />
            Ajouter une recette
          </Link>
        </section>

        <section aria-labelledby="home-menu-heading" className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="home-menu-heading" className="font-editorial text-2xl">Repas prévus</h2>
            <Link href="/Menu" className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-blue">Voir le menu</Link>
          </div>
          {!householdLoaded && <p className="rounded-lg border border-border bg-white p-4 text-sm text-muted">Chargement du menu…</p>}
          {householdLoaded && plannedMeals.length === 0 && <Link href="/Recettes" className="flex min-h-16 items-center justify-center rounded-lg border border-dashed border-blue/40 bg-white px-4 text-sm font-medium text-blue">Ajouter une recette au menu</Link>}
          <div className="space-y-2">
            {plannedMeals.map((meal) => {
              const recipe = recipes.find((item) => item.id === meal.recipeId);
              return <Link key={meal.id} href={recipe ? `/Recettes/${recipe.id}` : "/Menu"} className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-2"><span className="min-w-0 truncate text-sm font-medium">{recipe?.title ?? "Recette supprimée"}</span><span className="shrink-0 text-xs text-muted">{meal.servings} pers.</span></Link>;
            })}
          </div>
        </section>

        <section aria-labelledby="home-shortcuts-heading" className="mt-8">
          <h2 id="home-shortcuts-heading" className="mb-3 font-editorial text-2xl">Au quotidien</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/Courses" className="flex min-h-24 flex-col justify-between rounded-lg border border-border bg-white p-4 transition hover:border-blue/50">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue">Courses</span>
              <span className="font-medium">{householdLoaded ? needToBuy === 0 ? "Liste à jour" : `${needToBuy} à acheter` : "Chargement…"}</span>
            </Link>
            <Link href="/Cadeaux" className="flex min-h-24 flex-col justify-between rounded-lg border border-border bg-white p-4 transition hover:border-blue/50">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue">Cadeaux</span>
              <span className="font-medium">Mes idées</span>
            </Link>
          </div>
        </section>
      </div>
      <RecipeNavigation />
    </main>
  );
}