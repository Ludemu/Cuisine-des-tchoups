"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { RecipeIcon } from "@/components/RecipeIcon";
import { RecipeNavigation } from "@/components/RecipeNavigation";
import { useHousehold } from "@/lib/useHousehold";
import { useRecipes } from "@/lib/useRecipes";
import { removeShoppingItem, saveHousehold, type ShoppingItem } from "@/lib/household";
import { generateShoppingItems } from "@/lib/groceries";

export function GroceryList() {
  const { household, isLoaded: householdLoaded } = useHousehold();
  const { recipes, isLoaded: recipesLoaded } = useRecipes();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [message, setMessage] = useState("");
  const isLoaded = householdLoaded && recipesLoaded;
  const neededItems = household.shoppingItems.filter((item) => !item.checked);
  const purchasedItems = household.shoppingItems.filter((item) => item.checked);

  const updateItem = (itemId: string, update: Partial<ShoppingItem>) => {
    saveHousehold({
      ...household,
      shoppingItems: household.shoppingItems.map((item) => item.id === itemId ? { ...item, ...update } : item),
    });
  };

  const generateList = () => {
    const shoppingItems = generateShoppingItems(household.plannedMeals, recipes, household.shoppingItems);
    if (saveHousehold({ ...household, shoppingItems })) setMessage("Liste recalculée à partir des repas prévus.");
    else setMessage("La liste n’a pas pu être enregistrée sur cet appareil.");
  };

  const addManualItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const item: ShoppingItem = {
      id: crypto.randomUUID(),
      name: trimmedName,
      quantity: quantity.trim(),
      unit: unit.trim(),
      checked: false,
      manual: true,
    };
    if (saveHousehold({ ...household, shoppingItems: [...household.shoppingItems, item] })) {
      setName("");
      setQuantity("");
      setUnit("");
      setMessage("Article ajouté.");
    } else setMessage("L’article n’a pas pu être enregistré sur cet appareil.");
  };

  const deleteItem = (itemId: string) => {
    saveHousehold(removeShoppingItem(household, itemId));
  };

  const itemRow = (item: ShoppingItem) => (
    <li key={item.id} className={`flex min-h-14 items-center gap-3 border-b border-border/70 py-2 last:border-b-0 ${item.checked ? "text-muted" : "text-foreground"}`}>
      <label className="flex min-h-11 min-w-0 flex-1 items-center gap-3">
        <input type="checkbox" checked={item.checked} onChange={(event) => updateItem(item.id, { checked: event.target.checked })} className="size-5 shrink-0 accent-[#31546B]" />
        <span className={`min-w-0 flex-1 text-sm ${item.checked ? "line-through" : ""}`}>{item.name}{item.manual && <span className="ml-2 text-[10px] uppercase tracking-wide text-muted">Ajout manuel</span>}</span>
        {(item.quantity || item.unit) && <span className="shrink-0 text-sm font-medium text-muted">{[item.quantity, item.unit].filter(Boolean).join(" ")}</span>}
      </label>
      <button type="button" onClick={() => deleteItem(item.id)} aria-label={`Retirer ${item.name} de la liste, déjà disponible`} title="Retirer de la liste" className="grid size-11 shrink-0 place-items-center rounded-md text-muted hover:bg-blue-light hover:text-blue">
        <RecipeIcon name="close" className="size-4" />
      </button>
    </li>
  );

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto min-h-screen max-w-2xl px-4 pb-32 pt-8 sm:px-8 sm:pt-12">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">La cuisine des Tchoups</p>
          <h1 className="mt-3 font-editorial text-4xl sm:text-5xl">Courses</h1>
          <p className="mt-2 text-sm text-muted">Les quantités suivent les portions des repas prévus.</p>
        </header>

        <div className="mb-5 flex gap-2">
          <button type="button" onClick={generateList} disabled={!household.plannedMeals.length} className="min-h-12 flex-1 rounded-md bg-blue px-3 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-45">Générer depuis le menu</button>
          <Link href="/Menu" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-semibold text-blue">Menu</Link>
        </div>
        {message && <p role="status" className="mb-4 rounded-md bg-blue-light px-3 py-2 text-sm text-primary">{message}</p>}

        {!isLoaded && <p className="rounded-lg border border-border bg-white p-5 text-sm text-muted">Chargement de la liste…</p>}
        {isLoaded && household.shoppingItems.length === 0 && (
          <div className="mb-5 rounded-lg border border-border bg-white px-5 py-7 text-center">
            <h2 className="font-editorial text-2xl">Votre liste est vide</h2>
            <p className="mt-2 text-sm text-muted">Générez-la depuis les repas prévus ou ajoutez un article.</p>
            {!household.plannedMeals.length && <Link href="/Menu" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-blue">Voir les repas prévus</Link>}
          </div>
        )}

        {neededItems.length > 0 && (
          <section aria-labelledby="needed-heading" className="mb-6 rounded-lg border border-border bg-white px-4">
            <h2 id="needed-heading" className="flex min-h-12 items-center justify-between border-b border-border font-editorial text-xl">
              À acheter <span className="font-sans text-xs text-muted">{neededItems.length}</span>
            </h2>
            <ul>{neededItems.map(itemRow)}</ul>
          </section>
        )}

        {purchasedItems.length > 0 && (
          <section aria-labelledby="purchased-heading" className="mb-6 rounded-lg border border-border bg-white px-4">
            <h2 id="purchased-heading" className="flex min-h-12 items-center justify-between border-b border-border font-editorial text-xl">
              Dans le panier <span className="font-sans text-xs text-muted">{purchasedItems.length}</span>
            </h2>
            <ul>{purchasedItems.map(itemRow)}</ul>
          </section>
        )}

        <section className="rounded-lg border border-border bg-white p-4">
          <h2 className="font-editorial text-xl">Ajouter un article</h2>
          <form onSubmit={addManualItem} className="mt-3 space-y-2">
            <label className="sr-only" htmlFor="manual-item-name">Article</label>
            <input id="manual-item-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Café" className="min-h-12 w-full rounded-md border border-border px-3 text-base focus:border-blue focus:outline-none" />
            <div className="grid grid-cols-[1fr_1.2fr] gap-2">
              <label className="sr-only" htmlFor="manual-item-quantity">Quantité</label>
              <input id="manual-item-quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Quantité" inputMode="decimal" className="min-h-12 min-w-0 rounded-md border border-border px-3 text-base focus:border-blue focus:outline-none" />
              <label className="sr-only" htmlFor="manual-item-unit">Unité</label>
              <input id="manual-item-unit" value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="Unité (paquet, g…)" className="min-h-12 min-w-0 rounded-md border border-border px-3 text-base focus:border-blue focus:outline-none" />
            </div>
            <button type="submit" className="min-h-12 w-full rounded-md border border-blue text-sm font-semibold text-blue hover:bg-blue-light">Ajouter à la liste</button>
          </form>
        </section>
      </div>
      <RecipeNavigation />
    </main>
  );
}