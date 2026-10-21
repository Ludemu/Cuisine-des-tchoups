"use client";

import { useState, type FormEvent } from "react";
import type { Recipe, RecipeCategory, RecipeDraft, RecipeIngredient } from "@/lib/recipes";
import { RecipeIcon } from "@/components/RecipeIcon";
import { RecipePhoto } from "@/components/RecipePhoto";

const categories: RecipeCategory[] = ["Entrée", "Plat", "Dessert", "Soupe", "Brunch"];
const inputClass = "min-h-12 w-full rounded-md border border-border bg-white px-3 text-base text-foreground placeholder:text-muted/70 focus:border-blue focus:outline-none";
const emptyIngredient = (id: string): RecipeIngredient => ({ id, name: "", quantity: "", unit: "" });

function createEmptyDraft(): RecipeDraft {
  return {
    title: "",
    category: "Plat",
    servings: 4,
    prepTimeMinutes: null,
    cookTimeMinutes: null,
    ingredients: [emptyIngredient("ingredient-initial")],
    steps: [""],
    tags: [],
    photos: [],
  };
}

async function compressPhoto(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Impossible de traiter cette image.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.78);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function RecipeForm({
  initialRecipe,
  onSave,
}: {
  initialRecipe?: Recipe;
  onSave: (draft: RecipeDraft) => boolean;
}) {
  const [form, setForm] = useState<RecipeDraft>(() => {
    if (!initialRecipe) return createEmptyDraft();
    return structuredClone({
      title: initialRecipe.title,
      category: initialRecipe.category,
      servings: initialRecipe.servings,
      prepTimeMinutes: initialRecipe.prepTimeMinutes,
      cookTimeMinutes: initialRecipe.cookTimeMinutes,
      ingredients: initialRecipe.ingredients,
      steps: initialRecipe.steps,
      tags: initialRecipe.tags,
      photos: initialRecipe.photos,
    });
  });
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateIngredient = (id: string, key: keyof RecipeIngredient, value: string) => {
    updateField(
      "ingredients",
      form.ingredients.map((ingredient) => ingredient.id === id ? { ...ingredient, [key]: value } : ingredient),
    );
  };

  const updateStep = (index: number, value: string) => {
    updateField("steps", form.steps.map((step, stepIndex) => stepIndex === index ? value : step));
  };

  const handlePhotoChange = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoError("");

    try {
      const availableSlots = Math.max(0, 3 - form.photos.length);
      const selectedFiles = Array.from(files).slice(0, availableSlots);
      const newPhotos = await Promise.all(selectedFiles.map(compressPhoto));
      updateField("photos", [...form.photos, ...newPhotos]);
      if (files.length > availableSlots) setPhotoError("Trois photos maximum par recette.");
    } catch {
      setPhotoError("Cette photo n’a pas pu être ajoutée. Essayez un autre fichier.");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const ingredients = form.ingredients
      .map((ingredient) => ({ ...ingredient, name: ingredient.name.trim(), quantity: ingredient.quantity.trim(), unit: ingredient.unit.trim() }))
      .filter((ingredient) => ingredient.name);

    if (ingredients.length === 0) {
      setError("Ajoutez au moins un ingrédient.");
      return;
    }

    if (ingredients.some((ingredient) => !ingredient.quantity || !ingredient.unit)) {
      setError("Complétez la quantité et l’unité de chaque ingrédient.");
      return;
    }

    setIsSaving(true);
    const saved = onSave({
      ...form,
      title: form.title.trim(),
      servings: Math.max(1, Number(form.servings) || 1),
      ingredients,
      steps: form.steps.map((step) => step.trim()).filter(Boolean),
      tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
    });
    if (!saved) {
      setIsSaving(false);
      setError("La recette n’a pas pu être enregistrée. L’espace de stockage est peut-être plein.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7 pb-4">
      <section className="space-y-4">
        <h2 className="font-editorial text-2xl">La recette</h2>
        <label className="block space-y-1.5 text-sm font-medium">
          <span>Titre <span className="text-blue">*</span></span>
          <input
            required
            autoFocus
            maxLength={100}
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Ex. Spaghetti carbonara"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Type</span>
            <select value={form.category} onChange={(event) => updateField("category", event.target.value as RecipeCategory)} className={inputClass}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Portions</span>
            <input type="number" min="1" max="100" inputMode="numeric" value={form.servings} onChange={(event) => updateField("servings", Number(event.target.value))} className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Préparation <span className="font-normal text-muted">(min)</span></span>
            <input type="number" min="0" max="1440" inputMode="numeric" placeholder="—" value={form.prepTimeMinutes ?? ""} onChange={(event) => updateField("prepTimeMinutes", event.target.value ? Number(event.target.value) : null)} className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Cuisson <span className="font-normal text-muted">(min)</span></span>
            <input type="number" min="0" max="1440" inputMode="numeric" placeholder="—" value={form.cookTimeMinutes ?? ""} onChange={(event) => updateField("cookTimeMinutes", event.target.value ? Number(event.target.value) : null)} className={inputClass} />
          </label>
        </div>

        <label className="block space-y-1.5 text-sm font-medium">
          <span>Catégories et caractéristiques <span className="font-normal text-muted">(séparées par des virgules)</span></span>
          <input value={form.tags.join(", ")} onChange={(event) => updateField("tags", event.target.value.split(","))} placeholder="Ex. végétarien, rapide" className={inputClass} />
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-editorial text-2xl">Ingrédients</h2>
            <p className="mt-1 text-xs text-muted">Une ligne par ingrédient</p>
          </div>
          <button type="button" onClick={() => updateField("ingredients", [...form.ingredients, emptyIngredient(crypto.randomUUID())])} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-sm font-medium text-blue hover:bg-blue-light">
            <RecipeIcon name="plus" className="size-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {form.ingredients.map((ingredient, index) => (
            <fieldset key={ingredient.id} className="rounded-lg border border-border bg-white p-3">
              <legend className="sr-only">Ingrédient {index + 1}</legend>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Ingrédient {index + 1}</span>
                <button type="button" aria-label={`Supprimer l’ingrédient ${index + 1}`} onClick={() => updateField("ingredients", form.ingredients.filter((item) => item.id !== ingredient.id))} className="grid size-11 place-items-center rounded-md text-muted hover:bg-blue-light hover:text-blue">
                  <RecipeIcon name="trash" className="size-4" />
                </button>
              </div>
              <input aria-label={`Nom de l’ingrédient ${index + 1}`} value={ingredient.name} onChange={(event) => updateIngredient(ingredient.id, "name", event.target.value)} placeholder="Ex. Spaghetti" className={inputClass} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input aria-label={`Quantité de l’ingrédient ${index + 1}`} value={ingredient.quantity} onChange={(event) => updateIngredient(ingredient.id, "quantity", event.target.value)} placeholder="Quantité" inputMode="decimal" className={inputClass} />
                <input aria-label={`Unité de l’ingrédient ${index + 1}`} value={ingredient.unit} onChange={(event) => updateIngredient(ingredient.id, "unit", event.target.value)} placeholder="Unité (g, ml…)" className={inputClass} />
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-editorial text-2xl">Préparation</h2>
            <p className="mt-1 text-xs text-muted">Les étapes dans l’ordre</p>
          </div>
          <button type="button" onClick={() => updateField("steps", [...form.steps, ""])} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-sm font-medium text-blue hover:bg-blue-light">
            <RecipeIcon name="plus" className="size-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {form.steps.map((step, index) => (
            <div key={`step-${index}`} className="flex gap-3 rounded-lg border border-border bg-white p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-light text-sm font-semibold text-blue">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <label htmlFor={`step-${index}`} className="sr-only">Étape {index + 1}</label>
                <textarea id={`step-${index}`} rows={3} value={step} onChange={(event) => updateStep(index, event.target.value)} placeholder="Décrivez cette étape…" className="min-h-24 w-full resize-y rounded-md border border-border bg-white p-3 text-base text-foreground placeholder:text-muted/70 focus:border-blue focus:outline-none" />
              </div>
              <button type="button" aria-label={`Supprimer l’étape ${index + 1}`} onClick={() => updateField("steps", form.steps.filter((_, stepIndex) => stepIndex !== index))} className="grid size-11 shrink-0 place-items-center rounded-md text-muted hover:bg-blue-light hover:text-blue">
                <RecipeIcon name="trash" className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-editorial text-2xl">Photos</h2>
          <p className="mt-1 text-xs text-muted">Jusqu’à 3 photos, enregistrées sur cet appareil.</p>
        </div>
        <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-blue/40 bg-white px-4 text-sm font-medium text-blue hover:bg-blue-light">
          <RecipeIcon name="image" className="size-5" />
          Ajouter des photos
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { void handlePhotoChange(event.target.files); event.target.value = ""; }} />
        </label>
        {photoError && <p role="status" className="text-sm text-blue">{photoError}</p>}
        {form.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {form.photos.map((photo, index) => (
              <div key={`photo-${index}`} className="relative">
                <RecipePhoto src={photo} title={`Photo ${index + 1}`} className="aspect-square rounded-md" />
                <button type="button" aria-label={`Supprimer la photo ${index + 1}`} onClick={() => updateField("photos", form.photos.filter((_, photoIndex) => photoIndex !== index))} className="absolute right-1 top-1 grid size-9 place-items-center rounded-full bg-white/95 text-muted shadow-sm">
                  <RecipeIcon name="close" className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p role="alert" className="rounded-md bg-blue-light px-4 py-3 text-sm text-foreground">{error}</p>}

      <div className="sticky bottom-20 z-10 -mx-5 border-t border-border bg-background/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <button type="submit" disabled={isSaving} className="min-h-14 w-full rounded-md bg-blue px-5 text-base font-semibold text-white transition hover:bg-primary disabled:opacity-60">
          {isSaving ? "Enregistrement…" : initialRecipe ? "Enregistrer les modifications" : "Enregistrer la recette"}
        </button>
      </div>
    </form>
  );
}